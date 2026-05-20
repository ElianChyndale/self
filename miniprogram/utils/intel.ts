import { NEWS_REFRESH_COOLDOWN_MINUTES } from './constants';
import type { IntelSource, NewsArticle } from '../types';

export interface IntelCache {
  articles: NewsArticle[];
  fetchedAt: number;
}

export interface IntelArticleCacheEntry {
  link: string;
  content: string;
  fetchedAt: number;
}

export interface IntelFeedState {
  articles: NewsArticle[];
  fetchedAt: number;
  source: IntelSource;
  degraded: boolean;
}

export function sortIntelArticlesByNewest(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort(
    (left, right) => new Date(right.pubDate).getTime() - new Date(left.pubDate).getTime(),
  );
}

export function getIntelCacheAgeMinutes(fetchedAt: number, now = Date.now()): number {
  return Number(((now - fetchedAt) / 60000).toFixed(2));
}

export function isIntelRefreshOnCooldown(
  fetchedAt: number | null | undefined,
  now = Date.now(),
  cooldownMinutes = NEWS_REFRESH_COOLDOWN_MINUTES,
): boolean {
  if (!fetchedAt) return false;
  return getIntelCacheAgeMinutes(fetchedAt, now) < cooldownMinutes;
}

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toIntelExcerpt(value: string, limit = 180): string {
  const normalized = stripHtml(value);
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

export function buildIntelFeedState(input: {
  fallbackArticles: NewsArticle[];
  cachedArticles: NewsArticle[];
  liveArticles: NewsArticle[];
  fetchedAt: number;
  hasLiveError: boolean;
}): IntelFeedState {
  const { fallbackArticles, cachedArticles, liveArticles, fetchedAt, hasLiveError } = input;

  if (liveArticles.length) {
    return {
      articles: sortIntelArticlesByNewest(liveArticles),
      fetchedAt,
      source: 'live',
      degraded: false,
    };
  }

  if (cachedArticles.length) {
    return {
      articles: sortIntelArticlesByNewest(cachedArticles),
      fetchedAt,
      source: 'cache',
      degraded: hasLiveError,
    };
  }

  return {
    articles: sortIntelArticlesByNewest(fallbackArticles),
    fetchedAt: 0,
    source: 'bundled',
    degraded: true,
  };
}

export function intelSourceLabel(source: IntelSource): string {
  if (source === 'live') return 'Live relay';
  if (source === 'cache') return 'Local archive';
  return 'Bundled archive';
}
