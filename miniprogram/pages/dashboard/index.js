"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pageData_1 = require("../../utils/pageData");
const tabBar_1 = require("../../utils/tabBar");
const language_1 = require("../../utils/language");
Page({
    data: {
        ...(0, pageData_1.buildSharedPageData)(null, getApp().globalData.gameState, getApp().globalData.themePreference, getApp().globalData.activeTheme, getApp().globalData.statusBarHeight, getApp().globalData.languagePreference, getApp().globalData.activeLanguage),
        themeChooserOpen: false,
        copy: null,
    },
    onShow() {
        const app = getApp();
        (0, tabBar_1.syncCustomTabBar)(this, 0, app.globalData.activeTheme, app.globalData.activeLanguage);
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
            rankHeadline: `${shared.profileName} · ${copy.dashboard.rankTitle} ${shared.rank.currentLevel}`,
            rankProgressText: copy.dashboard.rankProgress(shared.rank.xpIntoLevel, shared.rank.xpNeededForLevel, shared.rank.nextLevel),
            xpRemainingText: copy.dashboard.xpRemaining(shared.rank.xpRemaining),
            queuedText: copy.dashboard.queued(shared.activeTodos.length),
            activeTodos: shared.activeTodos.slice(0, 3).map((todo) => ({
                ...todo,
                difficultyLabel: (0, language_1.getDifficultyLabel)(todo.difficulty, app.globalData.activeLanguage),
            })),
        });
    },
    toggleThemeChooser() {
        this.setData({ themeChooserOpen: !this.data.themeChooserOpen });
    },
    chooseTheme(event) {
        const preference = event.currentTarget.dataset.preference;
        const app = getApp();
        app.setThemePreference(preference);
        this.setData({ themeChooserOpen: false });
        this.refresh();
    },
});
