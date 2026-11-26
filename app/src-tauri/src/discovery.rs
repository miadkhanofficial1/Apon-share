use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};
use tokio::net::UdpSocket;
use tokio::sync::RwLock;

pub const BROADCAST_PORT: u16 = 53317;
pub const SERVICE_PORT: u16 = 53318;
pub const PROTOCOL_VERSION: u32 = 1;
pub const PRUNE_TIMEOUT: Duration = Duration::from_secs(3);
pub const BEACON_INTERVAL: Duration = Duration::from_millis(1000);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerDevice {
    pub id: String,
    pub name: String,
    pub device_type: String, // "laptop", "phone", "desktop", "tablet"
    pub os_type: String,     // "windows", "macos", "android", "ios", "linux"
    pub ip: String,
    pub port: u16,
    pub protocol_version: u32,
    pub signal: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct BeaconPayload {
    pub r#type: String,
    pub device_id: String,
    pub device_name: String,
    pub os_type: String,
    pub device_type: String,
    pub ip_address: String,
    pub port: u16,
    pub protocol_version: u32,
}

struct PeerRecord {
    pub device: PeerDevice,
    pub last_seen: Instant,
}

#[derive(Clone)]
pub struct DiscoveryEngine {
    pub device_id: String,
    pub device_name: Arc<RwLock<String>>,
    pub os_type: String,
    pub device_type: String,
    pub local_ip: Arc<RwLock<String>>,
    peers: Arc<RwLock<HashMap<String, PeerRecord>>>,
}

impl DiscoveryEngine {
    pub fn new(device_name: String) -> Self {
        let device_id = uuid::Uuid::new_v4().to_string();
        let os_type = std::env::consts::OS.to_string();
        let device_type = match os_type.as_str() {
            "macos" | "windows" | "linux" => "laptop".to_string(),
            "android" | "ios" => "phone".to_string(),
            _ => "desktop".to_string(),
        };

        let local_ip = local_ip_address::local_ip()
            .map(|ip| ip.to_string())
            .unwrap_or_else(|_| "127.0.0.1".to_string());

        Self {
            device_id,
            device_name: Arc::new(RwLock::new(device_name)),
            os_type,
            device_type,
            local_ip: Arc::new(RwLock::new(local_ip)),
            peers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn get_peers(&self) -> Vec<PeerDevice> {
        let registry = self.peers.read().await;
        registry.values().map(|r| r.device.clone()).collect()
    }

    pub async fn register_peer(&self, peer: PeerDevice, app_handle: &Option<AppHandle>) {
        let id = peer.id.clone();
        let mut registry = self.peers.write().await;
        registry.insert(
            id,
            PeerRecord {
                device: peer,
                last_seen: Instant::now(),
            },
        );

        if let Some(app) = app_handle {
            let list: Vec<PeerDevice> = registry.values().map(|r| r.device.clone()).collect();
            let _ = app.emit("peers-updated", list);
        }
    }

    pub fn start(&self, app_handle: AppHandle) {
        let engine = self.clone();
        let app = app_handle.clone();

        // 1. UDP Beacon Broadcaster
        let engine_broadcast = engine.clone();
        let app_broadcast = app.clone();
        tokio::spawn(async move {
            let bind_addr = SocketAddr::from(([0, 0, 0, 0], 0));
            let socket = match UdpSocket::bind(bind_addr).await {
                Ok(s) => {
                    let _ = s.set_broadcast(true);
                    s
                }
                Err(e) => {
                    let err_msg = format!("Failed to bind UDP broadcast sender: {}", e);
                    crate::log_startup_error(Some(&app_broadcast), &err_msg);
                    return;
                }
            };

            let broadcast_target = SocketAddr::from(([255, 255, 255, 255], BROADCAST_PORT));

            loop {
                // Refresh local IP if changed
                if let Ok(ip) = local_ip_address::local_ip() {
                    let mut cur = engine_broadcast.local_ip.write().await;
                    *cur = ip.to_string();
                }

                let cur_name = engine_broadcast.device_name.read().await.clone();
                let cur_ip = engine_broadcast.local_ip.read().await.clone();

                let payload = BeaconPayload {
                    r#type: "apon_beacon".into(),
                    device_id: engine_broadcast.device_id.clone(),
                    device_name: cur_name,
                    os_type: engine_broadcast.os_type.clone(),
                    device_type: engine_broadcast.device_type.clone(),
                    ip_address: cur_ip,
                    port: SERVICE_PORT,
                    protocol_version: PROTOCOL_VERSION,
                };

                if let Ok(bytes) = serde_json::to_vec(&payload) {
                    let _ = socket.send_to(&bytes, broadcast_target).await;
                }

                tokio::time::sleep(BEACON_INTERVAL).await;
            }
        });

        // 2. UDP Beacon Listener
        let engine_recv = engine.clone();
        let app_recv = app.clone();
        tokio::spawn(async move {
            let bind_addr = SocketAddr::from(([0, 0, 0, 0], BROADCAST_PORT));
            let socket = match UdpSocket::bind(bind_addr).await {
                Ok(s) => {
                    let _ = s.set_broadcast(true);
                    s
                }
                Err(e) => {
                    let err_msg = format!("Failed to bind UDP listener on {}: {}", BROADCAST_PORT, e);
                    crate::log_startup_error(Some(&app_recv), &err_msg);
                    return;
                }
            };

            let mut buf = [0u8; 2048];
            loop {
                if let Ok((len, src)) = socket.recv_from(&mut buf).await {
                    if let Ok(beacon) = serde_json::from_slice::<BeaconPayload>(&buf[..len]) {
                        // Skip self beacons
                        if beacon.device_id == engine_recv.device_id {
                            continue;
                        }

                        let peer = PeerDevice {
                            id: beacon.device_id.clone(),
                            name: beacon.device_name,
                            device_type: beacon.device_type,
                            os_type: beacon.os_type,
                            ip: if beacon.ip_address.is_empty() || beacon.ip_address == "127.0.0.1" {
                                src.ip().to_string()
                            } else {
                                beacon.ip_address
                            },
                            port: beacon.port,
                            protocol_version: beacon.protocol_version,
                            signal: "100%".into(),
                            status: "ready".into(),
                        };

                        let mut registry = engine_recv.peers.write().await;
                        registry.insert(
                            beacon.device_id,
                            PeerRecord {
                                device: peer,
                                last_seen: Instant::now(),
                            },
                        );

                        let list: Vec<PeerDevice> = registry.values().map(|r| r.device.clone()).collect();
                        let _ = app_recv.emit("peers-updated", list);
                    }
                }
            }
        });

        // 3. 3-Second Offline Peer Pruning Loop
        let engine_prune = engine.clone();
        let app_prune = app.clone();
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(Duration::from_millis(1000)).await;

                let mut registry = engine_prune.peers.write().await;
                let before_len = registry.len();
                
                // Prune any peer whose last heartbeat exceeds 3 seconds
                registry.retain(|_, record| record.last_seen.elapsed() < PRUNE_TIMEOUT);

                if registry.len() != before_len {
                    let list: Vec<PeerDevice> = registry.values().map(|r| r.device.clone()).collect();
                    let _ = app_prune.emit("peers-updated", list);
                }
            }
        });

        // 4. mDNS Advertiser & Discovery
        tokio::spawn(async move {
            // Background mDNS responder setup
            if let Ok(mdns) = mdns_sd::ServiceDaemon::new() {
                let service_type = "_apon-share._udp.local.";
                let instance_name = format!("apon-{}", &engine.device_id[..8]);
                let host_name = format!("{}.local.", instance_name);
                let port = SERVICE_PORT;
                let ip = engine.local_ip.read().await.clone();

                let mut properties = HashMap::new();
                properties.insert("id".to_string(), engine.device_id.clone());
                properties.insert("os".to_string(), engine.os_type.clone());
                properties.insert("type".to_string(), engine.device_type.clone());

                if let Ok(service_info) = mdns_sd::ServiceInfo::new(
                    service_type,
                    &instance_name,
                    &host_name,
                    &ip,
                    port,
                    properties,
                ) {
                    let _ = mdns.register(service_info);
                }

                // Browse for peer services
                if let Ok(receiver) = mdns.browse(service_type) {
                    while let Ok(event) = receiver.recv_async().await {
                        if let mdns_sd::ServiceEvent::ServiceResolved(info) = event {
                            let props = info.get_properties();
                            if let Some(peer_id) = props.get_property_val_str("id") {
                                if peer_id != engine.device_id {
                                    let peer_ip = info.get_addresses().iter().next().map(|a| a.to_string()).unwrap_or_else(|| "127.0.0.1".into());
                                    let peer = PeerDevice {
                                        id: peer_id.to_string(),
                                        name: info.get_fullname().split('.').next().unwrap_or("Peer").into(),
                                        device_type: props.get_property_val_str("type").unwrap_or("laptop").into(),
                                        os_type: props.get_property_val_str("os").unwrap_or("windows").into(),
                                        ip: peer_ip,
                                        port: info.get_port(),
                                        protocol_version: PROTOCOL_VERSION,
                                        signal: "95%".into(),
                                        status: "ready".into(),
                                    };

                                    let mut registry = engine.peers.write().await;
                                    registry.insert(
                                        peer_id.to_string(),
                                        PeerRecord {
                                            device: peer,
                                            last_seen: Instant::now(),
                                        },
                                    );

                                    let list: Vec<PeerDevice> = registry.values().map(|r| r.device.clone()).collect();
                                    let _ = app.emit("peers-updated", list);
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}
