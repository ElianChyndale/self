"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCAL_INTEL_ARTICLE_CACHE_KEY = exports.LOCAL_INTEL_CACHE_KEY = exports.LOCAL_LANGUAGE_PREFERENCE_KEY = exports.LOCAL_THEME_PREFERENCE_KEY = exports.LOCAL_GAME_STATE_KEY = exports.LOCAL_PROFILE_KEY = exports.NEWS_ARTICLES_PER_CATEGORY = exports.NEWS_REFRESH_COOLDOWN_MINUTES = exports.NEWS_FEEDS = exports.DEFAULT_MAX_ENERGY = exports.LONG_REST_DURATION_SECONDS = exports.SHORT_REST_DURATION_SECONDS = exports.WORK_DURATION_SECONDS = exports.ENERGY_DECREASE_PER_CYCLE = exports.NEWS_READ_XP = exports.WORK_SESSION_XP = exports.TODO_XP_REWARDS = void 0;
exports.TODO_XP_REWARDS = {
    easy: 25,
    medium: 50,
    hard: 100,
};
exports.WORK_SESSION_XP = 50;
exports.NEWS_READ_XP = 10;
exports.ENERGY_DECREASE_PER_CYCLE = 10;
exports.WORK_DURATION_SECONDS = 25 * 60;
exports.SHORT_REST_DURATION_SECONDS = 5 * 60;
exports.LONG_REST_DURATION_SECONDS = 60 * 60;
exports.DEFAULT_MAX_ENERGY = 100;
exports.NEWS_FEEDS = {
    finance: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    'computer-science': 'https://feeds.arstechnica.com/arstechnica/index',
    ai: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    politics: 'https://feeds.bbci.co.uk/news/politics/rss.xml',
};
exports.NEWS_REFRESH_COOLDOWN_MINUTES = 1;
exports.NEWS_ARTICLES_PER_CATEGORY = 3;
exports.LOCAL_PROFILE_KEY = 'self_mp_profile';
exports.LOCAL_GAME_STATE_KEY = 'self_mp_game_state';
exports.LOCAL_THEME_PREFERENCE_KEY = 'self_mp_theme_preference';
exports.LOCAL_LANGUAGE_PREFERENCE_KEY = 'self_mp_language_preference';
exports.LOCAL_INTEL_CACHE_KEY = 'self_mp_intel_cache';
exports.LOCAL_INTEL_ARTICLE_CACHE_KEY = 'self_mp_intel_article_cache';
