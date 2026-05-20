export const TODO_XP_REWARDS = {
  easy: 25,
  medium: 50,
  hard: 100,
} as const;

export const WORK_SESSION_XP = 50;
export const NEWS_READ_XP = 10;
export const ENERGY_DECREASE_PER_CYCLE = 10;
export const WORK_DURATION_SECONDS = 25 * 60;
export const SHORT_REST_DURATION_SECONDS = 5 * 60;
export const LONG_REST_DURATION_SECONDS = 60 * 60;
export const DEFAULT_MAX_ENERGY = 100;

export const NEWS_FEEDS = {
  finance: 'https://feeds.bbci.co.uk/news/business/rss.xml',
  'computer-science': 'https://feeds.arstechnica.com/arstechnica/index',
  ai: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
  politics: 'https://feeds.bbci.co.uk/news/politics/rss.xml',
} as const;

export const NEWS_REFRESH_COOLDOWN_MINUTES = 1;
export const NEWS_ARTICLES_PER_CATEGORY = 3;

export const LOCAL_PROFILE_KEY = 'self_mp_profile';
export const LOCAL_GAME_STATE_KEY = 'self_mp_game_state';
export const LOCAL_THEME_PREFERENCE_KEY = 'self_mp_theme_preference';
export const LOCAL_LANGUAGE_PREFERENCE_KEY = 'self_mp_language_preference';
export const LOCAL_INTEL_CACHE_KEY = 'self_mp_intel_cache';
export const LOCAL_INTEL_ARTICLE_CACHE_KEY = 'self_mp_intel_article_cache';
