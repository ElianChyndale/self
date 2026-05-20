import { fetchIntelArticle, fetchIntelFeed } from '../../utils/cloud';
import { getBundledIntelArticleContent, BUNDLED_INTEL_ARTICLES } from '../../data/intelSeed';
import { markArticleRead } from '../../utils/gameState';
import {
  buildIntelFeedState,
  getIntelCacheAgeMinutes,
  isIntelRefreshOnCooldown,
  sortIntelArticlesByNewest,
  toIntelExcerpt,
} from '../../utils/intel';
import { buildThemePageData } from '../../utils/pageData';
import {
  getIntelCategoryLabel,
  getIntelCategoryOptions,
  getIntelSourceLabel,
  getLanguagePack,
} from '../../utils/language';
import {
  loadLocalIntelArticleCache,
  loadLocalIntelCache,
  saveLocalIntelArticleCache,
  saveLocalIntelCache,
} from '../../utils/storage';
import { syncCustomTabBar } from '../../utils/tabBar';
import { NEWS_REFRESH_COOLDOWN_MINUTES } from '../../utils/constants';
import type { NewsArticle, NewsCategory } from '../../types';

type LocalizedArticle = NewsArticle & { categoryLabel: string };

Page({
  data: {
    ...buildThemePageData(
      getApp<IAppOption>().globalData.themePreference,
      getApp<IAppOption>().globalData.activeTheme,
      getApp<IAppOption>().globalData.statusBarHeight,
      getApp<IAppOption>().globalData.languagePreference,
      getApp<IAppOption>().globalData.activeLanguage,
    ),
    categories: getIntelCategoryOptions(getApp<IAppOption>().globalData.activeLanguage),
    activeCategory: 'all',
    articles: [] as LocalizedArticle[],
    visibleArticles: [] as LocalizedArticle[],
    readArticleIds: getApp<IAppOption>().globalData.gameState.readArticleIds,
    isLoading: true,
    hasError: false,
    sourceLabel: getIntelSourceLabel('bundled', getApp<IAppOption>().globalData.activeLanguage),
    sourceType: 'bundled',
    isDegraded: false,
    isOnCooldown: false,
    cooldownText: '',
    selectedArticle: null as LocalizedArticle | null,
    articleContent: '',
    isArticleLoading: false,
    articleFetchFailed: false,
    copy: null,
  },

  onShow() {
    this.refresh();
    const cache = loadLocalIntelCache();
    this.applyFeedState(buildIntelFeedState({
      fallbackArticles: BUNDLED_INTEL_ARTICLES,
      cachedArticles: cache?.articles || [],
      liveArticles: [],
      fetchedAt: cache?.fetchedAt || 0,
      hasLiveError: false,
    }));
    if (!cache?.articles?.length || !isIntelRefreshOnCooldown(cache.fetchedAt)) {
      void this.loadIntel(false);
    } else {
      this.setData({ isLoading: false });
    }
  },

  refresh() {
    const app = getApp<IAppOption>();
    syncCustomTabBar(this, 1, app.globalData.activeTheme, app.globalData.activeLanguage);
    this.setData(buildThemePageData(
      app.globalData.themePreference,
      app.globalData.activeTheme,
      app.globalData.statusBarHeight,
      app.globalData.languagePreference,
      app.globalData.activeLanguage,
    ));
    this.setData({
      readArticleIds: app.globalData.gameState.readArticleIds,
      categories: getIntelCategoryOptions(app.globalData.activeLanguage),
      copy: getLanguagePack(app.globalData.activeLanguage),
    });
  },

  setCategory(event: any) {
    this.setData({ activeCategory: event.currentTarget.dataset.category });
    this.updateVisibleArticles();
  },

  async refreshIntel() {
    if (this.data.isOnCooldown) {
      wx.showToast({
        title: this.data.copy.intel.retryIn(NEWS_REFRESH_COOLDOWN_MINUTES),
        icon: 'none',
      });
      return;
    }
    await this.loadIntel(true);
  },

  async loadIntel(force: boolean) {
    const existingCache = loadLocalIntelCache();
    this.setData({
      isLoading: !(this.data.visibleArticles as NewsArticle[]).length,
      hasError: false,
    });

    try {
      const result = await fetchIntelFeed(force);
      const feedState = buildIntelFeedState({
        fallbackArticles: BUNDLED_INTEL_ARTICLES,
        cachedArticles: existingCache?.articles || [],
        liveArticles: result.articles || [],
        fetchedAt: result.fetchedAt || Date.now(),
        hasLiveError: false,
      });
      if (feedState.source === 'live') {
        saveLocalIntelCache({
          articles: feedState.articles,
          fetchedAt: result.fetchedAt || Date.now(),
        });
      }
      this.applyFeedState(feedState);
    } catch (error) {
      console.warn('Intel feed fetch failed; using cache if available.', error);
      this.applyFeedState(buildIntelFeedState({
        fallbackArticles: BUNDLED_INTEL_ARTICLES,
        cachedArticles: existingCache?.articles || [],
        liveArticles: [],
        fetchedAt: existingCache?.fetchedAt || 0,
        hasLiveError: true,
      }));
    }
  },

  applyFeedState(feedState: ReturnType<typeof buildIntelFeedState>) {
    const language = getApp<IAppOption>().globalData.activeLanguage;
    const sorted = sortIntelArticlesByNewest(feedState.articles).map((article) => ({
      ...article,
      categoryLabel: getIntelCategoryLabel(article.category, language),
    }));
    this.setData({
      articles: sorted,
      hasError: feedState.degraded,
      isLoading: false,
      sourceLabel: getIntelSourceLabel(feedState.source, language),
      sourceType: feedState.source,
      isDegraded: feedState.degraded,
      isOnCooldown: feedState.source === 'live' && isIntelRefreshOnCooldown(feedState.fetchedAt),
      cooldownText: this.formatCooldownText(feedState.fetchedAt, feedState.source, language),
    });
    this.updateVisibleArticles();
  },

  updateVisibleArticles() {
    const category = this.data.activeCategory as NewsCategory | 'all';
    const articles = this.data.articles as LocalizedArticle[];
    const visibleArticles = category === 'all'
      ? articles.slice(0, 10)
      : articles.filter((article) => article.category === category).slice(0, 10);
    this.setData({ visibleArticles });
  },

  formatCooldownText(fetchedAt: number, source: string, language: 'zh-CN' | 'en') {
    const copy = getLanguagePack(language).intel;
    if (source === 'bundled') return copy.bundledFallback;
    if (!fetchedAt) return copy.archiveReady;
    const age = getIntelCacheAgeMinutes(fetchedAt);
    return age < NEWS_REFRESH_COOLDOWN_MINUTES
      ? copy.updatedAgo(age)
      : copy.refreshAvailable;
  },

  async openArticle(event: any) {
    const link = event.currentTarget.dataset.link;
    const article = (this.data.articles as LocalizedArticle[]).find((item) => item.link === link);
    if (!article) return;

    const app = getApp<IAppOption>();
    const nextState = markArticleRead(app.globalData.gameState, article.link);
    if (nextState !== app.globalData.gameState) {
      app.updateGameState(nextState);
      this.setData({ readArticleIds: nextState.readArticleIds });
    }

    this.setData({
      selectedArticle: article,
      articleContent: toIntelExcerpt(article.description, 260),
      isArticleLoading: true,
      articleFetchFailed: false,
    });

    const bundledContent = getBundledIntelArticleContent(article.link);
    if (bundledContent) {
      this.setData({
        articleContent: bundledContent,
        isArticleLoading: false,
      });
      return;
    }

    const cachedArticles = loadLocalIntelArticleCache();
    const cached = cachedArticles.find((entry) => entry.link === article.link);
    if (cached && Date.now() - cached.fetchedAt < 30 * 60 * 1000) {
      this.setData({
        articleContent: cached.content,
        isArticleLoading: false,
      });
      return;
    }

    try {
      const result = await fetchIntelArticle(article.link, article.description);
      const nextCache = [
        ...cachedArticles.filter((entry) => entry.link !== article.link),
        { link: article.link, content: result.content, fetchedAt: result.fetchedAt || Date.now() },
      ];
      saveLocalIntelArticleCache(nextCache);
      this.setData({
        articleContent: result.content,
        isArticleLoading: false,
        articleFetchFailed: Boolean(result.degraded),
      });
    } catch (error) {
      console.warn('Intel article fetch failed; using excerpt fallback.', error);
      this.setData({
        articleContent: toIntelExcerpt(article.description, 260),
        isArticleLoading: false,
        articleFetchFailed: true,
      });
    }
  },

  closeArticle() {
    this.setData({
      selectedArticle: null,
      articleContent: '',
      isArticleLoading: false,
      articleFetchFailed: false,
    });
  },

  copyArticleLink() {
    const selectedArticle = this.data.selectedArticle as LocalizedArticle | null;
    if (!selectedArticle) return;
    wx.setClipboardData({ data: selectedArticle.link });
  },

  noop() {},
});
