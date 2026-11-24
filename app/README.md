# Apon Desktop & Mobile App (Tauri v2)

This directory is the placeholder and architectural foundation for the upcoming **Apon** cross-platform desktop and mobile application powered by **Tauri v2** and **Rust**.

## Architecture Overview

- **Core Engine (Rust Backend):**
  - **Local Peer Discovery:** Lightweight mDNS (multicast DNS) and UDP beacon broadcasting on the local subnet to detect running instances of Apon instantly.
  - **Direct P2P Streaming:** High-throughput streaming sockets (TCP / WebRTC DataChannels) achieving local hardware network speeds (>100 MB/s over modern Wi-Fi 6 / Gigabit Ethernet).
  - **Security & Privacy:** Ephemeral TLS certificates generated per session for end-to-end encrypted direct peer transfers. Zero cloud relay, zero telemetry.
  - **Cross-Platform File System Access:** Native streaming without loading entire files into memory, supporting multi-gigabyte files and folders.

- **Frontend (Tauri WebView):**
  - Interactive Radar interface (visual nearby device map).
  - Drag-and-drop file staging area.
  - Transfer queue with per-file progress, pause/resume, and speed metrics.
  - Light / Dark mode matching system settings.

## Supported Target Platforms

- **Windows:** `.msi`, `.exe` (NSIS)
- **macOS:** `.dmg`, `.app` (Universal Binary: Apple Silicon + Intel)
- **Linux:** `.AppImage`, `.deb`
- **Android:** `.apk`, `.aab`
- **iOS:** `.ipa` (Tauri v2 mobile target)

## Getting Started (When Ready for App Development)

### Prerequisites
1. **Rust & Cargo:** [Install Rust](https://rustup.rs/) (v1.78+)
2. **Node.js:** v18+ (Node v20+ recommended)
3. **Tauri CLI:**
   ```bash
   npm install -g @tauri-apps/cli@next
   ```

### Initialize Tauri v2
```bash
# Inside the app/ directory
npm run tauri:init
```

### Development Mode
```bash
npm run tauri:dev
```

### Production Build
```bash
npm run tauri:build
```
