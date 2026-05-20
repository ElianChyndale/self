"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloud_1 = require("../../utils/cloud");
const pageData_1 = require("../../utils/pageData");
const gameState_1 = require("../../utils/gameState");
const tabBar_1 = require("../../utils/tabBar");
const language_1 = require("../../utils/language");
const profile_1 = require("../../utils/profile");
Page({
    data: {
        ...(0, pageData_1.buildThemePageData)(getApp().globalData.themePreference, getApp().globalData.activeTheme, getApp().globalData.statusBarHeight, getApp().globalData.languagePreference, getApp().globalData.activeLanguage),
        nickname: '',
        avatarUrl: '',
        email: '',
        claimCode: '',
        copy: null,
        mode: 'standard',
        returnTab: '/pages/dashboard/index',
        canSaveProfile: false,
        profileSaveBusy: false,
        profileStatusTone: '',
        profileStatusText: '',
        claimBusy: false,
        claimAvailable: false,
        claimStatusTone: '',
        claimStatusText: '',
    },
    onLoad(options) {
        this.setData({
            mode: (options === null || options === void 0 ? void 0 : options.mode) === 'onboarding' ? 'onboarding' : 'standard',
            returnTab: decodeURIComponent((options === null || options === void 0 ? void 0 : options.returnTab) || '/pages/dashboard/index'),
        });
    },
    onShow() {
        this.refresh();
    },
    refresh() {
        const app = getApp();
        const profile = app.globalData.profile;
        const copy = (0, language_1.getLanguagePack)(app.globalData.activeLanguage);
        const nickname = String(this.data.nickname || '').trim() ? this.data.nickname : ((profile === null || profile === void 0 ? void 0 : profile.nickname) || '');
        const avatarUrl = String(this.data.avatarUrl || '').trim() ? this.data.avatarUrl : ((profile === null || profile === void 0 ? void 0 : profile.avatarUrl) || '');
        const canSaveProfile = Boolean(String(nickname || '').trim() && String(avatarUrl || '').trim());
        const claimState = this.resolveClaimAvailability(copy);
        (0, tabBar_1.syncCustomTabBar)(this, 4, app.globalData.activeTheme, app.globalData.activeLanguage);
        this.setData({
            ...(0, pageData_1.buildThemePageData)(app.globalData.themePreference, app.globalData.activeTheme, app.globalData.statusBarHeight, app.globalData.languagePreference, app.globalData.activeLanguage),
            copy,
            nickname,
            avatarUrl,
            canSaveProfile,
            claimAvailable: claimState.available,
            claimStatusTone: claimState.tone,
            claimStatusText: claimState.text,
        });
    },
    chooseAvatar(event) {
        const avatarUrl = String(event.detail.avatarUrl || '');
        this.setData({
            avatarUrl,
            canSaveProfile: Boolean(String(this.data.nickname || '').trim() && avatarUrl.trim()),
            profileStatusTone: '',
            profileStatusText: '',
        });
    },
    onNicknameInput(event) {
        const nickname = String(event.detail.value || '');
        this.setData({
            nickname,
            canSaveProfile: Boolean(nickname.trim() && String(this.data.avatarUrl || '').trim()),
            profileStatusTone: '',
            profileStatusText: '',
        });
    },
    onEmailInput(event) {
        this.setData({ email: event.detail.value });
    },
    onClaimCodeInput(event) {
        this.setData({ claimCode: event.detail.value });
    },
    async saveProfile() {
        var _a;
        if (!this.data.canSaveProfile || this.data.profileSaveBusy) {
            wx.showToast({ title: this.data.copy.profile.profileRequiredToast, icon: 'none' });
            return;
        }
        this.setData({
            profileSaveBusy: true,
            profileStatusTone: 'info',
            profileStatusText: this.data.copy.profile.savingProfile,
        });
        const app = getApp();
        let avatarUrl = String(this.data.avatarUrl || '').trim();
        if (this.isLocalTempAvatarPath(avatarUrl)) {
            this.setData({
                profileStatusTone: 'info',
                profileStatusText: this.data.copy.profile.uploadingAvatar,
            });
            try {
                avatarUrl = await (0, cloud_1.uploadAvatarToCloud)(avatarUrl, ((_a = app.globalData.profile) === null || _a === void 0 ? void 0 : _a.openId) || '');
                this.setData({ avatarUrl });
            }
            catch (error) {
                console.error('Avatar upload failed', error);
                this.setData({
                    profileSaveBusy: false,
                    profileStatusTone: 'error',
                    profileStatusText: this.data.copy.profile.avatarUploadFailed,
                });
                return;
            }
        }
        const result = await app.updateProfile({
            nickname: String(this.data.nickname || '').trim() || (0, language_1.getDefaultProfileName)(app.globalData.activeLanguage),
            avatarUrl,
        });
        this.refresh();
        this.setData({
            profileSaveBusy: false,
            profileStatusTone: result.cloudSaved ? 'success' : 'warn',
            profileStatusText: result.cloudSaved
                ? this.data.copy.profile.savedInline
                : this.data.copy.profile.savedLocalOnly,
        });
        if (this.data.mode === 'onboarding' && (0, profile_1.isProfileComplete)(app.globalData.profile)) {
            setTimeout(() => {
                wx.switchTab({ url: this.data.returnTab || '/pages/dashboard/index' });
            }, 500);
        }
    },
    async claimData() {
        if (!this.data.claimAvailable || this.data.claimBusy)
            return;
        const email = String(this.data.email || '').trim();
        const claimCode = String(this.data.claimCode || '').trim();
        if (!email || !claimCode) {
            wx.showToast({ title: this.data.copy.profile.requiredToast, icon: 'none' });
            return;
        }
        this.setData({
            claimBusy: true,
            claimStatusTone: 'info',
            claimStatusText: this.data.copy.profile.claimingToast,
        });
        try {
            const result = await (0, cloud_1.claimMigration)(email, claimCode);
            const app = getApp();
            app.globalData.cloudBootstrapState = 'online';
            if (!result.ok) {
                app.globalData.capabilities.claimMigrationConfigured = result.claimMigrationConfigured;
                this.refresh();
                this.setData({
                    claimBusy: false,
                    claimStatusTone: 'error',
                    claimStatusText: this.messageForClaimFailure(result.code),
                });
                return;
            }
            app.globalData.capabilities = result.capabilities;
            app.applyHydratedState(result.profile, (0, gameState_1.sanitizeHydratedGameState)(result.gameState), result.capabilities);
            this.refresh();
            this.setData({
                claimBusy: false,
                claimStatusTone: 'success',
                claimStatusText: this.data.copy.profile.claimedToast,
            });
            if (this.data.mode === 'onboarding' && (0, profile_1.isProfileComplete)(app.globalData.profile)) {
                setTimeout(() => wx.switchTab({ url: this.data.returnTab || '/pages/dashboard/index' }), 700);
            }
        }
        catch (error) {
            console.error(error);
            this.setData({
                claimBusy: false,
                claimStatusTone: 'error',
                claimStatusText: /timeout/i.test(String(error))
                    ? this.data.copy.profile.claimTimeout
                    : this.data.copy.profile.claimUnknown,
            });
        }
    },
    resolveClaimAvailability(copy) {
        const app = getApp();
        if (app.globalData.cloudBootstrapState === 'pending') {
            return { available: false, tone: 'info', text: copy.profile.claimChecking };
        }
        if (app.globalData.cloudBootstrapState === 'offline') {
            return { available: false, tone: 'warn', text: copy.profile.claimUnavailableOffline };
        }
        if (!app.globalData.capabilities.claimMigrationConfigured) {
            return { available: false, tone: 'warn', text: copy.profile.claimUnavailableUnconfigured };
        }
        return { available: true, tone: 'success', text: copy.profile.claimReady };
    },
    messageForClaimFailure(code) {
        if (code === 'INVALID_CODE')
            return this.data.copy.profile.claimInvalid;
        if (code === 'ALREADY_USED')
            return this.data.copy.profile.claimUsed;
        if (code === 'EXPIRED')
            return this.data.copy.profile.claimExpired;
        if (code === 'NOT_CONFIGURED')
            return this.data.copy.profile.claimNotConfigured;
        return this.data.copy.profile.claimUnknown;
    },
    isLocalTempAvatarPath(value) {
        return /^(wxfile:|http:\/\/tmp\/|https:\/\/tmp\/)/i.test(String(value || ''));
    },
});
