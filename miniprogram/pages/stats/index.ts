import { buildSharedPageData } from '../../utils/pageData';
import { syncCustomTabBar } from '../../utils/tabBar';
import { getLanguagePack } from '../../utils/language';

Page({
  data: buildSharedPageData(
    null,
    getApp<IAppOption>().globalData.gameState,
    getApp<IAppOption>().globalData.themePreference,
    getApp<IAppOption>().globalData.activeTheme,
    getApp<IAppOption>().globalData.statusBarHeight,
    getApp<IAppOption>().globalData.languagePreference,
    getApp<IAppOption>().globalData.activeLanguage,
  ),

  onShow() {
    const app = getApp<IAppOption>();
    syncCustomTabBar(this, 4, app.globalData.activeTheme, app.globalData.activeLanguage);
    this.refresh();
    setTimeout(() => this.refresh(), 500);
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
    this.setData({
      ...shared,
      copy,
      rankTitleText: copy.stats.rankTitle(shared.rank.currentLevel),
      rankProgressText: copy.stats.rankProgress(
        shared.rank.xpIntoLevel,
        shared.rank.xpNeededForLevel,
        shared.rank.nextLevel,
      ),
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
    const app = getApp<IAppOption>();
    app.setLanguagePreference(app.globalData.activeLanguage === 'zh-CN' ? 'en' : 'zh-CN');
    this.refresh();
  },
});
