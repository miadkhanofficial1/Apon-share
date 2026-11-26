use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PeerDevice {
    pub id: String,
    pub name: String,
    pub device_type: String, // "laptop", "phone", "desktop", "tablet"
    pub ip: String,
    pub signal: String,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub name: String,
    pub os: String,
    pub version: String,
    pub download_folder: String,
    pub auto_accept: bool,
}

#[tauri::command]
fn get_device_info() -> DeviceInfo {
    DeviceInfo {
        name: "This Device".into(),
        os: std::env::consts::OS.into(),
        version: "1.0.0".into(),
        download_folder: "Downloads/Apon".into(),
        auto_accept: false,
    }
}

#[tauri::command]
fn scan_peers() -> Vec<PeerDevice> {
    vec![
        PeerDevice {
            id: "peer-1".into(),
            name: "MacBook Pro M3".into(),
            device_type: "laptop".into(),
            ip: "192.168.1.104".into(),
            signal: "98%".into(),
            status: "ready".into(),
        },
        PeerDevice {
            id: "peer-2".into(),
            name: "Pixel 9 Pro".into(),
            device_type: "phone".into(),
            ip: "192.168.1.112".into(),
            signal: "92%".into(),
            status: "ready".into(),
        },
        PeerDevice {
            id: "peer-3".into(),
            name: "Studio Rig".into(),
            device_type: "desktop".into(),
            ip: "192.168.1.140".into(),
            signal: "100%".into(),
            status: "ready".into(),
        },
        PeerDevice {
            id: "peer-4".into(),
            name: "iPad Pro".into(),
            device_type: "tablet".into(),
            ip: "192.168.1.129".into(),
            signal: "88%".into(),
            status: "ready".into(),
        },
    ]
}

#[tauri::command]
fn ping_peer(peer_id: String) -> String {
    format!("Peer {} is responsive (latency: 1.4ms)", peer_id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_device_info,
            scan_peers,
            ping_peer
        ])
        .run(tauri::generate_context!())
        .expect("error while running Apon application");
}
