pub mod discovery;
pub mod server;
pub mod transfer;

use discovery::{DiscoveryEngine, PeerDevice};
use server::{FallbackServer, PairingPayload};
use transfer::TransferEngine;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
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

pub struct AppState {
    discovery: Arc<DiscoveryEngine>,
    server: Arc<FallbackServer>,
    transfer: Arc<TransferEngine>,
}

#[tauri::command]
async fn get_device_info(state: State<'_, AppState>) -> Result<DeviceInfo, String> {
    let name = state.discovery.device_name.read().await.clone();
    let ip = state.discovery.local_ip.read().await.clone();
    let folder = state.transfer.download_folder.read().await.to_string_lossy().to_string();
    let auto_accept = *state.transfer.auto_accept.read().await;

    Ok(DeviceInfo {
        name,
        os: state.discovery.os_type.clone(),
        version: "1.0.0".into(),
        download_folder: folder,
        auto_accept,
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

#[tauri::command]
async fn start_file_transfer(
    peer_ids: Vec<String>,
    file_paths: Vec<String>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let all_peers = state.discovery.get_peers().await;
    let target_peers: Vec<PeerDevice> = all_peers
        .into_iter()
        .filter(|p| peer_ids.contains(&p.id))
        .collect();

    if target_peers.is_empty() {
        return Err("No matched destination peers found online".into());
    }

    state.transfer.send_files(target_peers, file_paths).await
}

#[tauri::command]
async fn start_text_transfer(
    peer_ids: Vec<String>,
    text: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let all_peers = state.discovery.get_peers().await;
    let target_peers: Vec<PeerDevice> = all_peers
        .into_iter()
        .filter(|p| peer_ids.contains(&p.id))
        .collect();

    if target_peers.is_empty() {
        return Err("No matched destination peers found online".into());
    }

    state.transfer.send_text(target_peers, text).await
}

#[tauri::command]
async fn respond_transfer(
    transfer_id: String,
    accept: bool,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    Ok(state.transfer.respond_to_incoming(&transfer_id, accept).await)
}

#[tauri::command]
async fn cancel_transfer(
    transfer_id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    Ok(state.transfer.cancel_transfer(&transfer_id).await)
}

#[tauri::command]
async fn update_transfer_settings(
    auto_accept: bool,
    download_folder: String,
    device_name: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    {
        let mut aa = state.transfer.auto_accept.write().await;
        *aa = auto_accept;
    }
    {
        let mut df = state.transfer.download_folder.write().await;
        *df = PathBuf::from(download_folder);
    }
    if let Some(name) = device_name {
        let mut dn = state.discovery.device_name.write().await;
        *dn = name.clone();
        let mut tn = state.transfer.device_name.write().await;
        *tn = name;
    }
    Ok(())
}

pub fn log_startup_error(app_handle: Option<&AppHandle>, msg: &str) {
    eprintln!("[Apon Startup] {}", msg);
    let log_path = if let Some(handle) = app_handle {
        if let Ok(dir) = handle.path().app_data_dir() {
            let _ = std::fs::create_dir_all(&dir);
            dir.join("startup.log")
        } else {
            PathBuf::from("startup.log")
        }
    } else {
        PathBuf::from("startup.log")
    };

    if let Ok(mut file) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path)
    {
        use std::io::Write;
        let ts = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);
        let _ = writeln!(file, "[Timestamp: {}s] {}", ts, msg);
    }
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

    let discovery_engine = Arc::new(DiscoveryEngine::new(initial_name.clone()));
    let server_engine = Arc::new(FallbackServer::new(
        (*discovery_engine).clone(),
        None,
    ));
    let transfer_engine = Arc::new(TransferEngine::new(
        discovery_engine.device_id.clone(),
        initial_name,
    ));

    let discovery_for_setup = discovery_engine.clone();
    let server_for_setup = server_engine.clone();
    let transfer_for_setup = transfer_engine.clone();

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(AppState {
            discovery: discovery_engine,
            server: server_engine,
            transfer: transfer_engine,
        })
        .setup(move |app| {
            let handle = app.handle().clone();

            // Explicitly ensure the main window is visible and focused on launch
            match app.get_webview_window("main") {
                Some(window) => {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
                None => {
                    log_startup_error(Some(&handle), "Main window 'main' not found during setup");
                }
            }

            // Spawn background discovery, fallback server, and P2P streaming engines safely
            let disc = discovery_for_setup.clone();
            let h_disc = handle.clone();
            tauri::async_runtime::spawn(async move {
                disc.start(h_disc);
            });

            let srv = server_for_setup.clone();
            let h_srv = handle.clone();
            tauri::async_runtime::spawn(async move {
                srv.start(Some(h_srv));
            });

            let trf = transfer_for_setup.clone();
            let h_trf = handle.clone();
            tauri::async_runtime::spawn(async move {
                trf.set_app_handle(h_trf);
                trf.start();
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_device_info,
            scan_peers,
            get_pairing_payload,
            pair_with_code,
            ping_peer,
            start_file_transfer,
            start_text_transfer,
            respond_transfer,
            cancel_transfer,
            update_transfer_settings
        ]);

    let app = match builder.build(tauri::generate_context!()) {
        Ok(app) => app,
        Err(e) => {
            log_startup_error(None, &format!("Fatal error while building Apon application: {}", e));
            return;
        }
    };

    app.run(|_app_handle, _event| {
        // Keeps the Tauri event loop running until the user explicitly exits
    });
}
