import {
  pauseWork,
  resumeWork,
  startLongRest,
  startWork,
  stopWork,
  tickClock,
} from '../../utils/gameState';
import { buildSharedPageData } from '../../utils/pageData';
import { syncCustomTabBar } from '../../utils/tabBar';
import { getLanguagePack } from '../../utils/language';

let clockTimer: ReturnType<typeof setInterval> | null = null;

Page({
  data: {
    ...buildSharedPageData(
      null,
      getApp<IAppOption>().globalData.gameState,
      getApp<IAppOption>().globalData.themePreference,
      getApp<IAppOption>().globalData.activeTheme,
      getApp<IAppOption>().globalData.statusBarHeight,
      getApp<IAppOption>().globalData.languagePreference,
      getApp<IAppOption>().globalData.activeLanguage,
    ),
    clockLabel: 'Idle',
    restMessage: '',
    copy: null,
  },

  onShow() {
    const app = getApp<IAppOption>();
    syncCustomTabBar(this, 3, app.globalData.activeTheme, app.globalData.activeLanguage);
    this.refresh();
    clockTimer = setInterval(() => this.tick(), 1000);
  },

  onHide() {
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = null;
  },

  refresh() {
    const app = getApp<IAppOption>();
    const shared = buildSharedPageData(
      app.globalData.profile,
      app.globalData.gameState,
      app.globalData.themePreference,
      app.globalData.activeTheme,
      app.globalData.statusBarHeight,
      app.globalData.languagePreference,
      app.globalData.activeLanguage,
    );
    const copy = getLanguagePack(app.globalData.activeLanguage);
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
    const app = getApp<IAppOption>();
    const next = tickClock(app.globalData.gameState);
    if (next !== app.globalData.gameState) app.updateGameState(next);
    this.refresh();
  },

  beginDuty() {
    const app = getApp<IAppOption>();
    if (app.globalData.gameState.currentEnergy <= 0) {
      wx.showToast({ title: this.data.copy.clock.depletedToast, icon: 'none' });
      return;
    }
    app.updateGameState(startWork(app.globalData.gameState));
    this.refresh();
  },

  pauseDuty() {
    const app = getApp<IAppOption>();
    app.updateGameState(pauseWork(app.globalData.gameState));
    this.refresh();
  },

  resumeDuty() {
    const app = getApp<IAppOption>();
    app.updateGameState(resumeWork(app.globalData.gameState));
    this.refresh();
  },

  stopDuty() {
    const app = getApp<IAppOption>();
    app.updateGameState(stopWork(app.globalData.gameState));
    this.refresh();
  },

  recoverDuty() {
    const app = getApp<IAppOption>();
    app.updateGameState(startLongRest(app.globalData.gameState));
    this.refresh();
  },
});
