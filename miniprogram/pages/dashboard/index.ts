import { buildSharedPageData } from '../../utils/pageData';
import { syncCustomTabBar } from '../../utils/tabBar';
import { getDifficultyLabel, getLanguagePack } from '../../utils/language';

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
    themeChooserOpen: false,
    copy: null,
  },

  onShow() {
    const app = getApp<IAppOption>();
    syncCustomTabBar(this, 0, app.globalData.activeTheme, app.globalData.activeLanguage);
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
      rankHeadline: `${shared.profileName} · ${copy.dashboard.rankTitle} ${shared.rank.currentLevel}`,
      rankProgressText: copy.dashboard.rankProgress(
        shared.rank.xpIntoLevel,
        shared.rank.xpNeededForLevel,
        shared.rank.nextLevel,
      ),
      xpRemainingText: copy.dashboard.xpRemaining(shared.rank.xpRemaining),
      queuedText: copy.dashboard.queued(shared.activeTodos.length),
      activeTodos: shared.activeTodos.slice(0, 3).map((todo) => ({
        ...todo,
        difficultyLabel: getDifficultyLabel(todo.difficulty, app.globalData.activeLanguage),
      })),
    });
  },

  toggleThemeChooser() {
    this.setData({ themeChooserOpen: !this.data.themeChooserOpen });
  },

  chooseTheme(event: any) {
    const preference = event.currentTarget.dataset.preference;
    const app = getApp<IAppOption>();
    app.setThemePreference(preference);
    this.setData({ themeChooserOpen: false });
    this.refresh();
  },
});
