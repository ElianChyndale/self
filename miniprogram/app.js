"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloud_1 = require("./utils/cloud");
const gameState_1 = require("./utils/gameState");
const profile_1 = require("./utils/profile");
const storage_1 = require("./utils/storage");
const cloud_2 = require("./utils/cloud");
const language_1 = require("./utils/language");
const theme_1 = require("./utils/theme");
let syncTimer = null;
let onboardingNavigationPending = false;
App({
    globalData: {
        profile: null,
        gameState: (0, gameState_1.createDefaultGameState)(),
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
        (0, cloud_2.initCloud)();
        this.initializeTheme();
        this.initializeLanguage();
        void this.bootstrap();
    },
    async bootstrap() {
        var _a, _b;
        const localProfile = (0, storage_1.loadLocalProfile)();
        const localGameState = (0, storage_1.loadLocalGameState)();
        if (localProfile)
            this.globalData.profile = localProfile;
        if (localGameState)
            this.globalData.gameState = localGameState;
        this.globalData.ready = true;
        this.ensureProfileSetup();
        this.refreshCurrentPage();
        try {
            const result = await (0, cloud_1.loginWithCloud)();
            this.globalData.cloudBootstrapState = 'online';
            this.applyHydratedState(result.profile, result.gameState, result.capabilities);
            const profileNeedsReconcile = (((_a = this.globalData.profile) === null || _a === void 0 ? void 0 : _a.nickname) !== result.profile.nickname
                || ((_b = this.globalData.profile) === null || _b === void 0 ? void 0 : _b.avatarUrl) !== result.profile.avatarUrl);
            if (profileNeedsReconcile && this.globalData.profile) {
                void (0, cloud_1.saveProfileToCloud)(this.globalData.profile).catch((error) => {
                    console.warn('Profile reconciliation failed after bootstrap.', error);
                });
            }
        }
        catch (error) {
            this.globalData.cloudBootstrapState = 'offline';
            console.warn('Cloud login failed, using local state.', error);
            this.refreshCurrentPage();
        }
    },
    initializeTheme() {
        const themePreference = (0, storage_1.loadLocalThemePreference)();
        const systemTheme = (0, theme_1.detectSystemTheme)();
        const statusBarHeight = (0, theme_1.detectStatusBarHeight)();
        this.globalData.themePreference = themePreference;
        this.globalData.systemTheme = systemTheme;
        this.globalData.activeTheme = (0, theme_1.resolveActiveTheme)(themePreference, systemTheme);
        this.globalData.statusBarHeight = statusBarHeight;
        (0, theme_1.applyThemeChrome)(this.globalData.activeTheme);
        if (typeof wx.onThemeChange === 'function') {
            wx.onThemeChange((event) => {
                this.handleSystemThemeChange(event === null || event === void 0 ? void 0 : event.theme);
            });
        }
    },
    initializeLanguage() {
        const languagePreference = (0, storage_1.loadLocalLanguagePreference)();
        const systemLanguage = (0, language_1.detectSystemLanguage)();
        this.globalData.languagePreference = languagePreference;
        this.globalData.activeLanguage = (0, language_1.resolveActiveLanguage)(languagePreference, systemLanguage, null);
        if (languagePreference === 'auto') {
            void this.refineAutoLanguageFromRegion();
        }
    },
    async refineAutoLanguageFromRegion() {
        const regionalLanguage = await (0, language_1.detectRegionalLanguage)();
        if (!regionalLanguage || this.globalData.languagePreference !== 'auto')
            return;
        const nextLanguage = (0, language_1.resolveActiveLanguage)(this.globalData.languagePreference, (0, language_1.detectSystemLanguage)(), regionalLanguage);
        if (nextLanguage === this.globalData.activeLanguage)
            return;
        this.globalData.activeLanguage = nextLanguage;
        this.syncThemeToCurrentPage();
    },
    handleSystemThemeChange(nextTheme) {
        this.globalData.systemTheme = (0, theme_1.normalizeDeviceTheme)(nextTheme);
        if (this.globalData.themePreference === 'system') {
            this.globalData.activeTheme = this.globalData.systemTheme;
            this.syncThemeToCurrentPage();
        }
    },
    setThemePreference(nextPreference) {
        const themePreference = (0, theme_1.resolveThemePreference)(nextPreference);
        this.globalData.themePreference = themePreference;
        this.globalData.activeTheme = (0, theme_1.resolveActiveTheme)(themePreference, this.globalData.systemTheme);
        (0, storage_1.saveLocalThemePreference)(themePreference);
        this.syncThemeToCurrentPage();
    },
    setLanguagePreference(nextPreference) {
        const languagePreference = (0, language_1.resolveLanguagePreference)(nextPreference);
        this.globalData.languagePreference = languagePreference;
        this.globalData.activeLanguage = (0, language_1.resolveActiveLanguage)(languagePreference, (0, language_1.detectSystemLanguage)(), null);
        (0, storage_1.saveLocalLanguagePreference)(languagePreference);
        this.syncThemeToCurrentPage();
    },
    applyHydratedState(profile, gameState, capabilities) {
        const mergedProfile = (0, profile_1.mergeHydratedProfile)(this.globalData.profile, profile) || profile;
        this.globalData.profile = mergedProfile;
        this.globalData.gameState = (0, gameState_1.sanitizeHydratedGameState)(gameState);
        if (capabilities)
            this.globalData.capabilities = capabilities;
        (0, storage_1.saveLocalProfile)(mergedProfile);
        (0, storage_1.saveLocalGameState)(this.globalData.gameState);
        this.ensureProfileSetup();
        this.refreshCurrentPage();
    },
    syncThemeToCurrentPage() {
        var _a, _b, _c, _d;
        (0, theme_1.applyThemeChrome)(this.globalData.activeTheme);
        const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
        const currentPage = pages[pages.length - 1];
        (_a = currentPage === null || currentPage === void 0 ? void 0 : currentPage.setData) === null || _a === void 0 ? void 0 : _a.call(currentPage, {
            activeTheme: this.globalData.activeTheme,
            themePreference: this.globalData.themePreference,
            activeLanguage: this.globalData.activeLanguage,
            languagePreference: this.globalData.languagePreference,
            languageLabel: (0, language_1.getLanguageName)(this.globalData.activeLanguage),
            claimMigrationConfigured: this.globalData.capabilities.claimMigrationConfigured,
            cloudBootstrapState: this.globalData.cloudBootstrapState,
            themeLabel: (0, theme_1.getThemeLabel)(this.globalData.themePreference, this.globalData.activeLanguage),
            activeThemeLabel: (0, theme_1.getThemeLabel)(this.globalData.activeTheme, this.globalData.activeLanguage),
            statusBarHeight: this.globalData.statusBarHeight,
        });
        (_d = (_c = (_b = currentPage === null || currentPage === void 0 ? void 0 : currentPage.getTabBar) === null || _b === void 0 ? void 0 : _b.call(currentPage)) === null || _c === void 0 ? void 0 : _c.setData) === null || _d === void 0 ? void 0 : _d.call(_c, {
            activeTheme: this.globalData.activeTheme,
            items: (0, language_1.getTabBarItems)(this.globalData.activeLanguage),
        });
    },
    refreshCurrentPage() {
        var _a;
        const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
        const currentPage = pages[pages.length - 1];
        (_a = currentPage === null || currentPage === void 0 ? void 0 : currentPage.refresh) === null || _a === void 0 ? void 0 : _a.call(currentPage);
    },
    ensureProfileSetup() {
        if (!(0, profile_1.shouldRequireProfileSetup)(this.globalData.profile, null)) {
            onboardingNavigationPending = false;
        }
        const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
        const currentPage = pages[pages.length - 1];
        const currentRoute = (currentPage === null || currentPage === void 0 ? void 0 : currentPage.route) || null;
        if (!(0, profile_1.shouldRequireProfileSetup)(this.globalData.profile, currentRoute)) {
            onboardingNavigationPending = false;
            return;
        }
        if (!currentRoute) {
            setTimeout(() => this.ensureProfileSetup(), 0);
            return;
        }
        if (onboardingNavigationPending)
            return;
        onboardingNavigationPending = true;
        const returnTab = encodeURIComponent(`/${currentRoute}`);
        wx.navigateTo({
            url: `/pages/claim-profile/index?mode=onboarding&returnTab=${returnTab}`,
            fail: () => {
                onboardingNavigationPending = false;
            },
        });
    },
    async updateProfile(profilePatch) {
        var _a;
        const nextProfile = (0, profile_1.buildProfileUpdate)(this.globalData.profile, profilePatch, {
            openId: ((_a = this.globalData.profile) === null || _a === void 0 ? void 0 : _a.openId) || '',
        });
        this.globalData.profile = nextProfile;
        (0, storage_1.saveLocalProfile)(nextProfile);
        this.ensureProfileSetup();
        this.refreshCurrentPage();
        try {
            const result = await (0, cloud_1.saveProfileToCloud)(nextProfile);
            const mergedProfile = (0, profile_1.mergeHydratedProfile)(nextProfile, result.profile) || result.profile;
            this.globalData.profile = mergedProfile;
            this.globalData.cloudBootstrapState = 'online';
            (0, storage_1.saveLocalProfile)(mergedProfile);
            this.ensureProfileSetup();
            this.refreshCurrentPage();
            return { profile: mergedProfile, cloudSaved: true };
        }
        catch (error) {
            this.globalData.cloudBootstrapState = 'offline';
            console.warn('Profile sync failed; local profile is preserved.', error);
            this.refreshCurrentPage();
            return { profile: nextProfile, cloudSaved: false };
        }
    },
    updateGameState(gameState) {
        this.globalData.gameState = gameState;
        (0, storage_1.saveLocalGameState)(gameState);
        this.syncGameState();
    },
    syncGameState() {
        if (syncTimer)
            clearTimeout(syncTimer);
        syncTimer = setTimeout(async () => {
            try {
                await (0, cloud_1.saveGameStateToCloud)(this.globalData.gameState);
            }
            catch (error) {
                console.warn('Game state sync failed; local state is preserved.', error);
            }
        }, 1500);
    },
});
