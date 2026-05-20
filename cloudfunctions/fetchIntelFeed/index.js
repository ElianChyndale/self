const cloud = require('wx-server-sdk');
const Parser = require('rss-parser');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'SELFWeChatMiniProgram/1.0',
  },
});

const NEWS_FEEDS = {
  finance: 'https://feeds.bbci.co.uk/news/business/rss.xml',
  'computer-science': 'https://feeds.arstechnica.com/arstechnica/index',
  ai: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
  politics: 'https://feeds.bbci.co.uk/news/politics/rss.xml',
};

const ARTICLES_PER_CATEGORY = 3;

exports.main = async () => {
  const categories = Object.keys(NEWS_FEEDS);
  const results = await Promise.allSettled(
    categories.map(async (category) => {
      const feed = await withTimeout(parser.parseURL(NEWS_FEEDS[category]), 12000, `${category} feed timeout`);
      return (feed.items || []).slice(0, ARTICLES_PER_CATEGORY).map((item) => ({
        title: String(item.title || 'Untitled report').trim(),
        link: String(item.link || item.guid || '').trim(),
        pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
        description: cleanDescription(item.contentSnippet || item.content || item.summary || ''),
        category,
      })).filter((item) => item.link);
    }),
  );

  const articles = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  articles.sort((left, right) => new Date(right.pubDate).getTime() - new Date(left.pubDate).getTime());

  return {
    articles,
    fetchedAt: Date.now(),
    source: 'live',
    degraded: results.some((result) => result.status === 'rejected') || articles.length === 0,
  };
};

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs)),
  ]);
}

function cleanDescription(input) {
  return String(input || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}
