"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameState_1 = require("../../utils/gameState");
const pageData_1 = require("../../utils/pageData");
const tabBar_1 = require("../../utils/tabBar");
const language_1 = require("../../utils/language");
let clockTimer = null;
Page({
    data: {
        ...(0, pageData_1.buildSharedPageData)(null, getApp().globalData.gameState, getApp().globalData.themePreference, getApp().globalData.activeTheme, getApp().globalData.statusBarHeight, getApp().globalData.languagePreference, getApp().globalData.activeLanguage),
        clockLabel: 'Idle',
        restMessage: '',
        copy: null,
    },
    onShow() {
        const app = getApp();
        (0, tabBar_1.syncCustomTabBar)(this, 3, app.globalData.activeTheme, app.globalData.activeLanguage);
        this.refresh();
        clockTimer = setInterval(() => this.tick(), 1000);
    },
    onHide() {
        if (clockTimer)
            clearInterval(clockTimer);
        clockTimer = null;
    },
    refresh() {
        const app = getApp();
        const shared = (0, pageData_1.buildSharedPageData)(app.globalData.profile, app.globalData.gameState, app.globalData.themePreference, app.globalData.activeTheme, app.globalData.statusBarHeight, app.globalData.languagePreference, app.globalData.activeLanguage);
        const copy = (0, language_1.getLanguagePack)(app.globalData.activeLanguage);
        const session = app.globalData.gameState.workSession;
        const nextEnergy = Math.max(0, app.globalData.gameState.currentEnergy - 10);
        this.setData({
            ...shared,
            copy,
            clockLabel: session.state === 'working'
                ? copy.clock.dutyActive
                : session.state === 'paused'
                    ? copy.clock.dutyPaused
                    : session.state === 'resting'
                        ? session.restType === 'long' ? copy.clock.longRecovery : copy.clock.shortRest
                        : copy.clock.idle,
            restMessage: session.restType === 'long'
                ? copy.clock.longRestMessage
                : copy.clock.shortRestMessage(nextEnergy),
        });
    },
    tick() {
        const app = getApp();
        const next = (0, gameState_1.tickClock)(app.globalData.gameState);
        if (next !== app.globalData.gameState)
            app.updateGameState(next);
        this.refresh();
    },
    beginDuty() {
        const app = getApp();
        if (app.globalData.gameState.currentEnergy <= 0) {
            wx.showToast({ title: this.data.copy.clock.depletedToast, icon: 'none' });
            return;
        }
        app.updateGameState((0, gameState_1.startWork)(app.globalData.gameState));
        this.refresh();
    },
    pauseDuty() {
        const app = getApp();
        app.updateGameState((0, gameState_1.pauseWork)(app.globalData.gameState));
        this.refresh();
    },
    resumeDuty() {
        const app = getApp();
        app.updateGameState((0, gameState_1.resumeWork)(app.globalData.gameState));
        this.refresh();
    },
    stopDuty() {
        const app = getApp();
        app.updateGameState((0, gameState_1.stopWork)(app.globalData.gameState));
        this.refresh();
    },
    recoverDuty() {
        const app = getApp();
        app.updateGameState((0, gameState_1.startLongRest)(app.globalData.gameState));
        this.refresh();
    },
});
