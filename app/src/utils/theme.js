// Strict Light Mode default theme helper

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return 'dark';
    return 'light'; // Default to clean Light Mode
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
