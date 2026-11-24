// Theme management utility following modern web best practices

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (e) {
    return 'light';
  }
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const isDark = theme === 'dark';
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.content = isDark ? 'dark' : 'light';
  }

  try {
    localStorage.setItem('theme', theme);
  } catch (e) {}
}
