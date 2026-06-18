import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? systemTheme() : preference;
}

function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const preference = readStoredPreference();
  const resolved = resolveTheme(preference);
  applyTheme(resolved);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (get().preference === 'system') {
      const next = systemTheme();
      applyTheme(next);
      set({ resolved: next });
    }
  });

  return {
    preference,
    resolved,
    setPreference: (next) => {
      if (next === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
      }
      const resolvedNext = resolveTheme(next);
      applyTheme(resolvedNext);
      set({ preference: next, resolved: resolvedNext });
    },
    toggle: () => {
      const next: ResolvedTheme = get().resolved === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      set({ preference: next, resolved: next });
    },
  };
});
