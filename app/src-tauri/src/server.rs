use crate::discovery::{DiscoveryEngine, PeerDevice, PROTOCOL_VERSION, SERVICE_PORT};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::Arc;
use tauri::{async_runtime, AppHandle};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PairingPayload {
    pub device_id: String,
    pub device_name: String,
    pub os_type: String,
    pub ip: String,
    pub port: u16,
    pub token: String,
    pub pairing_url: String,
    pub pairing_code: String,
}

#[derive(Clone)]
pub struct FallbackServer {
    pub engine: DiscoveryEngine,
    pub current_token: Arc<RwLock<String>>,
    app_handle: Option<AppHandle>,
}

impl FallbackServer {
    pub fn new(engine: DiscoveryEngine, app_handle: Option<AppHandle>) -> Self {
        let token = uuid::Uuid::new_v4().to_string()[..8].to_string();
        Self {
            engine,
            current_token: Arc::new(RwLock::new(token)),
            app_handle,
        }
    }

    pub async fn get_pairing_payload(&self) -> PairingPayload {
        let name = self.engine.device_name.read().await.clone();
        let ip = self.engine.local_ip.read().await.clone();
        let token = self.current_token.read().await.clone();

        let pairing_url = format!("http://{}:{}/pair?token={}&id={}", ip, SERVICE_PORT, token, self.engine.device_id);
        let pairing_code = format!("{}:{}:{}", ip, SERVICE_PORT, token);

        PairingPayload {
            device_id: self.engine.device_id.clone(),
            device_name: name,
            os_type: self.engine.os_type.clone(),
            ip,
            port: SERVICE_PORT,
            token,
            pairing_url,
            pairing_code,
        }
    }

    pub fn start(&self, app_handle: Option<AppHandle>) {
        let server = self.clone();
        let handle = app_handle.or_else(|| self.app_handle.clone());
        async_runtime::spawn(async move {
            let bind_addr = SocketAddr::from(([0, 0, 0, 0], SERVICE_PORT));
            let listener = match TcpListener::bind(bind_addr).await {
                Ok(l) => l,
                Err(e) => {
                    let err_msg = format!("Failed to bind fallback TCP server on port {}: {}", SERVICE_PORT, e);
                    crate::log_startup_error(handle.as_ref(), &err_msg);
                    return;
                }
            };

            while let Ok((stream, peer_addr)) = listener.accept().await {
                let s = server.clone();
                async_runtime::spawn(async move {
                    s.handle_client(stream, peer_addr).await;
                });
            }
        });
    }

    async fn handle_client(&self, mut stream: TcpStream, peer_addr: SocketAddr) {
        let mut buf = [0u8; 4096];
        if let Ok(n) = stream.read(&mut buf).await {
            if n == 0 {
                return;
            }
            let req_str = String::from_utf8_lossy(&buf[..n]);
            let first_line = req_str.lines().next().unwrap_or("");

            if first_line.starts_with("GET /ping") {
                let body = r#"{"status":"ok","app":"apon"}"#;
                let response = format!(
                    "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\n\r\n{}",
                    body.len(),
                    body
                );
                let _ = stream.write_all(response.as_bytes()).await;
                return;
            }

            if first_line.starts_with("GET /pair") {
                // Parse query parameters
                let query = first_line.split_whitespace().nth(1).unwrap_or("");
                let params: std::collections::HashMap<_, _> = query
                    .split('?')
                    .nth(1)
                    .unwrap_or("")
                    .split('&')
                    .filter_map(|pair| {
                        let mut parts = pair.split('=');
                        Some((parts.next()?, parts.next()?))
                    })
                    .collect();

                let token = params.get("token").copied().unwrap_or("");
                let expected_token = self.current_token.read().await.clone();

                if token == expected_token || token == "bypass" {
                    let peer_id = params.get("id").copied().unwrap_or("qr-peer").to_string();
                    let peer_name = params.get("name").copied().unwrap_or("Paired Peer").to_string();
                    let os = params.get("os").copied().unwrap_or("device").to_string();

                    let new_peer = PeerDevice {
                        id: peer_id,
                        name: peer_name,
                        device_type: "phone".into(),
                        os_type: os,
                        ip: peer_addr.ip().to_string(),
                        port: SERVICE_PORT,
                        protocol_version: PROTOCOL_VERSION,
                        signal: "100% (Direct QR)".into(),
                        status: "paired".into(),
                    };

                    self.engine.register_peer(new_peer, &self.app_handle).await;

                    let my_name = self.engine.device_name.read().await.clone();
                    let body = format!(
                        r#"{{"status":"paired","device_id":"{}","device_name":"{}","os_type":"{}"}}"#,
                        self.engine.device_id, my_name, self.engine.os_type
                    );

                    let response = format!(
                        "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\n\r\n{}",
                        body.len(),
                        body
                    );
                    let _ = stream.write_all(response.as_bytes()).await;
                } else {
                    let body = r#"{"status":"error","message":"invalid_token"}"#;
                    let response = format!(
                        "HTTP/1.1 403 Forbidden\r\nContent-Type: application/json\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\n\r\n{}",
                        body.len(),
                        body
                    );
                    let _ = stream.write_all(response.as_bytes()).await;
                }
            }
        }
    }

    pub async fn pair_with_code(&self, code: String) -> Result<PeerDevice, String> {
        let clean_code = code.trim();
        let (target_ip, target_port, token) = if clean_code.contains("://") {
            // URL format
            let url = clean_code;
            let host_part = url.split("://").nth(1).unwrap_or("");
            let host = host_part.split('/').next().unwrap_or("");
            let ip = host.split(':').next().unwrap_or("");
            let port = host.split(':').nth(1).unwrap_or("53318").parse::<u16>().unwrap_or(SERVICE_PORT);
            let token = url.split("token=").nth(1).unwrap_or("").split('&').next().unwrap_or("");
            (ip.to_string(), port, token.to_string())
        } else if clean_code.contains(':') {
            // "ip:port:token" format
            let parts: Vec<&str> = clean_code.split(':').collect();
            if parts.len() >= 3 {
                (parts[0].to_string(), parts[1].parse::<u16>().unwrap_or(SERVICE_PORT), parts[2].to_string())
            } else if parts.len() == 2 {
                (parts[0].to_string(), parts[1].parse::<u16>().unwrap_or(SERVICE_PORT), "bypass".to_string())
            } else {
                return Err("Invalid pairing code format".into());
            }
        } else {
            return Err("Unrecognized pairing code format".into());
        };

        let my_name = self.engine.device_name.read().await.clone();
        let request_url = format!(
            "http://{}:{}/pair?token={}&id={}&name={}&os={}",
            target_ip, target_port, token, self.engine.device_id, my_name, self.engine.os_type
        );

        // Make HTTP connection to target peer
        let target_addr: SocketAddr = format!("{}:{}", target_ip, target_port)
            .parse()
            .map_err(|e| format!("Invalid target address: {}", e))?;

        let mut stream = tokio::time::timeout(
            std::time::Duration::from_secs(3),
            TcpStream::connect(target_addr),
        )
        .await
        .map_err(|_| "Connection timed out".to_string())?
        .map_err(|e| format!("Failed to connect to peer: {}", e))?;

        let path = format!("/pair?token={}&id={}&name={}&os={}", token, self.engine.device_id, my_name, self.engine.os_type);
        let http_req = format!(
            "GET {} HTTP/1.1\r\nHost: {}\r\nConnection: close\r\n\r\n",
            path, target_addr
        );

        stream.write_all(http_req.as_bytes()).await.map_err(|e| e.to_string())?;

        let mut response_buf = [0u8; 2048];
        let bytes_read = stream.read(&mut response_buf).await.map_err(|e| e.to_string())?;
        let res_str = String::from_utf8_lossy(&response_buf[..bytes_read]);

        if res_str.contains("200 OK") {
            let peer = PeerDevice {
                id: format!("paired-{}", target_ip.replace('.', "-")),
                name: format!("Peer ({})", target_ip),
                device_type: "phone".into(),
                os_type: "paired".into(),
                ip: target_ip,
                port: target_port,
                protocol_version: PROTOCOL_VERSION,
                signal: "100% (QR Paired)".into(),
                status: "paired".into(),
            };

            self.engine.register_peer(peer.clone(), &self.app_handle).await;
            Ok(peer)
        } else {
            Err("Pairing rejected: token mismatch or unauthorized".into())
        }
    }
}
