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
    default:
      return null;
  }
}
