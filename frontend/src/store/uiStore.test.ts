import { beforeEach, describe, expect, it } from 'vitest';

import { useUiStore } from './uiStore';

beforeEach(() => {
  useUiStore.getState().closeSidebar();
});

describe('useUiStore', () => {
  it('opens and closes the sidebar', () => {
    useUiStore.getState().openSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);

    useUiStore.getState().closeSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it('toggles the sidebar', () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);

    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });
});
