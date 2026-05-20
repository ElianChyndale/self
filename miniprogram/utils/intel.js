"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortIntelArticlesByNewest = sortIntelArticlesByNewest;
exports.getIntelCacheAgeMinutes = getIntelCacheAgeMinutes;
exports.isIntelRefreshOnCooldown = isIntelRefreshOnCooldown;
exports.stripHtml = stripHtml;
exports.toIntelExcerpt = toIntelExcerpt;
exports.buildIntelFeedState = buildIntelFeedState;
exports.intelSourceLabel = intelSourceLabel;
const constants_1 = require("./constants");
function sortIntelArticlesByNewest(articles) {
    return [...articles].sort((left, right) => new Date(right.pubDate).getTime() - new Date(left.pubDate).getTime());
}
function getIntelCacheAgeMinutes(fetchedAt, now = Date.now()) {
    return Number(((now - fetchedAt) / 60000).toFixed(2));
}
function isIntelRefreshOnCooldown(fetchedAt, now = Date.now(), cooldownMinutes = constants_1.NEWS_REFRESH_COOLDOWN_MINUTES) {
    if (!fetchedAt)
        return false;
    return getIntelCacheAgeMinutes(fetchedAt, now) < cooldownMinutes;
}
function stripHtml(value) {
    return value
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/gi, '"')
        .replace(/\s+/g, ' ')
        .trim();
}
function toIntelExcerpt(value, limit = 180) {
    const normalized = stripHtml(value);
    if (normalized.length <= limit)
        return normalized;
    return `${normalized.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}
function buildIntelFeedState(input) {
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
function intelSourceLabel(source) {
    if (source === 'live')
        return 'Live relay';
    if (source === 'cache')
        return 'Local archive';
    return 'Bundled archive';
}
