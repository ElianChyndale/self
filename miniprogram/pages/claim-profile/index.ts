import { claimMigration } from '../../utils/cloud';
import { buildThemePageData } from '../../utils/pageData';
import { sanitizeHydratedGameState } from '../../utils/gameState';
import { syncCustomTabBar } from '../../utils/tabBar';
import { getDefaultProfileName, getLanguagePack } from '../../utils/language';

Page({
  data: {
    ...buildThemePageData(
      getApp<IAppOption>().globalData.themePreference,
      getApp<IAppOption>().globalData.activeTheme,
      getApp<IAppOption>().globalData.statusBarHeight,
      getApp<IAppOption>().globalData.languagePreference,
      getApp<IAppOption>().globalData.activeLanguage,
    ),
    nickname: '',
    avatarUrl: '',
    email: '',
    claimCode: '',
    copy: null,
  },

  onShow() {
    const app = getApp<IAppOption>();
    syncCustomTabBar(this, 4, app.globalData.activeTheme, app.globalData.activeLanguage);
    const profile = app.globalData.profile;
    const copy = getLanguagePack(app.globalData.activeLanguage);
    this.setData({
      ...buildThemePageData(
        app.globalData.themePreference,
        app.globalData.activeTheme,
        app.globalData.statusBarHeight,
        app.globalData.languagePreference,
        app.globalData.activeLanguage,
      ),
      copy,
      nickname: profile?.nickname || '',
      avatarUrl: profile?.avatarUrl || '',
    });
  },

  chooseAvatar(event: any) {
    this.setData({ avatarUrl: event.detail.avatarUrl });
  },

  onNicknameInput(event: any) {
    this.setData({ nickname: event.detail.value });
  },

  onEmailInput(event: any) {
    this.setData({ email: event.detail.value });
  },

  onClaimCodeInput(event: any) {
    this.setData({ claimCode: event.detail.value });
  },

  saveProfile() {
    const app = getApp<IAppOption>();
    app.updateProfile({
      nickname: String(this.data.nickname || '').trim() || getDefaultProfileName(app.globalData.activeLanguage),
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
      const result = await claimMigration(email, claimCode);
      const app = getApp<IAppOption>();
      app.globalData.profile = result.profile;
      app.updateProfile(result.profile);
      app.updateGameState(sanitizeHydratedGameState(result.gameState));
      wx.showToast({ title: this.data.copy.profile.claimedToast, icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/stats/index' }), 700);
    } catch (error) {
      console.error(error);
      wx.showToast({ title: this.data.copy.profile.failedToast, icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },
});
