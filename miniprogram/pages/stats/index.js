"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pageData_1 = require("../../utils/pageData");
const tabBar_1 = require("../../utils/tabBar");
const language_1 = require("../../utils/language");
Page({
    data: (0, pageData_1.buildSharedPageData)(null, getApp().globalData.gameState, getApp().globalData.themePreference, getApp().globalData.activeTheme, getApp().globalData.statusBarHeight, getApp().globalData.languagePreference, getApp().globalData.activeLanguage),
    onShow() {
        const app = getApp();
        (0, tabBar_1.syncCustomTabBar)(this, 4, app.globalData.activeTheme, app.globalData.activeLanguage);
        this.refresh();
        setTimeout(() => this.refresh(), 500);
    },
    refresh() {
        const app = getApp();
        const shared = (0, pageData_1.buildSharedPageData)(app.globalData.profile, app.globalData.gameState, app.globalData.themePreference, app.globalData.activeTheme, app.globalData.statusBarHeight, app.globalData.languagePreference, app.globalData.activeLanguage);
        const copy = (0, language_1.getLanguagePack)(app.globalData.activeLanguage);
        this.setData({
            ...shared,
            copy,
            rankTitleText: copy.stats.rankTitle(shared.rank.currentLevel),
            rankProgressText: copy.stats.rankProgress(shared.rank.xpIntoLevel, shared.rank.xpNeededForLevel, shared.rank.nextLevel),
            currentThresholdText: copy.stats.currentThreshold(shared.rank.currentLevel, shared.rank.currentThreshold),
            nextThresholdText: copy.stats.nextThreshold(shared.rank.nextLevel, shared.rank.nextThreshold),
            totalXpSummaryText: copy.stats.totalXpSummary(shared.totalXp, shared.rank.xpRemaining),
            languageToggleText: copy.stats.languageToggle(app.globalData.activeLanguage),
        });
    },
    openProfile() {
        wx.navigateTo({ url: '/pages/claim-profile/index' });
    },
    toggleLanguage() {
        const app = getApp();
        app.setLanguagePreference(app.globalData.activeLanguage === 'zh-CN' ? 'en' : 'zh-CN');
        this.refresh();
    },
});
