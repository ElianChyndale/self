import { describe, expect, it, vi } from 'vitest';
import {
  loadLocalThemePreference,
  saveLocalThemePreference,
} from '../miniprogram/utils/storage';
import {
  applyThemeChrome,
  getThemeLabel,
  resolveActiveTheme,
  resolveThemePreference,
} from '../miniprogram/utils/theme';

describe('theme preference resolution', () => {
  it('resolves system preference from the device theme and normalizes invalid values', () => {
    expect(resolveActiveTheme('light', 'dark')).toBe('light');
    expect(resolveActiveTheme('dark', 'light')).toBe('dark');
    expect(resolveActiveTheme('system', 'dark')).toBe('dark');
    expect(resolveActiveTheme('system', 'unknown')).toBe('light');

    expect(resolveThemePreference('dark')).toBe('dark');
    expect(resolveThemePreference(undefined)).toBe('system');
    expect(resolveThemePreference('sepia')).toBe('system');
    expect(getThemeLabel('system')).toBe('System');
  });
});

describe('theme preference storage', () => {
  it('persists and reloads the chosen theme preference', () => {
    const storage = new Map<string, unknown>();
    const wxMock = {
      getStorageSync: vi.fn((key: string) => storage.get(key)),
      setStorageSync: vi.fn((key: string, value: unknown) => storage.set(key, value)),
    };

    vi.stubGlobal('wx', wxMock);

    expect(loadLocalThemePreference()).toBe('system');

    saveLocalThemePreference('dark');

    expect(wxMock.setStorageSync).toHaveBeenCalledOnce();
    expect(loadLocalThemePreference()).toBe('dark');

    vi.unstubAllGlobals();
  });
});

describe('theme chrome application', () => {
  it('uses the redesign navigation colors for dark and light themes', () => {
    const setNavigationBarColor = vi.fn();
    vi.stubGlobal('wx', { setNavigationBarColor });

    applyThemeChrome('dark');
    applyThemeChrome('light');

    expect(setNavigationBarColor).toHaveBeenNthCalledWith(1, {
      frontColor: '#ffffff',
      backgroundColor: '#050607',
      animation: { duration: 200, timingFunc: 'easeIn' },
    });

    expect(setNavigationBarColor).toHaveBeenNthCalledWith(2, {
      frontColor: '#000000',
      backgroundColor: '#e7e1d2',
      animation: { duration: 200, timingFunc: 'easeIn' },
    });

    vi.unstubAllGlobals();
  });
});
