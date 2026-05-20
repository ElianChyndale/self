import { getThemeLabel as getLocalizedThemeLabel } from './language';
import type { ActiveTheme, AppLanguage, ThemePreference } from '../types';

export function resolveThemePreference(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

export function normalizeDeviceTheme(value: unknown): ActiveTheme {
  return value === 'dark' ? 'dark' : 'light';
}

export function resolveActiveTheme(
  preference: ThemePreference,
  deviceTheme: unknown,
): ActiveTheme {
  if (preference === 'light' || preference === 'dark') return preference;
  return normalizeDeviceTheme(deviceTheme);
}

export function getThemeLabel(
  theme: ThemePreference | ActiveTheme,
  language: AppLanguage = 'en',
): string {
  return getLocalizedThemeLabel(theme, language);
}

export function detectSystemTheme(): ActiveTheme {
  try {
    const systemInfo = wx.getSystemInfoSync?.();
    return normalizeDeviceTheme(systemInfo?.theme);
  } catch (error) {
    console.warn('System theme detection failed; defaulting to light mode.', error);
    return 'light';
  }
}

export function detectStatusBarHeight(): number {
  try {
    const windowInfo = wx.getWindowInfo?.();
    if (typeof windowInfo?.statusBarHeight === 'number') return windowInfo.statusBarHeight;
    const systemInfo = wx.getSystemInfoSync?.();
    if (typeof systemInfo?.statusBarHeight === 'number') return systemInfo.statusBarHeight;
  } catch (error) {
    console.warn('Status bar detection failed; using fallback inset.', error);
  }

  return 24;
}

export function applyThemeChrome(activeTheme: ActiveTheme): void {
  if (typeof wx.setNavigationBarColor !== 'function') return;

  if (activeTheme === 'dark') {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#050607',
      animation: { duration: 200, timingFunc: 'easeIn' },
    });
    return;
  }

  wx.setNavigationBarColor({
    frontColor: '#000000',
    backgroundColor: '#e7e1d2',
    animation: { duration: 200, timingFunc: 'easeIn' },
  });
}
