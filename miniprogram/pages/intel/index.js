"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloud_1 = require("../../utils/cloud");
const intelSeed_1 = require("../../data/intelSeed");
const gameState_1 = require("../../utils/gameState");
const intel_1 = require("../../utils/intel");
const pageData_1 = require("../../utils/pageData");
const language_1 = require("../../utils/language");
const storage_1 = require("../../utils/storage");
const tabBar_1 = require("../../utils/tabBar");
const constants_1 = require("../../utils/constants");
Page({
    data: {
        ...(0, pageData_1.buildThemePageData)(getApp().globalData.themePreference, getApp().globalData.activeTheme, getApp().globalData.statusBarHeight, getApp().globalData.languagePreference, getApp().globalData.activeLanguage),
        categories: (0, language_1.getIntelCategoryOptions)(getApp().globalData.activeLanguage),
        activeCategory: 'all',
        articles: [],
        visibleArticles: [],
        readArticleIds: getApp().globalData.gameState.readArticleIds,
        isLoading: true,
        hasError: false,
        sourceLabel: (0, language_1.getIntelSourceLabel)('bundled', getApp().globalData.activeLanguage),
        sourceType: 'bundled',
        isDegraded: false,
        isOnCooldown: false,
        cooldownText: '',
        selectedArticle: null,
        articleContent: '',
        isArticleLoading: false,
        articleFetchFailed: false,
        copy: null,
    },
    onShow() {
        var _a;
        this.refresh();
        const cache = (0, storage_1.loadLocalIntelCache)();
        this.applyFeedState((0, intel_1.buildIntelFeedState)({
            fallbackArticles: intelSeed_1.BUNDLED_INTEL_ARTICLES,
            cachedArticles: (cache === null || cache === void 0 ? void 0 : cache.articles) || [],
            liveArticles: [],
            fetchedAt: (cache === null || cache === void 0 ? void 0 : cache.fetchedAt) || 0,
            hasLiveError: false,
        }));
        if (!((_a = cache === null || cache === void 0 ? void 0 : cache.articles) === null || _a === void 0 ? void 0 : _a.length) || !(0, intel_1.isIntelRefreshOnCooldown)(cache.fetchedAt)) {
            void this.loadIntel(false);
        }
        else {
            this.setData({ isLoading: false });
        }
    },
    refresh() {
        const app = getApp();
        (0, tabBar_1.syncCustomTabBar)(this, 1, app.globalData.activeTheme, app.globalData.activeLanguage);
        this.setData((0, pageData_1.buildThemePageData)(app.globalData.themePreference, app.globalData.activeTheme, app.globalData.statusBarHeight, app.globalData.languagePreference, app.globalData.activeLanguage));
        this.setData({
            readArticleIds: app.globalData.gameState.readArticleIds,
            categories: (0, language_1.getIntelCategoryOptions)(app.globalData.activeLanguage),
            copy: (0, language_1.getLanguagePack)(app.globalData.activeLanguage),
        });
    },
    setCategory(event) {
        this.setData({ activeCategory: event.currentTarget.dataset.category });
        this.updateVisibleArticles();
    },
    async refreshIntel() {
        if (this.data.isOnCooldown) {
            wx.showToast({
                title: this.data.copy.intel.retryIn(constants_1.NEWS_REFRESH_COOLDOWN_MINUTES),
                icon: 'none',
            });
            return;
        }
        await this.loadIntel(true);
    },
    async loadIntel(force) {
        const existingCache = (0, storage_1.loadLocalIntelCache)();
        this.setData({
            isLoading: !this.data.visibleArticles.length,
            hasError: false,
        });
        try {
            const result = await (0, cloud_1.fetchIntelFeed)(force);
            const feedState = (0, intel_1.buildIntelFeedState)({
                fallbackArticles: intelSeed_1.BUNDLED_INTEL_ARTICLES,
                cachedArticles: (existingCache === null || existingCache === void 0 ? void 0 : existingCache.articles) || [],
                liveArticles: result.articles || [],
                fetchedAt: result.fetchedAt || Date.now(),
                hasLiveError: false,
            });
            if (feedState.source === 'live') {
                (0, storage_1.saveLocalIntelCache)({
                    articles: feedState.articles,
                    fetchedAt: result.fetchedAt || Date.now(),
                });
            }
            this.applyFeedState(feedState);
        }
        catch (error) {
            console.warn('Intel feed fetch failed; using cache if available.', error);
            this.applyFeedState((0, intel_1.buildIntelFeedState)({
                fallbackArticles: intelSeed_1.BUNDLED_INTEL_ARTICLES,
                cachedArticles: (existingCache === null || existingCache === void 0 ? void 0 : existingCache.articles) || [],
                liveArticles: [],
                fetchedAt: (existingCache === null || existingCache === void 0 ? void 0 : existingCache.fetchedAt) || 0,
                hasLiveError: true,
            }));
        }
    },
    applyFeedState(feedState) {
        const language = getApp().globalData.activeLanguage;
        const sorted = (0, intel_1.sortIntelArticlesByNewest)(feedState.articles).map((article) => ({
            ...article,
            categoryLabel: (0, language_1.getIntelCategoryLabel)(article.category, language),
        }));
        this.setData({
            articles: sorted,
            hasError: feedState.degraded,
            isLoading: false,
            sourceLabel: (0, language_1.getIntelSourceLabel)(feedState.source, language),
            sourceType: feedState.source,
            isDegraded: feedState.degraded,
            isOnCooldown: feedState.source === 'live' && (0, intel_1.isIntelRefreshOnCooldown)(feedState.fetchedAt),
            cooldownText: this.formatCooldownText(feedState.fetchedAt, feedState.source, language),
        });
        this.updateVisibleArticles();
    },
    updateVisibleArticles() {
        const category = this.data.activeCategory;
        const articles = this.data.articles;
        const visibleArticles = category === 'all'
            ? articles.slice(0, 10)
            : articles.filter((article) => article.category === category).slice(0, 10);
        this.setData({ visibleArticles });
    },
    formatCooldownText(fetchedAt, source, language) {
        const copy = (0, language_1.getLanguagePack)(language).intel;
        if (source === 'bundled')
            return copy.bundledFallback;
        if (!fetchedAt)
            return copy.archiveReady;
        const age = (0, intel_1.getIntelCacheAgeMinutes)(fetchedAt);
        return age < constants_1.NEWS_REFRESH_COOLDOWN_MINUTES
            ? copy.updatedAgo(age)
            : copy.refreshAvailable;
    },
    async openArticle(event) {
        const link = event.currentTarget.dataset.link;
        const article = this.data.articles.find((item) => item.link === link);
        if (!article)
            return;
        const app = getApp();
        const nextState = (0, gameState_1.markArticleRead)(app.globalData.gameState, article.link);
        if (nextState !== app.globalData.gameState) {
            app.updateGameState(nextState);
            this.setData({ readArticleIds: nextState.readArticleIds });
        }
        this.setData({
            selectedArticle: article,
            articleContent: (0, intel_1.toIntelExcerpt)(article.description, 260),
            isArticleLoading: true,
            articleFetchFailed: false,
        });
        const bundledContent = (0, intelSeed_1.getBundledIntelArticleContent)(article.link);
        if (bundledContent) {
            this.setData({
                articleContent: bundledContent,
                isArticleLoading: false,
            });
            return;
        }
        const cachedArticles = (0, storage_1.loadLocalIntelArticleCache)();
        const cached = cachedArticles.find((entry) => entry.link === article.link);
        if (cached && Date.now() - cached.fetchedAt < 30 * 60 * 1000) {
            this.setData({
                articleContent: cached.content,
                isArticleLoading: false,
            });
            return;
        }
        try {
            const result = await (0, cloud_1.fetchIntelArticle)(article.link, article.description);
            const nextCache = [
                ...cachedArticles.filter((entry) => entry.link !== article.link),
                { link: article.link, content: result.content, fetchedAt: result.fetchedAt || Date.now() },
            ];
            (0, storage_1.saveLocalIntelArticleCache)(nextCache);
            this.setData({
                articleContent: result.content,
                isArticleLoading: false,
                articleFetchFailed: Boolean(result.degraded),
            });
        }
        catch (error) {
            console.warn('Intel article fetch failed; using excerpt fallback.', error);
            this.setData({
                articleContent: (0, intel_1.toIntelExcerpt)(article.description, 260),
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
        const selectedArticle = this.data.selectedArticle;
        if (!selectedArticle)
            return;
        wx.setClipboardData({ data: selectedArticle.link });
    },
    noop() { },
});
