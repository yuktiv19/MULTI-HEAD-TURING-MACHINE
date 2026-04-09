/**
 * theme.js — Dark/Light theme toggle utility.
 * Applies the 'dark' or 'light' class to <html> and persists choice in localStorage.
 */

const STORAGE_KEY = 'tm-visualizer-theme';

export function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  // Respect OS preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'dark'; // default to dark for premium feel
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme(currentTheme) {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
