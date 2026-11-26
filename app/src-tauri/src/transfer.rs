use crate::discovery::{PeerDevice, PROTOCOL_VERSION};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::fs::{self, File};
use tokio::io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt, SeekFrom};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{broadcast, oneshot, RwLock};

pub const TRANSFER_PORT: u16 = 53319;
pub const CHUNK_SIZE: usize = 256 * 1024; // 256 KB memory-efficient chunk buffer
pub const MAGIC_BYTES: &[u8; 4] = b"APON";

pub const FRAME_HANDSHAKE: u8 = 0x01;
pub const FRAME_HANDSHAKE_ACK: u8 = 0x02;
pub const FRAME_MANIFEST: u8 = 0x03;
pub const FRAME_ACCEPT: u8 = 0x04;
pub const FRAME_CHUNK: u8 = 0x05;
pub const FRAME_ITEM_COMPLETE: u8 = 0x06;
pub const FRAME_TRANSFER_COMPLETE: u8 = 0x07;
pub const FRAME_CANCEL: u8 = 0x08;
pub const FRAME_TEXT: u8 = 0x09;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureSet {
    pub supports_multi_file: bool,
    pub supports_folder_stream: bool,
    pub supports_text: bool,
}

impl Default for FeatureSet {
    fn default() -> Self {
        Self {
            supports_multi_file: true,
            supports_folder_stream: true,
            supports_text: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandshakeRequest {
    pub protocol_version: u32,
    pub client_version: String,
    pub sender_id: String,
    pub sender_name: String,
    pub features: FeatureSet,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandshakeResponse {
    pub accepted: bool,
    pub protocol_version: u32,
    pub agreed_features: FeatureSet,
    pub receiver_id: String,
    pub receiver_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferItem {
    pub index: usize,
    pub name: String,
    pub relative_path: String,
    pub size: u64,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferManifest {
    pub transfer_id: String,
    pub transfer_type: String, // "file", "text", "folder"
    pub total_size: u64,
    pub items: Vec<TransferItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferAcceptPayload {
    pub transfer_id: String,
    pub accepted: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferProgressPayload {
    pub transfer_id: String,
    pub recipient_id: String,
    pub file_name: String,
    pub bytes_transferred: u64,
    pub total_bytes: u64,
    pub speed_mbps: f64,
    pub speed_formatted: String,
    pub eta_seconds: u64,
    pub progress_percent: u32,
    pub status: String, // "transferring", "verifying", "completed", "cancelled", "error"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncomingTransferNotification {
    pub transfer_id: String,
    pub sender_id: String,
    pub sender_name: String,
    pub sender_ip: String,
    pub transfer_type: String, // "file" or "text"
    pub file_name: String,
    pub file_size: String,
    pub total_bytes: u64,
    pub text_content: Option<String>,
}

#[derive(Clone)]
pub struct TransferEngine {
    pub device_id: String,
    pub device_name: Arc<RwLock<String>>,
    pub download_folder: Arc<RwLock<PathBuf>>,
    pub auto_accept: Arc<RwLock<bool>>,
    pub active_transfers: Arc<RwLock<HashMap<String, broadcast::Sender<()>>>>,
    pub pending_incoming: Arc<RwLock<HashMap<String, (TransferManifest, oneshot::Sender<bool>)>>>,
    pub app_handle: Arc<RwLock<Option<AppHandle>>>,
}

impl TransferEngine {
    pub fn new(device_id: String, initial_name: String) -> Self {
        let download_dir = dirs_or_fallback();
        Self {
            device_id,
            device_name: Arc::new(RwLock::new(initial_name)),
            download_folder: Arc::new(RwLock::new(download_dir)),
            auto_accept: Arc::new(RwLock::new(false)),
            active_transfers: Arc::new(RwLock::new(HashMap::new())),
            pending_incoming: Arc::new(RwLock::new(HashMap::new())),
            app_handle: Arc::new(RwLock::new(None)),
        }
    }

    pub fn set_app_handle(&self, handle: AppHandle) {
        let engine = self.clone();
        tokio::spawn(async move {
            let mut h = engine.app_handle.write().await;
            *h = Some(handle);
        });
    }

    pub fn start(&self) {
        let engine = self.clone();
        tokio::spawn(async move {
            let addr: SocketAddr = format!("0.0.0.0:{}", TRANSFER_PORT).parse().unwrap();
            let listener = match TcpListener::bind(addr).await {
                Ok(l) => {
                    println!("[Apon Transfer] P2P Stream listener bound on port {}", TRANSFER_PORT);
                    l
                }
                Err(e) => {
                    eprintln!("[Apon Transfer] Failed to bind transfer listener on {}: {}", TRANSFER_PORT, e);
                    return;
                }
            };

            while let Ok((stream, peer_addr)) = listener.accept().await {
                let eng = engine.clone();
                tokio::spawn(async move {
                    if let Err(e) = eng.handle_incoming_connection(stream, peer_addr).await {
                        eprintln!("[Apon Transfer] Connection from {} error: {}", peer_addr, e);
                    }
                });
            }
        });
    }

    pub async fn handle_incoming_connection(&self, mut stream: TcpStream, peer_addr: SocketAddr) -> Result<(), String> {
        // Read Handshake frame
        let (frame_type, payload) = read_frame(&mut stream).await?;
        if frame_type != FRAME_HANDSHAKE {
            return Err(format!("Expected handshake frame, got: {}", frame_type));
        }

        let handshake_req: HandshakeRequest = serde_json::from_slice(&payload)
            .map_err(|e| format!("Invalid handshake json: {}", e))?;

        // Version & Feature Downgrade Negotiation
        let agreed_version = std::cmp::min(handshake_req.protocol_version, PROTOCOL_VERSION);
        let my_features = FeatureSet::default();
        let agreed_features = FeatureSet {
            supports_multi_file: handshake_req.features.supports_multi_file && my_features.supports_multi_file,
            supports_folder_stream: handshake_req.features.supports_folder_stream && my_features.supports_folder_stream,
            supports_text: handshake_req.features.supports_text && my_features.supports_text,
        };

        let my_name = self.device_name.read().await.clone();
        let handshake_res = HandshakeResponse {
            accepted: true,
            protocol_version: agreed_version,
            agreed_features,
            receiver_id: self.device_id.clone(),
            receiver_name: my_name.clone(),
        };

        let ack_bytes = serde_json::to_vec(&handshake_res).map_err(|e| e.to_string())?;
        write_frame(&mut stream, FRAME_HANDSHAKE_ACK, &ack_bytes).await?;

        // Next frame can be Text or File Manifest
        let (next_type, next_payload) = read_frame(&mut stream).await?;

        if next_type == FRAME_TEXT {
            // Instant plain text transfer
            let text_content = String::from_utf8_lossy(&next_payload).to_string();
            let notification = IncomingTransferNotification {
                transfer_id: uuid::Uuid::new_v4().to_string(),
                sender_id: handshake_req.sender_id,
                sender_name: handshake_req.sender_name,
                sender_ip: peer_addr.ip().to_string(),
                transfer_type: "text".into(),
                file_name: "Clipboard Snippet".into(),
                file_size: format!("{} chars", text_content.len()),
                total_bytes: text_content.len() as u64,
                text_content: Some(text_content),
            };

            self.emit_incoming(notification).await;
            return Ok(());
        }

        if next_type != FRAME_MANIFEST {
            return Err(format!("Expected Manifest frame, got: {}", next_type));
        }

        let manifest: TransferManifest = serde_json::from_slice(&next_payload)
            .map_err(|e| format!("Invalid manifest JSON: {}", e))?;

        let first_file_name = manifest.items.first().map(|i| i.name.clone()).unwrap_or_else(|| "File".into());
        let notification = IncomingTransferNotification {
            transfer_id: manifest.transfer_id.clone(),
            sender_id: handshake_req.sender_id.clone(),
            sender_name: handshake_req.sender_name.clone(),
            sender_ip: peer_addr.ip().to_string(),
            transfer_type: manifest.transfer_type.clone(),
            file_name: if manifest.items.len() > 1 {
                format!("{} (and {} more files)", first_file_name, manifest.items.len() - 1)
            } else {
                first_file_name.clone()
            },
            file_size: format_size(manifest.total_size),
            total_bytes: manifest.total_size,
            text_content: None,
        };

        // Check auto_accept
        let is_auto_accept = *self.auto_accept.read().await;
        let accepted = if is_auto_accept {
            println!("[Apon Transfer] Auto-accepting transfer from trusted peer: {}", handshake_req.sender_name);
            true
        } else {
            // Emit notification to UI and await user response
            let (tx, rx) = oneshot::channel();
            {
                let mut pending = self.pending_incoming.write().await;
                pending.insert(manifest.transfer_id.clone(), (manifest.clone(), tx));
            }

            self.emit_incoming(notification).await;

            // Wait for user click in IncomingSheet (up to 60s timeout)
            match tokio::time::timeout(Duration::from_secs(60), rx).await {
                Ok(Ok(user_accept)) => user_accept,
                _ => false,
            }
        };

        // Send Acceptance frame
        let accept_payload = TransferAcceptPayload {
            transfer_id: manifest.transfer_id.clone(),
            accepted,
        };
        let accept_bytes = serde_json::to_vec(&accept_payload).map_err(|e| e.to_string())?;
        write_frame(&mut stream, FRAME_ACCEPT, &accept_bytes).await?;

        if !accepted {
            println!("[Apon Transfer] Transfer rejected by user: {}", manifest.transfer_id);
            return Ok(());
        }

        // Receive File Chunks directly to disk
        let base_download_dir = self.download_folder.read().await.clone();
        fs::create_dir_all(&base_download_dir).await.map_err(|e| e.to_string())?;

        let mut total_received: u64 = 0;
        let start_time = Instant::now();
        let mut last_emit = Instant::now();

        for item in &manifest.items {
            let part_path = base_download_dir.join(format!("{}.apon_part", item.name));
            let final_path = base_download_dir.join(&item.name);

            let mut out_file = File::create(&part_path).await.map_err(|e| e.to_string())?;
            let mut hasher = Sha256::new();
            let mut item_received: u64 = 0;

            while item_received < item.size {
                let (f_type, f_data) = read_frame(&mut stream).await?;
                if f_type == FRAME_CANCEL {
                    println!("[Apon Transfer] Transfer cancelled by sender");
                    let _ = fs::remove_file(&part_path).await;
                    return Ok(());
                }

                if f_type != FRAME_CHUNK {
                    return Err(format!("Expected chunk frame, got: {}", f_type));
                }

                out_file.write_all(&f_data).await.map_err(|e| e.to_string())?;
                hasher.update(&f_data);
                item_received += f_data.len() as u64;
                total_received += f_data.len() as u64;

                // Emit progress every 200ms
                if last_emit.elapsed() >= Duration::from_millis(200) || total_received >= manifest.total_size {
                    let elapsed = start_time.elapsed().as_secs_f64().max(0.001);
                    let speed_bps = total_received as f64 / elapsed;
                    let speed_mbps = speed_bps / (1024.0 * 1024.0);
                    let remaining_bytes = manifest.total_size.saturating_sub(total_received);
                    let eta = if speed_bps > 0.0 {
                        (remaining_bytes as f64 / speed_bps).ceil() as u64
                    } else {
                        0
                    };
                    let percent = ((total_received as f64 / manifest.total_size.max(1) as f64) * 100.0) as u32;

                    self.emit_progress(TransferProgressPayload {
                        transfer_id: manifest.transfer_id.clone(),
                        recipient_id: self.device_id.clone(),
                        file_name: item.name.clone(),
                        bytes_transferred: total_received,
                        total_bytes: manifest.total_size,
                        speed_mbps,
                        speed_formatted: format!("{:.1} MB/s", speed_mbps),
                        eta_seconds: eta,
                        progress_percent: percent.min(100),
                        status: "transferring".into(),
                    }).await;

                    last_emit = Instant::now();
                }
            }

            out_file.flush().await.map_err(|e| e.to_string())?;
            drop(out_file);

            // SHA-256 Integrity Verification
            let calculated_hash = format!("{:x}", hasher.finalize());
            if !item.sha256.is_empty() && calculated_hash != item.sha256 {
                eprintln!("[Apon Transfer] SHA-256 verification failed for {}! (Expected: {}, Got: {})", item.name, item.sha256, calculated_hash);
                let _ = fs::remove_file(&part_path).await;
                return Err("Integrity verification failed".into());
            }

            // Atomic rename from .apon_part to final file
            fs::rename(&part_path, &final_path).await.map_err(|e| e.to_string())?;
            println!("[Apon Transfer] Successfully saved and verified: {:?}", final_path);
        }

        // Final completion event
        let elapsed = start_time.elapsed().as_secs_f64().max(0.001);
        let final_speed = (manifest.total_size as f64 / elapsed) / (1024.0 * 1024.0);
        self.emit_progress(TransferProgressPayload {
            transfer_id: manifest.transfer_id.clone(),
            recipient_id: self.device_id.clone(),
            file_name: first_file_name,
            bytes_transferred: manifest.total_size,
            total_bytes: manifest.total_size,
            speed_mbps: final_speed,
            speed_formatted: format!("{:.1} MB/s", final_speed),
            eta_seconds: 0,
            progress_percent: 100,
            status: "completed".into(),
        }).await;

        Ok(())
    }

    /// Client: Multi-Target File Broadcast or Single Target Stream
    pub async fn send_files(&self, target_peers: Vec<PeerDevice>, file_paths: Vec<String>) -> Result<String, String> {
        if target_peers.is_empty() {
            return Err("No destination peers specified".into());
        }
        if file_paths.is_empty() {
            return Err("No files selected to transfer".into());
        }

        let transfer_id = uuid::Uuid::new_v4().to_string();
        let (cancel_tx, _) = broadcast::channel(1);
        {
            let mut active = self.active_transfers.write().await;
            active.insert(transfer_id.clone(), cancel_tx);
        }

        // Build Manifest with SHA-256
        let mut items = Vec::new();
        let mut total_size: u64 = 0;

        for (idx, path_str) in file_paths.iter().enumerate() {
            let path = PathBuf::from(path_str);
            let metadata = fs::metadata(&path).await.map_err(|e| format!("File not found {}: {}", path_str, e))?;
            let size = metadata.len();
            total_size += size;

            // Stream calculate SHA-256
            let mut file = File::open(&path).await.map_err(|e| e.to_string())?;
            let mut hasher = Sha256::new();
            let mut buf = vec![0u8; CHUNK_SIZE];
            loop {
                let n = file.read(&mut buf).await.map_err(|e| e.to_string())?;
                if n == 0 {
                    break;
                }
                hasher.update(&buf[..n]);
            }
            let hash_str = format!("{:x}", hasher.finalize());

            let name = path.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_else(|| format!("file_{}", idx));

            items.push(TransferItem {
                index: idx,
                name,
                relative_path: path_str.clone(),
                size,
                sha256: hash_str,
            });
        }

        let manifest = TransferManifest {
            transfer_id: transfer_id.clone(),
            transfer_type: if items.len() > 1 { "files".into() } else { "file".into() },
            total_size,
            items,
        };

        // Multi-device broadcast: stream concurrently to each recipient
        for peer in target_peers {
            let engine = self.clone();
            let m = manifest.clone();
            let p_paths = file_paths.clone();
            let p_id = peer.id.clone();
            let p_ip = peer.ip.clone();
            let p_port = TRANSFER_PORT;

            tokio::spawn(async move {
                if let Err(e) = engine.stream_to_peer(&p_id, &p_ip, p_port, m, p_paths).await {
                    eprintln!("[Apon Transfer] Stream to {} ({}) failed: {}", p_id, p_ip, e);
                }
            });
        }

        Ok(transfer_id)
    }

    /// Client: Stream to individual peer
    async fn stream_to_peer(
        &self,
        peer_id: &str,
        peer_ip: &str,
        peer_port: u16,
        manifest: TransferManifest,
        file_paths: Vec<String>,
    ) -> Result<(), String> {
        let addr: SocketAddr = format!("{}:{}", peer_ip, peer_port)
            .parse()
            .map_err(|e| format!("Invalid peer address: {}", e))?;

        let mut stream = tokio::time::timeout(Duration::from_secs(5), TcpStream::connect(addr))
            .await
            .map_err(|_| "Connection timed out".to_string())?
            .map_err(|e| format!("Failed to connect to peer stream: {}", e))?;

        let my_name = self.device_name.read().await.clone();
        let handshake_req = HandshakeRequest {
            protocol_version: PROTOCOL_VERSION,
            client_version: "1.0.0".into(),
            sender_id: self.device_id.clone(),
            sender_name: my_name,
            features: FeatureSet::default(),
        };

        let req_bytes = serde_json::to_vec(&handshake_req).map_err(|e| e.to_string())?;
        write_frame(&mut stream, FRAME_HANDSHAKE, &req_bytes).await?;

        // Read Handshake Ack
        let (ack_type, ack_payload) = read_frame(&mut stream).await?;
        if ack_type != FRAME_HANDSHAKE_ACK {
            return Err("Expected handshake ACK".into());
        }
        let handshake_ack: HandshakeResponse = serde_json::from_slice(&ack_payload).map_err(|e| e.to_string())?;

        // Check if receiver supports multi-file
        let agreed_multi_file = handshake_ack.agreed_features.supports_multi_file;

        // Send Manifest
        let manifest_bytes = serde_json::to_vec(&manifest).map_err(|e| e.to_string())?;
        write_frame(&mut stream, FRAME_MANIFEST, &manifest_bytes).await?;

        // Wait for Accept
        let (accept_type, accept_payload) = read_frame(&mut stream).await?;
        if accept_type != FRAME_ACCEPT {
            return Err("Expected Accept frame".into());
        }
        let accept_res: TransferAcceptPayload = serde_json::from_slice(&accept_payload).map_err(|e| e.to_string())?;
        if !accept_res.accepted {
            self.emit_progress(TransferProgressPayload {
                transfer_id: manifest.transfer_id.clone(),
                recipient_id: peer_id.to_string(),
                file_name: manifest.items[0].name.clone(),
                bytes_transferred: 0,
                total_bytes: manifest.total_size,
                speed_mbps: 0.0,
                speed_formatted: "0.0 MB/s".into(),
                eta_seconds: 0,
                progress_percent: 0,
                status: "cancelled".into(),
            }).await;
            return Ok(());
        }

        // Stream file chunks
        let mut total_sent: u64 = 0;
        let start_time = Instant::now();
        let mut last_emit = Instant::now();

        for (idx, item) in manifest.items.iter().enumerate() {
            let path_str = &file_paths[idx];
            let mut file = File::open(path_str).await.map_err(|e| e.to_string())?;
            let mut buffer = vec![0u8; CHUNK_SIZE];

            loop {
                let n = file.read(&mut buffer).await.map_err(|e| e.to_string())?;
                if n == 0 {
                    break;
                }

                write_frame(&mut stream, FRAME_CHUNK, &buffer[..n]).await?;
                total_sent += n as u64;

                if last_emit.elapsed() >= Duration::from_millis(200) || total_sent >= manifest.total_size {
                    let elapsed = start_time.elapsed().as_secs_f64().max(0.001);
                    let speed_bps = total_sent as f64 / elapsed;
                    let speed_mbps = speed_bps / (1024.0 * 1024.0);
                    let remaining = manifest.total_size.saturating_sub(total_sent);
                    let eta = if speed_bps > 0.0 {
                        (remaining as f64 / speed_bps).ceil() as u64
                    } else {
                        0
                    };
                    let percent = ((total_sent as f64 / manifest.total_size.max(1) as f64) * 100.0) as u32;

                    self.emit_progress(TransferProgressPayload {
                        transfer_id: manifest.transfer_id.clone(),
                        recipient_id: peer_id.to_string(),
                        file_name: item.name.clone(),
                        bytes_transferred: total_sent,
                        total_bytes: manifest.total_size,
                        speed_mbps,
                        speed_formatted: format!("{:.1} MB/s", speed_mbps),
                        eta_seconds: eta,
                        progress_percent: percent.min(100),
                        status: "transferring".into(),
                    }).await;

                    last_emit = Instant::now();
                }
            }
        }

        // Completed
        let elapsed = start_time.elapsed().as_secs_f64().max(0.001);
        let final_speed = (manifest.total_size as f64 / elapsed) / (1024.0 * 1024.0);
        self.emit_progress(TransferProgressPayload {
            transfer_id: manifest.transfer_id.clone(),
            recipient_id: peer_id.to_string(),
            file_name: manifest.items[0].name.clone(),
            bytes_transferred: manifest.total_size,
            total_bytes: manifest.total_size,
            speed_mbps: final_speed,
            speed_formatted: format!("{:.1} MB/s", final_speed),
            eta_seconds: 0,
            progress_percent: 100,
            status: "completed".into(),
        }).await;

        Ok(())
    }

    /// Client: Send plain-text / clipboard snippet to target peers
    pub async fn send_text(&self, target_peers: Vec<PeerDevice>, text: String) -> Result<String, String> {
        if target_peers.is_empty() {
            return Err("No destination peers specified".into());
        }

        let transfer_id = uuid::Uuid::new_v4().to_string();

        for peer in target_peers {
            let engine = self.clone();
            let t = text.clone();
            let p_ip = peer.ip.clone();
            let p_port = TRANSFER_PORT;

            tokio::spawn(async move {
                let addr: SocketAddr = match format!("{}:{}", p_ip, p_port).parse() {
                    Ok(a) => a,
                    Err(_) => return,
                };

                let mut stream = match TcpStream::connect(addr).await {
                    Ok(s) => s,
                    Err(_) => return,
                };

                let my_name = engine.device_name.read().await.clone();
                let handshake_req = HandshakeRequest {
                    protocol_version: PROTOCOL_VERSION,
                    client_version: "1.0.0".into(),
                    sender_id: engine.device_id.clone(),
                    sender_name: my_name,
                    features: FeatureSet::default(),
                };

                if let Ok(req_bytes) = serde_json::to_vec(&handshake_req) {
                    let _ = write_frame(&mut stream, FRAME_HANDSHAKE, &req_bytes).await;
                    let _ = read_frame(&mut stream).await; // Handshake ack
                    let _ = write_frame(&mut stream, FRAME_TEXT, t.as_bytes()).await;
                }
            });
        }

        Ok(transfer_id)
    }

    pub async fn cancel_transfer(&self, transfer_id: &str) -> bool {
        let active = self.active_transfers.read().await;
        if let Some(tx) = active.get(transfer_id) {
            let _ = tx.send(());
            true
        } else {
            false
        }
    }

    pub async fn respond_to_incoming(&self, transfer_id: &str, accept: bool) -> bool {
        let mut pending = self.pending_incoming.write().await;
        if let Some((_, tx)) = pending.remove(transfer_id) {
            let _ = tx.send(accept);
            true
        } else {
            false
        }
    }

    async fn emit_progress(&self, payload: TransferProgressPayload) {
        if let Some(handle) = self.app_handle.read().await.as_ref() {
            let _ = handle.emit("transfer-progress", &payload);
        }
    }

    async fn emit_incoming(&self, notification: IncomingTransferNotification) {
        if let Some(handle) = self.app_handle.read().await.as_ref() {
            let _ = handle.emit("incoming-transfer", &notification);
        }
    }
}

/// Binary Frame Writer: [MAGIC: 4 bytes] [FRAME_TYPE: 1 byte] [LENGTH: 4 bytes BE] [PAYLOAD]
async fn write_frame(stream: &mut TcpStream, frame_type: u8, payload: &[u8]) -> Result<(), String> {
    stream.write_all(MAGIC_BYTES).await.map_err(|e| e.to_string())?;
    stream.write_u8(frame_type).await.map_err(|e| e.to_string())?;
    stream.write_u32(payload.len() as u32).await.map_err(|e| e.to_string())?;
    stream.write_all(payload).await.map_err(|e| e.to_string())?;
    stream.flush().await.map_err(|e| e.to_string())?;
    Ok(())
}

/// Binary Frame Reader
async fn read_frame(stream: &mut TcpStream) -> Result<(u8, Vec<u8>), String> {
    let mut magic = [0u8; 4];
    stream.read_exact(&mut magic).await.map_err(|e| e.to_string())?;
    if &magic != MAGIC_BYTES {
        return Err("Invalid protocol magic bytes".into());
    }

    let frame_type = stream.read_u8().await.map_err(|e| e.to_string())?;
    let length = stream.read_u32().await.map_err(|e| e.to_string())? as usize;

    if length > 100 * 1024 * 1024 {
        return Err("Frame size exceeds 100MB limit".into());
    }

    let mut payload = vec![0u8; length];
    stream.read_exact(&mut payload).await.map_err(|e| e.to_string())?;
    Ok((frame_type, payload))
}

fn dirs_or_fallback() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        if let Some(home) = std::env::var_os("USERPROFILE") {
            return PathBuf::from(home).join("Downloads").join("Apon");
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        if let Some(home) = std::env::var_os("HOME") {
            return PathBuf::from(home).join("Downloads").join("Apon");
        }
    }
    PathBuf::from("Downloads/Apon")
}

fn format_size(bytes: u64) -> String {
    if bytes < 1024 {
        format!("{} B", bytes)
    } else if bytes < 1024 * 1024 {
        format!("{:.1} KB", bytes as f64 / 1024.0)
    } else if bytes < 1024 * 1024 * 1024 {
        format!("{:.1} MB", bytes as f64 / (1024.0 * 1024.0))
    } else {
        format!("{:.2} GB", bytes as f64 / (1024.0 * 1024.0 * 1024.0))
    }
}
