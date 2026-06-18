import { describe, expect, it } from 'vitest';

import { useThemeStore } from './themeStore';

describe('useThemeStore', () => {
  it('applies and persists an explicit preference', () => {
    useThemeStore.getState().setPreference('dark');

    expect(useThemeStore.getState().preference).toBe('dark');
    expect(useThemeStore.getState().resolved).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles between light and dark', () => {
    useThemeStore.getState().setPreference('light');
    useThemeStore.getState().toggle();

    expect(useThemeStore.getState().resolved).toBe('dark');
  });

  it('clears storage when set to system', () => {
    useThemeStore.getState().setPreference('dark');
    useThemeStore.getState().setPreference('system');

    expect(localStorage.getItem('theme')).toBeNull();
    expect(useThemeStore.getState().preference).toBe('system');
  });
});
