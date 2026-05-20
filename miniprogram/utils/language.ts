import type {
  AppLanguage,
  ClockState,
  IntelSource,
  LanguagePreference,
  NewsCategory,
  RestType,
  ThemePreference,
} from '../types';

export function resolveLanguagePreference(value: unknown): LanguagePreference {
  return value === 'zh-CN' || value === 'en' || value === 'auto' ? value : 'auto';
}

export function normalizeSystemLanguage(value: unknown): AppLanguage {
  return /^zh/i.test(String(value || '')) ? 'zh-CN' : 'en';
}

export function resolveActiveLanguage(
  preference: LanguagePreference,
  systemLanguage: AppLanguage,
  regionalLanguage: AppLanguage | null,
): AppLanguage {
  if (preference === 'zh-CN' || preference === 'en') return preference;
  return regionalLanguage || systemLanguage;
}

export function detectSystemLanguage(): AppLanguage {
  try {
    const systemInfo = wx.getSystemInfoSync?.();
    return normalizeSystemLanguage(systemInfo?.language);
  } catch (error) {
    console.warn('System language detection failed; defaulting to English.', error);
    return 'en';
  }
}

export function inferChinaByCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): AppLanguage | null {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  const inChina = latitude >= 18 && latitude <= 54 && longitude >= 73 && longitude <= 135;
  return inChina ? 'zh-CN' : 'en';
}

export async function detectRegionalLanguage(): Promise<AppLanguage | null> {
  try {
    const settings = await promisify<Record<string, unknown>>((callback) => wx.getSetting?.(callback));
    const authSetting = (settings?.authSetting || {}) as Record<string, boolean>;
    const canUseFuzzy = authSetting['scope.userFuzzyLocation'];
    const canUsePrecise = authSetting['scope.userLocation'];

    if (canUseFuzzy && typeof wx.getFuzzyLocation === 'function') {
      const location = await promisify<{ latitude?: number; longitude?: number }>((callback) =>
        wx.getFuzzyLocation({ type: 'wgs84', ...callback }));
      return inferChinaByCoordinates(location?.latitude, location?.longitude);
    }

    if (canUsePrecise && typeof wx.getLocation === 'function') {
      const location = await promisify<{ latitude?: number; longitude?: number }>((callback) =>
        wx.getLocation({ type: 'wgs84', ...callback }));
      return inferChinaByCoordinates(location?.latitude, location?.longitude);
    }
  } catch (error) {
    console.warn('Regional language detection failed; falling back to system language.', error);
  }

  return null;
}

export function getLanguageName(language: AppLanguage): string {
  return language === 'zh-CN' ? '中文' : 'English';
}

export function getThemeLabel(
  theme: ThemePreference | 'light' | 'dark',
  language: AppLanguage,
): string {
  const labels = language === 'zh-CN'
    ? { light: '浅色', dark: '深色', system: '跟随系统' }
    : { light: 'Light', dark: 'Dark', system: 'System' };
  return labels[theme as keyof typeof labels] || labels.system;
}

export function getTabBarItems(language: AppLanguage) {
  return [
    { pagePath: '/pages/dashboard/index', text: language === 'zh-CN' ? '指挥' : 'Command', sigil: 'CM' },
    { pagePath: '/pages/intel/index', text: language === 'zh-CN' ? '情报' : 'Intel', sigil: 'IN' },
    { pagePath: '/pages/roster/index', text: language === 'zh-CN' ? '任务' : 'Roster', sigil: 'MR' },
    { pagePath: '/pages/clock/index', text: language === 'zh-CN' ? '时钟' : 'Clock', sigil: 'WK' },
    { pagePath: '/pages/stats/index', text: language === 'zh-CN' ? '统计' : 'Stats', sigil: 'ST' },
  ];
}

export function getIntelCategoryOptions(language: AppLanguage): Array<{ key: NewsCategory | 'all'; label: string }> {
  if (language === 'zh-CN') {
    return [
      { key: 'all', label: '全部' },
      { key: 'ai', label: 'AI/科技' },
      { key: 'finance', label: '财经' },
      { key: 'politics', label: '政治' },
      { key: 'computer-science', label: '计算机' },
    ];
  }

  return [
    { key: 'all', label: 'All' },
    { key: 'ai', label: 'AI/Tech' },
    { key: 'finance', label: 'Finance' },
    { key: 'politics', label: 'Politics' },
    { key: 'computer-science', label: 'Ars' },
  ];
}

export function getIntelCategoryLabel(category: NewsCategory, language: AppLanguage): string {
  return (getIntelCategoryOptions(language).find((item) => item.key === category)?.label) || category;
}

export function getIntelSourceLabel(source: IntelSource, language: AppLanguage): string {
  if (language === 'zh-CN') {
    if (source === 'live') return '实时中继';
    if (source === 'cache') return '本地缓存';
    return '内置档案';
  }

  if (source === 'live') return 'Live relay';
  if (source === 'cache') return 'Local archive';
  return 'Bundled archive';
}

export function getDefaultProfileName(language: AppLanguage): string {
  return language === 'zh-CN' ? '未命名侍从' : 'Unknown Acolyte';
}

export function getDifficultyLabel(value: string, language: AppLanguage): string {
  if (language === 'zh-CN') {
    if (value === 'easy') return '简单';
    if (value === 'hard') return '困难';
    return '中等';
  }

  if (value === 'easy') return 'Easy';
  if (value === 'hard') return 'Hard';
  return 'Medium';
}

export function getLanguagePack(language: AppLanguage) {
  const isZh = language === 'zh-CN';

  return {
    theme: {
      trigger: isZh ? '主题' : 'Theme',
      appearance: isZh ? '外观' : 'Appearance',
      active: isZh ? '当前' : 'Active',
      light: getThemeLabel('light', language),
      dark: getThemeLabel('dark', language),
      system: getThemeLabel('system', language),
      helper: isZh
        ? '跟随系统会同步设备外观，并记住这项设置。'
        : 'System follows your device appearance and keeps this choice for future launches.',
    },
    dashboard: {
      kicker: isZh ? '指挥账本' : 'Command Ledger',
      title: isZh ? '指挥中心' : 'Command Center',
      rankTitle: isZh ? '等级' : 'Rank',
      xpRemaining: (xpRemaining: number) => isZh ? `还需 ${xpRemaining} XP` : `${xpRemaining} XP remaining`,
      rankProgress: (xpIntoLevel: number, xpNeededForLevel: number, nextLevel: number) => (
        isZh
          ? `${xpIntoLevel} / ${xpNeededForLevel} XP，升至 ${nextLevel} 级`
          : `${xpIntoLevel} / ${xpNeededForLevel} XP to Rank ${nextLevel}`
      ),
      xp: 'XP',
      active: isZh ? '进行中' : 'Active',
      done: isZh ? '已完成' : 'Done',
      service: isZh ? '服役' : 'Service',
      energy: isZh ? '能量储备' : 'Energy Reserve',
      pending: isZh ? '待执行任务' : 'Pending Operations',
      queued: (count: number) => isZh ? `${count} 项待处理` : `${count} queued`,
      awaiting: isZh ? '等待执行' : 'Awaiting execution',
      noActive: isZh ? '暂无进行中的任务。前往任务页创建新指令。' : 'No active missions. Forge new orders in Roster.',
    },
    roster: {
      kicker: isZh ? '任务账本' : 'Mission Ledger',
      title: isZh ? '任务列表' : 'Mission Roster',
      summary: (done: number, total: number) => (
        isZh ? `今日已完成 ${done} / ${total} 项任务` : `${done} / ${total} operations complete today`
      ),
      dailyProgress: isZh ? '今日进度' : 'Daily Progress',
      issueOrder: isZh ? '下达新指令' : 'Issue New Order',
      issueHelp: isZh
        ? '创建清晰的任务标题，分配难度后加入任务列表。'
        : 'Create a clear mission entry, assign difficulty, and push it into the roster.',
      placeholder: isZh ? '输入新任务标题' : 'New mission title',
      easy: isZh ? '简单' : 'Easy',
      medium: isZh ? '中等' : 'Medium',
      hard: isZh ? '困难' : 'Hard',
      newMission: isZh ? '新建任务' : 'New Mission',
      updateMission: isZh ? '更新任务' : 'Update Mission',
      all: isZh ? '全部' : 'All',
      active: isZh ? '进行中' : 'Active',
      completed: isZh ? '已完成' : 'Done',
      missionSuffix: isZh ? '任务' : 'mission',
      complete: isZh ? '完成' : 'Done',
      edit: isZh ? '编辑' : 'Edit',
      delete: isZh ? '删除' : 'Delete',
      empty: isZh ? '暂无任务。请先在上方创建新指令。' : 'No missions assigned. Forge new orders above.',
      enterMissionToast: isZh ? '请输入任务标题' : 'Enter a mission',
    },
    intel: {
      kicker: isZh ? '中继档案' : 'Relay Archive',
      title: isZh ? '情报' : 'Intelligence',
      subtitle: isZh ? '战地报告、战略信号与简报' : 'Field reports, strategic signals, and briefings',
      feedStatus: isZh ? '信源状态' : 'Feed Status',
      contacting: isZh ? '正在连接信号中继…' : 'Contacting signal relays...',
      refresh: isZh ? '刷新' : 'Refresh',
      relayDegraded: isZh ? '实时中继已降级，仍可使用档案回退内容。' : 'Live relay degraded. Archive fallback remains available.',
      decryptingPackets: isZh ? '正在解密情报数据包…' : 'Decrypting intelligence packets...',
      openReport: isZh ? '打开报告' : 'Open report',
      noReportLink: isZh ? '无报告链接' : 'No report link',
      read: isZh ? '已读' : 'Read',
      empty: isZh ? '当前分类暂无可用情报。' : 'No intelligence is available for this category right now.',
      close: isZh ? '关闭' : 'Close',
      degradedExcerpt: isZh ? '信号已降级，当前显示回退摘要。' : 'Signal degraded. Showing fallback excerpt.',
      decryptingReport: isZh ? '正在解密报告…' : 'Decrypting report...',
      xpReward: isZh ? '首次阅读奖励 +10 XP' : '+10 XP awarded on first read',
      copyLink: isZh ? '复制链接' : 'Copy Link',
      retryIn: (minutes: number) => isZh ? `${minutes} 分钟后重试` : `Retry in ${minutes}m`,
      bundledFallback: isZh ? '内置档案回退内容' : 'Bundled fallback archive',
      archiveReady: isZh ? '档案已就绪' : 'Archive ready',
      updatedAgo: (age: number) => isZh ? `${age.toFixed(1)} 分钟前更新` : `Updated ${age.toFixed(1)}m ago`,
      refreshAvailable: isZh ? '可立即刷新' : 'Refresh available',
    },
    clock: {
      kicker: isZh ? '计时中继' : 'Chrono Relay',
      title: isZh ? '工作时钟' : 'Work Clock',
      subtitle: isZh ? '25 分钟工作，5 分钟休息，每循环消耗 10 点能量' : '25m duty, 5m rest, -10 energy per cycle',
      currentState: isZh ? '当前状态' : 'Current State',
      helper: isZh ? '精确控制工作、暂停与恢复的计时循环。' : 'Precision cycle control for duty, pause, and recovery states.',
      beginDuty: isZh ? '开始工作' : 'Begin Duty',
      pause: isZh ? '暂停' : 'Pause',
      resume: isZh ? '继续' : 'Resume',
      stop: isZh ? '停止' : 'Stop',
      recoveryAction: isZh ? '1 小时恢复' : '1h Recovery',
      cycleDrain: isZh ? '循环消耗' : 'Cycle Drain',
      cycleDrainHelp: isZh ? '5 分钟短休结束后会更新能量值。' : 'Energy changes after the 5 minute rest completes.',
      recoveryRule: isZh ? '恢复规则' : 'Recovery Rule',
      recoveryRuleHelp: isZh ? '1 小时恢复休息可将能量补满。' : 'A 1 hour recovery rest restores all energy.',
      energy: isZh ? '能量储备' : 'Plasma Energy',
      recoveryNotice: isZh ? '恢复提示' : 'Recovery Notice',
      dutyActive: isZh ? '工作进行中' : 'Duty Active',
      dutyPaused: isZh ? '工作已暂停' : 'Duty Paused',
      longRecovery: isZh ? '长时恢复' : 'Long Recovery',
      shortRest: isZh ? '短休' : 'Short Rest',
      idle: isZh ? '待命' : 'Idle',
      longRestMessage: isZh ? '长时恢复进行中。1 小时后能量将回到 100。' : 'Extended recovery active. Energy returns to 100 after 1 hour.',
      shortRestMessage: (nextEnergy: number) => (
        isZh ? `短休进行中。休息结束后能量将结算为 ${nextEnergy}%。` : `Short rest active. Energy will settle at ${nextEnergy}% after this break.`
      ),
      depletedToast: isZh ? '能量耗尽' : 'Energy depleted',
    },
    stats: {
      kicker: isZh ? '服役记录' : 'Service Record',
      title: isZh ? '章节统计' : 'Chapter Stats',
      subtitle: isZh ? '累计进度与服役记录' : 'Lifetime progress and service record',
      profileHint: isZh ? '点击更新资料或迁移 Firebase 数据' : 'Tap to update profile or claim Firebase data',
      languageTitle: isZh ? '语言' : 'Language',
      languageHelper: isZh ? '根据地区自动默认，也可在此手动切换。' : 'Defaults by region and can be changed here at any time.',
      languageToggle: (currentLanguage: AppLanguage) => (
        isZh
          ? `切换为 ${currentLanguage === 'zh-CN' ? 'English' : '中文'}`
          : `Switch to ${currentLanguage === 'zh-CN' ? 'English' : 'Chinese'}`
      ),
      rankTitle: (level: number) => isZh ? `等级 ${level}` : `Rank ${level}`,
      rankProgress: (xpIntoLevel: number, xpNeededForLevel: number, nextLevel: number) => (
        isZh
          ? `${xpIntoLevel} / ${xpNeededForLevel} XP，升至 ${nextLevel} 级`
          : `${xpIntoLevel} / ${xpNeededForLevel} XP to Rank ${nextLevel}`
      ),
      currentThreshold: (level: number, threshold: number) => isZh
        ? `${level} 级：${threshold} XP`
        : `Rank ${level}: ${threshold} XP`,
      nextThreshold: (level: number, threshold: number) => isZh
        ? `${level} 级：${threshold} XP`
        : `Rank ${level}: ${threshold} XP`,
      totalXpSummary: (totalXp: number, remaining: number) => (
        isZh ? `累计 ${totalXp} XP，还需 ${remaining} XP。` : `Total ${totalXp} XP. ${remaining} XP remaining.`
      ),
      energy: isZh ? '能量' : 'Energy',
      totalXp: isZh ? '总 XP' : 'Total XP',
      missionsDone: isZh ? '完成任务' : 'Missions Done',
      intelRead: isZh ? '已读情报' : 'Intel Read',
      totalService: isZh ? '总服役时长' : 'Total Service',
    },
    profile: {
      kicker: isZh ? '身份中继' : 'Identity Relay',
      title: isZh ? '资料' : 'Profile',
      subtitle: isZh ? '设置你的微信身份并迁移旧的 Firebase 数据。' : 'Set your WeChat identity and claim old Firebase data.',
      profileIdentity: isZh ? '身份资料' : 'Profile Identity',
      profileHelper: isZh
        ? '选择头像并确认这个小程序要展示的公开昵称。'
        : 'Choose an avatar and confirm the public name this mini program should display.',
      avatarSeal: isZh ? '头像徽记' : 'Avatar Seal',
      avatarHelper: isZh
        ? '点击头像框后，微信会提示重新选择头像。'
        : 'WeChat will prompt for a fresh avatar selection when you tap the frame.',
      nickname: isZh ? '昵称' : 'Nickname',
      saveProfile: isZh ? '保存资料' : 'Save Profile',
      claimTitle: isZh ? '迁移 Firebase 存档' : 'Claim Firebase Save',
      claimHelper: isZh
        ? '输入你 Firebase 账户对应的邮箱和一次性迁移码。'
        : 'Enter the email and one-time claim code generated from your Firebase account.',
      email: 'Email',
      claimCode: isZh ? '迁移码' : 'Claim code',
      claimData: isZh ? '迁移数据' : 'Claim Data',
      savedToast: isZh ? '资料已保存' : 'Profile saved',
      requiredToast: isZh ? '邮箱和迁移码必填' : 'Email and code required',
      claimingToast: isZh ? '迁移中' : 'Claiming',
      claimedToast: isZh ? '数据已迁移' : 'Data claimed',
      failedToast: isZh ? '迁移失败' : 'Claim failed',
    },
  };
}

function promisify<T>(runner: (callbacks: {
  success: (value: T) => void;
  fail: (error: unknown) => void;
}) => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    try {
      runner({
        success: resolve,
        fail: reject,
      });
    } catch (error) {
      reject(error);
    }
  });
}
