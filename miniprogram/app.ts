import { loginWithCloud, saveGameStateToCloud, saveProfileToCloud } from './utils/cloud';
import { createDefaultGameState, sanitizeHydratedGameState } from './utils/gameState';
import {
  loadLocalGameState,
  loadLocalLanguagePreference,
  loadLocalProfile,
  loadLocalThemePreference,
  saveLocalGameState,
  saveLocalLanguagePreference,
  saveLocalProfile,
  saveLocalThemePreference,
} from './utils/storage';
import { initCloud } from './utils/cloud';
import {
  detectRegionalLanguage,
  detectSystemLanguage,
  getTabBarItems,
  getLanguageName,
  resolveActiveLanguage,
  resolveLanguagePreference,
} from './utils/language';
import {
  applyThemeChrome,
  detectStatusBarHeight,
  detectSystemTheme,
  normalizeDeviceTheme,
  resolveActiveTheme,
  resolveThemePreference,
  getThemeLabel,
} from './utils/theme';
import type { GameState, LanguagePreference, ThemePreference, UserProfile } from './types';

let syncTimer: ReturnType<typeof setTimeout> | null = null;

App<IAppOption>({
  globalData: {
    profile: null,
    gameState: createDefaultGameState(),
    themePreference: 'system',
    activeTheme: 'light',
    systemTheme: 'light',
    languagePreference: 'auto',
    activeLanguage: 'en',
    statusBarHeight: 24,
    ready: false,
  },

  onLaunch() {
    initCloud();
    this.initializeTheme();
    this.initializeLanguage();
    void this.bootstrap();
  },

  async bootstrap() {
    const localProfile = loadLocalProfile();
    const localGameState = loadLocalGameState();
    if (localProfile) this.globalData.profile = localProfile;
    if (localGameState) this.globalData.gameState = localGameState;
    this.globalData.ready = true;

    try {
      const result = await loginWithCloud();
      this.globalData.profile = result.profile;
      this.globalData.gameState = sanitizeHydratedGameState(result.gameState);
      saveLocalProfile(result.profile);
      saveLocalGameState(this.globalData.gameState);
      this.refreshCurrentPage();
    } catch (error) {
      console.warn('Cloud login failed, using local state.', error);
    }
  },

  initializeTheme() {
    const themePreference = loadLocalThemePreference();
    const systemTheme = detectSystemTheme();
    const statusBarHeight = detectStatusBarHeight();
    this.globalData.themePreference = themePreference;
    this.globalData.systemTheme = systemTheme;
    this.globalData.activeTheme = resolveActiveTheme(themePreference, systemTheme);
    this.globalData.statusBarHeight = statusBarHeight;
    applyThemeChrome(this.globalData.activeTheme);

    if (typeof wx.onThemeChange === 'function') {
      wx.onThemeChange((event: { theme?: string }) => {
        this.handleSystemThemeChange(event?.theme);
      });
    }
  },

  initializeLanguage() {
    const languagePreference = loadLocalLanguagePreference();
    const systemLanguage = detectSystemLanguage();
    this.globalData.languagePreference = languagePreference;
    this.globalData.activeLanguage = resolveActiveLanguage(languagePreference, systemLanguage, null);

    if (languagePreference === 'auto') {
      void this.refineAutoLanguageFromRegion();
    }
  },

  async refineAutoLanguageFromRegion() {
    const regionalLanguage = await detectRegionalLanguage();
    if (!regionalLanguage || this.globalData.languagePreference !== 'auto') return;

    const nextLanguage = resolveActiveLanguage(
      this.globalData.languagePreference,
      detectSystemLanguage(),
      regionalLanguage,
    );

    if (nextLanguage === this.globalData.activeLanguage) return;
    this.globalData.activeLanguage = nextLanguage;
    this.syncThemeToCurrentPage();
  },

  handleSystemThemeChange(nextTheme: unknown) {
    this.globalData.systemTheme = normalizeDeviceTheme(nextTheme);
    if (this.globalData.themePreference === 'system') {
      this.globalData.activeTheme = this.globalData.systemTheme;
      this.syncThemeToCurrentPage();
    }
  },

  setThemePreference(nextPreference: ThemePreference) {
    const themePreference = resolveThemePreference(nextPreference);
    this.globalData.themePreference = themePreference;
    this.globalData.activeTheme = resolveActiveTheme(themePreference, this.globalData.systemTheme);
    saveLocalThemePreference(themePreference);
    this.syncThemeToCurrentPage();
  },

  setLanguagePreference(nextPreference: LanguagePreference) {
    const languagePreference = resolveLanguagePreference(nextPreference);
    this.globalData.languagePreference = languagePreference;
    this.globalData.activeLanguage = resolveActiveLanguage(
      languagePreference,
      detectSystemLanguage(),
      null,
    );
    saveLocalLanguagePreference(languagePreference);
    this.syncThemeToCurrentPage();
  },

  syncThemeToCurrentPage() {
    applyThemeChrome(this.globalData.activeTheme);
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
    const currentPage = pages[pages.length - 1];
    currentPage?.setData?.({
      activeTheme: this.globalData.activeTheme,
      themePreference: this.globalData.themePreference,
      activeLanguage: this.globalData.activeLanguage,
      languagePreference: this.globalData.languagePreference,
      languageLabel: getLanguageName(this.globalData.activeLanguage),
      themeLabel: getThemeLabel(this.globalData.themePreference, this.globalData.activeLanguage),
      activeThemeLabel: getThemeLabel(this.globalData.activeTheme, this.globalData.activeLanguage),
      statusBarHeight: this.globalData.statusBarHeight,
    });
    currentPage?.getTabBar?.()?.setData?.({
      activeTheme: this.globalData.activeTheme,
      items: getTabBarItems(this.globalData.activeLanguage),
    });
  },

  refreshCurrentPage() {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
    const currentPage = pages[pages.length - 1] as { refresh?: () => void } | undefined;
    currentPage?.refresh?.();
  },

  updateProfile(profilePatch: Partial<UserProfile>) {
    if (!this.globalData.profile) return;
    this.globalData.profile = {
      ...this.globalData.profile,
      ...profilePatch,
      updatedAt: new Date().toISOString(),
    };
    saveLocalProfile(this.globalData.profile);
    saveProfileToCloud(this.globalData.profile).catch((error) => {
      console.warn('Profile sync failed; local profile is preserved.', error);
    });
  },

  updateGameState(gameState: GameState) {
    this.globalData.gameState = gameState;
    saveLocalGameState(gameState);
    this.syncGameState();
  },

  syncGameState() {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(async () => {
      try {
        await saveGameStateToCloud(this.globalData.gameState);
      } catch (error) {
        console.warn('Game state sync failed; local state is preserved.', error);
      }
    }, 1500);
  },
});
