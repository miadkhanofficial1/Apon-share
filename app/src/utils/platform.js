// Platform detection helper for adaptive UI

export function isTauri() {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
}

export function detectPlatform() {
  if (typeof window === 'undefined') return { isMobile: false, isDesktop: true, os: 'windows' };

  const ua = window.navigator.userAgent.toLowerCase();
  const isAndroid = ua.includes('android');
  const isIOS = ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod');
  const isMac = ua.includes('mac') && !isIOS;
  const isWindows = ua.includes('win');
  const isLinux = ua.includes('linux') && !isAndroid;

  const isMobile = isAndroid || isIOS || window.innerWidth < 560;
  const isDesktop = !isMobile;

  let os = 'windows';
  if (isMac) os = 'macos';
  else if (isLinux) os = 'linux';
  else if (isAndroid) os = 'android';
  else if (isIOS) os = 'ios';

  return {
    isMobile,
    isDesktop,
    os,
    isAndroid,
    isIOS,
    isMac,
    isWindows,
    isLinux,
  };
}
