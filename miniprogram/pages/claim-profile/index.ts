import { claimMigration } from '../../utils/cloud';
import { buildThemePageData } from '../../utils/pageData';
import { sanitizeHydratedGameState } from '../../utils/gameState';
import { syncCustomTabBar } from '../../utils/tabBar';
import { getDefaultProfileName, getLanguagePack } from '../../utils/language';
import { isProfileComplete } from '../../utils/profile';

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

  onLoad(options: Record<string, string>) {
    this.setData({
      mode: options?.mode === 'onboarding' ? 'onboarding' : 'standard',
      returnTab: decodeURIComponent(options?.returnTab || '/pages/dashboard/index'),
    });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const app = getApp<IAppOption>();
    const profile = app.globalData.profile;
    const copy = getLanguagePack(app.globalData.activeLanguage);
    const nickname = String(this.data.nickname || '').trim() ? this.data.nickname : (profile?.nickname || '');
    const avatarUrl = String(this.data.avatarUrl || '').trim() ? this.data.avatarUrl : (profile?.avatarUrl || '');
    const canSaveProfile = Boolean(String(nickname || '').trim() && String(avatarUrl || '').trim());
    const claimState = this.resolveClaimAvailability(copy);
    syncCustomTabBar(this, 4, app.globalData.activeTheme, app.globalData.activeLanguage);
    this.setData({
      ...buildThemePageData(
        app.globalData.themePreference,
        app.globalData.activeTheme,
        app.globalData.statusBarHeight,
        app.globalData.languagePreference,
        app.globalData.activeLanguage,
      ),
      copy,
      nickname,
      avatarUrl,
      canSaveProfile,
      claimAvailable: claimState.available,
      claimStatusTone: claimState.tone,
      claimStatusText: claimState.text,
    });
  },

  chooseAvatar(event: any) {
    const avatarUrl = String(event.detail.avatarUrl || '');
    this.setData({
      avatarUrl,
      canSaveProfile: Boolean(String(this.data.nickname || '').trim() && avatarUrl.trim()),
      profileStatusTone: '',
      profileStatusText: '',
    });
  },

  onNicknameInput(event: any) {
    const nickname = String(event.detail.value || '');
    this.setData({
      nickname,
      canSaveProfile: Boolean(nickname.trim() && String(this.data.avatarUrl || '').trim()),
      profileStatusTone: '',
      profileStatusText: '',
    });
  },

  onEmailInput(event: any) {
    this.setData({ email: event.detail.value });
  },

  onClaimCodeInput(event: any) {
    this.setData({ claimCode: event.detail.value });
  },

  async saveProfile() {
    if (!this.data.canSaveProfile || this.data.profileSaveBusy) {
      wx.showToast({ title: this.data.copy.profile.profileRequiredToast, icon: 'none' });
      return;
    }

    this.setData({
      profileSaveBusy: true,
      profileStatusTone: 'info',
      profileStatusText: this.data.copy.profile.savingProfile,
    });

    const app = getApp<IAppOption>();
    const result = await app.updateProfile({
      nickname: String(this.data.nickname || '').trim() || getDefaultProfileName(app.globalData.activeLanguage),
      avatarUrl: this.data.avatarUrl,
    });
    this.refresh();
    this.setData({
      profileSaveBusy: false,
      profileStatusTone: result.cloudSaved ? 'success' : 'warn',
      profileStatusText: result.cloudSaved
        ? this.data.copy.profile.savedInline
        : this.data.copy.profile.savedLocalOnly,
    });

    if (this.data.mode === 'onboarding' && isProfileComplete(app.globalData.profile)) {
      setTimeout(() => {
        wx.switchTab({ url: this.data.returnTab || '/pages/dashboard/index' });
      }, 500);
    }
  },

  async claimData() {
    if (!this.data.claimAvailable || this.data.claimBusy) return;

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
      const result = await claimMigration(email, claimCode);
      const app = getApp<IAppOption>();
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
      app.applyHydratedState(result.profile, sanitizeHydratedGameState(result.gameState), result.capabilities);
      this.refresh();
      this.setData({
        claimBusy: false,
        claimStatusTone: 'success',
        claimStatusText: this.data.copy.profile.claimedToast,
      });

      if (this.data.mode === 'onboarding' && isProfileComplete(app.globalData.profile)) {
        setTimeout(() => wx.switchTab({ url: this.data.returnTab || '/pages/dashboard/index' }), 700);
      }
    } catch (error) {
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

  resolveClaimAvailability(copy: ReturnType<typeof getLanguagePack>) {
    const app = getApp<IAppOption>();
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

  messageForClaimFailure(code: string) {
    if (code === 'INVALID_CODE') return this.data.copy.profile.claimInvalid;
    if (code === 'ALREADY_USED') return this.data.copy.profile.claimUsed;
    if (code === 'EXPIRED') return this.data.copy.profile.claimExpired;
    if (code === 'NOT_CONFIGURED') return this.data.copy.profile.claimNotConfigured;
    return this.data.copy.profile.claimUnknown;
  },
});
