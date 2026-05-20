import type { AppCapabilities, GameState, LanguagePreference, ThemePreference, UserProfile } from './types';
import { loginWithCloud, saveGameStateToCloud, saveProfileToCloud } from './utils/cloud';
import { createDefaultGameState, sanitizeHydratedGameState } from './utils/gameState';
import { buildProfileUpdate, mergeHydratedProfile, shouldRequireProfileSetup } from './utils/profile';
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
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let onboardingNavigationPending = false;

App<IAppOption>({
  globalData: {
    profile: null,
    gameState: createDefaultGameState(),
    themePreference: 'system',
    activeTheme: 'light',
    systemTheme: 'light',
    languagePreference: 'auto',
    activeLanguage: 'en',
    capabilities: {
      claimMigrationConfigured: false,
    },
    cloudBootstrapState: 'pending',
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
    this.ensureProfileSetup();
    this.refreshCurrentPage();

    try {
      const result = await loginWithCloud();
      this.globalData.cloudBootstrapState = 'online';
      this.applyHydratedState(result.profile, result.gameState, result.capabilities);

      const profileNeedsReconcile = (
        this.globalData.profile?.nickname !== result.profile.nickname
        || this.globalData.profile?.avatarUrl !== result.profile.avatarUrl
      );
      if (profileNeedsReconcile && this.globalData.profile) {
        void saveProfileToCloud(this.globalData.profile).catch((error) => {
          console.warn('Profile reconciliation failed after bootstrap.', error);
        });
      }
    } catch (error) {
      this.globalData.cloudBootstrapState = 'offline';
      console.warn('Cloud login failed, using local state.', error);
      this.refreshCurrentPage();
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

  applyHydratedState(
    profile: UserProfile,
    gameState: GameState,
    capabilities?: AppCapabilities,
  ) {
    const mergedProfile = mergeHydratedProfile(this.globalData.profile, profile) || profile;
    this.globalData.profile = mergedProfile;
    this.globalData.gameState = sanitizeHydratedGameState(gameState);
    if (capabilities) this.globalData.capabilities = capabilities;
    saveLocalProfile(mergedProfile);
    saveLocalGameState(this.globalData.gameState);
    this.ensureProfileSetup();
    this.refreshCurrentPage();
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
      claimMigrationConfigured: this.globalData.capabilities.claimMigrationConfigured,
      cloudBootstrapState: this.globalData.cloudBootstrapState,
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

  ensureProfileSetup() {
    if (!shouldRequireProfileSetup(this.globalData.profile, null)) {
      onboardingNavigationPending = false;
    }
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
    const currentPage = pages[pages.length - 1] as { route?: string } | undefined;
    const currentRoute = currentPage?.route || null;
    if (!shouldRequireProfileSetup(this.globalData.profile, currentRoute)) {
      onboardingNavigationPending = false;
      return;
    }
    if (!currentRoute) {
      setTimeout(() => this.ensureProfileSetup(), 0);
      return;
    }
    if (onboardingNavigationPending) return;

    onboardingNavigationPending = true;
    const returnTab = encodeURIComponent(`/${currentRoute}`);
    wx.navigateTo({
      url: `/pages/claim-profile/index?mode=onboarding&returnTab=${returnTab}`,
      fail: () => {
        onboardingNavigationPending = false;
      },
    });
  },

  async updateProfile(profilePatch: Partial<UserProfile>) {
    const nextProfile = buildProfileUpdate(this.globalData.profile, profilePatch, {
      openId: this.globalData.profile?.openId || '',
    });
    this.globalData.profile = nextProfile;
    saveLocalProfile(nextProfile);
    this.ensureProfileSetup();
    this.refreshCurrentPage();

    try {
      const result = await saveProfileToCloud(nextProfile);
      const mergedProfile = mergeHydratedProfile(nextProfile, result.profile) || result.profile;
      this.globalData.profile = mergedProfile;
      this.globalData.cloudBootstrapState = 'online';
      saveLocalProfile(mergedProfile);
      this.ensureProfileSetup();
      this.refreshCurrentPage();
      return { profile: mergedProfile, cloudSaved: true };
    } catch (error) {
      this.globalData.cloudBootstrapState = 'offline';
      console.warn('Profile sync failed; local profile is preserved.', error);
      this.refreshCurrentPage();
      return { profile: nextProfile, cloudSaved: false };
    }
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
