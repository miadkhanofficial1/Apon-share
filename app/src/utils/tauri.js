import { isTauri } from './platform';

export async function invokeCommand(command, args = {}) {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke(command, args);
    } catch (e) {
      console.warn(`Tauri invoke '${command}' failed, falling back:`, e);
    }
  }

  // Graceful browser fallback simulation
  switch (command) {
    case 'get_device_info':
      return {
        name: localStorage.getItem('apon_device_name') || 'This Device',
        os: 'windows',
        version: '1.0.0',
        download_folder: localStorage.getItem('apon_download_folder') || 'Downloads/Apon',
        auto_accept: localStorage.getItem('apon_auto_accept') === 'true',
      };
    case 'scan_peers':
      return [
        {
          id: 'peer-1',
          name: 'MacBook Pro M3',
          device_type: 'laptop',
          ip: '192.168.1.104',
          signal: '98%',
          status: 'ready',
        },
        {
          id: 'peer-2',
          name: 'Pixel 9 Pro',
          device_type: 'phone',
          ip: '192.168.1.112',
          signal: '94%',
          status: 'ready',
        },
        {
          id: 'peer-3',
          name: 'Studio Rig',
          device_type: 'desktop',
          ip: '192.168.1.140',
          signal: '100%',
          status: 'ready',
        },
        {
          id: 'peer-4',
          name: 'iPad Pro',
          device_type: 'tablet',
          ip: '192.168.1.129',
          signal: '88%',
          status: 'ready',
        },
      ];
    case 'get_pairing_payload':
      return {
        device_id: 'local-demo-id',
        ip: '192.168.1.100',
        port: 53318,
        token: 'apon-sample-token-77',
        pairing_url: 'http://192.168.1.100:53318/pair?token=apon-sample-token-77',
      };
    case 'pair_with_code':
      return {
        id: 'peer-manual-1',
        name: 'Paired Device (Direct)',
        device_type: 'phone',
        ip: args.code?.split(':')[0]?.replace('http://', '') || '192.168.1.155',
        signal: '100%',
        status: 'ready',
      };
    case 'ping_peer':
      return true;
    default:
      return null;
  }
}

/**
 * Listen to real-time peer discovery updates emitted by Tauri backend.
 * Automatically cleans up on unmount.
 */
export async function listenToPeerUpdates(callback) {
  if (isTauri()) {
    try {
      const { listen } = await import('@tauri-apps/api/event');
      const unlisten = await listen('peers-updated', (event) => {
        if (callback && event && event.payload) {
          callback(event.payload);
        }
      });
      return unlisten;
    } catch (e) {
      console.warn('Tauri event listen failed, using fallback:', e);
    }
  }

  // Browser fallback simulation: trigger initial peers
  const initialPeers = await invokeCommand('scan_peers');
  callback(initialPeers);

  // No-op unlisten in browser
  return () => {};
}

export async function getPairingPayload() {
  return await invokeCommand('get_pairing_payload');
}

export async function pairWithCode(code) {
  return await invokeCommand('pair_with_code', { code });
}

export async function pingPeer(targetIp, targetPort = 53318) {
  return await invokeCommand('ping_peer', { targetIp, targetPort });
}

