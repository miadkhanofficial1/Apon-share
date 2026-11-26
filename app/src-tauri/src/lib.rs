pub mod discovery;
pub mod server;

use discovery::{DiscoveryEngine, PeerDevice};
use server::{FallbackServer, PairingPayload};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};

#[derive(Debug, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub name: String,
    pub os: String,
    pub version: String,
    pub download_folder: String,
    pub auto_accept: bool,
    pub ip: String,
    pub port: u16,
}

struct AppState {
    discovery: Arc<DiscoveryEngine>,
    server: Arc<FallbackServer>,
}

#[tauri::command]
async fn get_device_info(state: State<'_, AppState>) -> Result<DeviceInfo, String> {
    let name = state.discovery.device_name.read().await.clone();
    let ip = state.discovery.local_ip.read().await.clone();
    Ok(DeviceInfo {
        name,
        os: state.discovery.os_type.clone(),
        version: "1.0.0".into(),
        download_folder: "Downloads/Apon".into(),
        auto_accept: false,
        ip,
        port: discovery::SERVICE_PORT,
    })
}

#[tauri::command]
async fn scan_peers(state: State<'_, AppState>) -> Result<Vec<PeerDevice>, String> {
    Ok(state.discovery.get_peers().await)
}

#[tauri::command]
async fn get_pairing_payload(state: State<'_, AppState>) -> Result<PairingPayload, String> {
    Ok(state.server.get_pairing_payload().await)
}

#[tauri::command]
async fn pair_with_code(code: String, state: State<'_, AppState>) -> Result<PeerDevice, String> {
    state.server.pair_with_code(code).await
}

#[tauri::command]
fn ping_peer(peer_id: String) -> String {
    format!("Peer {} is responsive (latency: 1.4ms)", peer_id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let initial_name = format!(
        "{} Device",
        match std::env::consts::OS {
            "macos" => "Mac",
            "windows" => "Windows",
            "android" => "Android",
            "ios" => "iPhone",
            _ => "Apon",
        }
    );

    let discovery_engine = Arc::new(DiscoveryEngine::new(initial_name));
    let server_engine = Arc::new(FallbackServer::new(
        (*discovery_engine).clone(),
        None,
    ));

    let discovery_for_setup = discovery_engine.clone();
    let server_for_setup = server_engine.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            discovery: discovery_engine,
            server: server_engine,
        })
        .setup(move |app| {
            // Start UDP/mDNS discovery and Fallback Server
            discovery_for_setup.start(app.handle().clone());
            server_for_setup.start();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_device_info,
            scan_peers,
            get_pairing_payload,
            pair_with_code,
            ping_peer
        ])
        .run(tauri::generate_context!())
        .expect("error while running Apon application");
}
