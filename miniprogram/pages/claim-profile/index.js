"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloud_1 = require("../../utils/cloud");
const pageData_1 = require("../../utils/pageData");
const gameState_1 = require("../../utils/gameState");
const tabBar_1 = require("../../utils/tabBar");
const language_1 = require("../../utils/language");
Page({
    data: {
        ...(0, pageData_1.buildThemePageData)(getApp().globalData.themePreference, getApp().globalData.activeTheme, getApp().globalData.statusBarHeight, getApp().globalData.languagePreference, getApp().globalData.activeLanguage),
        nickname: '',
        avatarUrl: '',
        email: '',
        claimCode: '',
        copy: null,
    },
    onShow() {
        const app = getApp();
        (0, tabBar_1.syncCustomTabBar)(this, 4, app.globalData.activeTheme, app.globalData.activeLanguage);
        const profile = app.globalData.profile;
        const copy = (0, language_1.getLanguagePack)(app.globalData.activeLanguage);
        this.setData({
            ...(0, pageData_1.buildThemePageData)(app.globalData.themePreference, app.globalData.activeTheme, app.globalData.statusBarHeight, app.globalData.languagePreference, app.globalData.activeLanguage),
            copy,
            nickname: (profile === null || profile === void 0 ? void 0 : profile.nickname) || '',
            avatarUrl: (profile === null || profile === void 0 ? void 0 : profile.avatarUrl) || '',
        });
    },
    chooseAvatar(event) {
        this.setData({ avatarUrl: event.detail.avatarUrl });
    },
    onNicknameInput(event) {
        this.setData({ nickname: event.detail.value });
    },
    onEmailInput(event) {
        this.setData({ email: event.detail.value });
    },
    onClaimCodeInput(event) {
        this.setData({ claimCode: event.detail.value });
    },
    saveProfile() {
        const app = getApp();
        app.updateProfile({
            nickname: String(this.data.nickname || '').trim() || (0, language_1.getDefaultProfileName)(app.globalData.activeLanguage),
            avatarUrl: this.data.avatarUrl,
        });
        wx.showToast({ title: this.data.copy.profile.savedToast, icon: 'success' });
    },
    async claimData() {
        const email = String(this.data.email || '').trim();
        const claimCode = String(this.data.claimCode || '').trim();
        if (!email || !claimCode) {
            wx.showToast({ title: this.data.copy.profile.requiredToast, icon: 'none' });
            return;
        }
        wx.showLoading({ title: this.data.copy.profile.claimingToast });
        try {
            const result = await (0, cloud_1.claimMigration)(email, claimCode);
            const app = getApp();
            app.globalData.profile = result.profile;
            app.updateProfile(result.profile);
            app.updateGameState((0, gameState_1.sanitizeHydratedGameState)(result.gameState));
            wx.showToast({ title: this.data.copy.profile.claimedToast, icon: 'success' });
            setTimeout(() => wx.switchTab({ url: '/pages/stats/index' }), 700);
        }
        catch (error) {
            console.error(error);
            wx.showToast({ title: this.data.copy.profile.failedToast, icon: 'none' });
        }
        finally {
            wx.hideLoading();
        }
    },
});
