import { describe, expect, it } from 'vitest';
import { createDefaultGameState, markArticleRead } from '../miniprogram/utils/gameState';
import {
  buildIntelFeedState,
  getIntelCacheAgeMinutes,
  isIntelRefreshOnCooldown,
  sortIntelArticlesByNewest,
} from '../miniprogram/utils/intel';
import type { NewsArticle } from '../miniprogram/types';

describe('intel rewards', () => {
  it('awards article XP only on the first read', () => {
    let state = createDefaultGameState();

    state = markArticleRead(state, 'https://example.com/a');
    expect(state.readArticleIds).toContain('https://example.com/a');
    expect(state.totalArticlesRead).toBe(1);
    expect(state.totalXp).toBe(10);

    const next = markArticleRead(state, 'https://example.com/a');
    expect(next.totalArticlesRead).toBe(1);
    expect(next.totalXp).toBe(10);
  });
});

describe('intel utilities', () => {
  it('sorts newest articles first and respects refresh cooldown', () => {
    const articles: NewsArticle[] = [
      {
        title: 'Older',
        link: 'https://example.com/older',
        pubDate: '2026-05-19T10:00:00.000Z',
        description: 'Older article',
        category: 'finance',
      },
      {
        title: 'Newer',
        link: 'https://example.com/newer',
        pubDate: '2026-05-20T10:00:00.000Z',
        description: 'Newer article',
        category: 'ai',
      },
    ];

    expect(sortIntelArticlesByNewest(articles).map((article) => article.title)).toEqual(['Newer', 'Older']);
    expect(getIntelCacheAgeMinutes(Date.now() - 30 * 1000, Date.now())).toBe(0.5);
    expect(isIntelRefreshOnCooldown(Date.now() - 30 * 1000, Date.now(), 1)).toBe(true);
    expect(isIntelRefreshOnCooldown(Date.now() - 2 * 60 * 1000, Date.now(), 1)).toBe(false);
  });

  it('always falls back to bundled intel when cache and live data are unavailable', () => {
    const fallbackArticles: NewsArticle[] = [
      {
        title: 'Fallback briefing',
        link: 'fallback://briefing',
        pubDate: '2026-05-20T12:00:00.000Z',
        description: 'Bundled fallback article',
        category: 'politics',
      },
    ];

    expect(buildIntelFeedState({
      fallbackArticles,
      cachedArticles: [],
      liveArticles: [],
      fetchedAt: 0,
      hasLiveError: true,
    })).toMatchObject({
      source: 'bundled',
      degraded: true,
      articles: fallbackArticles,
    });
  });
});
