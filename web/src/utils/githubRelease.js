// GitHub releases and OS detection utility

export const FALLBACK_RELEASES_URL = 'https://github.com/miadkhanofficial1/Apon-share/releases';
export const DEFAULT_VERSION = 'v1.0.0';

export function detectUserOS() {
  if (typeof window === 'undefined') return { os: 'windows', label: 'Windows', ext: '.exe' };
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) {
    return { os: 'windows', label: 'Windows', ext: '.exe' };
  }
  if (userAgent.includes('mac') && !userAgent.includes('iphone') && !userAgent.includes('ipad')) {
    return { os: 'macos', label: 'macOS', ext: '.dmg' };
  }
  if (userAgent.includes('android')) {
    return { os: 'android', label: 'Android', ext: '.apk' };
  }
  if (userAgent.includes('linux')) {
    return { os: 'linux', label: 'Linux', ext: '.AppImage' };
  }
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    return { os: 'ios', label: 'iOS', ext: '' };
  }
  return { os: 'windows', label: 'Windows', ext: '.exe' };
}

export async function fetchLatestRelease() {
  try {
    const res = await fetch('https://api.github.com/repos/miadkhanofficial1/Apon-share/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      // 404 or other status when no release published yet
      return {
        hasRelease: false,
        version: DEFAULT_VERSION,
        releaseUrl: FALLBACK_RELEASES_URL,
        assets: {}
      };
    }

    const data = await res.json();
    const assets = {};

    if (Array.isArray(data.assets)) {
      for (const asset of data.assets) {
        const name = (asset.name || '').toLowerCase();
        if (name.endsWith('.exe') || name.endsWith('.msi')) {
          assets.windows = asset.browser_download_url;
        } else if (name.endsWith('.dmg')) {
          assets.macos = asset.browser_download_url;
        } else if (name.endsWith('.apk')) {
          assets.android = asset.browser_download_url;
        } else if (name.endsWith('.appimage') || name.endsWith('.deb')) {
          assets.linux = asset.browser_download_url;
        }
      }
    }

    return {
      hasRelease: true,
      version: data.tag_name || DEFAULT_VERSION,
      releaseUrl: data.html_url || FALLBACK_RELEASES_URL,
      assets
    };
  } catch (err) {
    return {
      hasRelease: false,
      version: DEFAULT_VERSION,
      releaseUrl: FALLBACK_RELEASES_URL,
      assets: {}
    };
  }
}
