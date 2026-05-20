const cloud = require('wx-server-sdk');
const fetch = require('node-fetch');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const JINA_READER = 'https://r.jina.ai/';

exports.main = async (event) => {
  const link = String(event.link || '').trim();
  const description = String(event.description || '').trim();
  if (!link) {
    return {
      content: description || 'No article content is available for this report.',
      fetchedAt: Date.now(),
      source: 'bundled',
      degraded: true,
    };
  }

  try {
    const response = await fetchWithTimeout(`${JINA_READER}${encodeURIComponent(link)}`, 15000);
    const raw = await response.text();
    const content = cleanArticleBody(raw) || description || 'No article content is available for this report.';
    return {
      content,
      fetchedAt: Date.now(),
      source: 'live',
      degraded: content === description || content === 'No article content is available for this report.',
    };
  } catch (error) {
    console.warn('fetchIntelArticle fallback triggered', error && error.message ? error.message : error);
    return {
      content: description || 'Signal degraded. Full article content could not be retrieved.',
      fetchedAt: Date.now(),
      source: 'bundled',
      degraded: true,
    };
  }
};

async function fetchWithTimeout(url, timeoutMs) {
  const response = await Promise.race([
    fetch(url, {
      headers: { Accept: 'text/plain' },
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`reader timeout after ${timeoutMs}ms`)), timeoutMs)),
  ]);
  if (!response.ok) throw new Error(`Reader fetch failed: ${response.status}`);
  return response;
}

function cleanArticleBody(text) {
  let content = String(text || '');
  const match = content.match(/Markdown Content:\s*\n([\s\S]*)/);
  if (match) content = match[1].trim();

  content = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^!\[/.test(line))
    .filter((line) => !/^https?:\/\//.test(line))
    .filter((line) => !/^\[.*?\]\(https?:\/\/.*?\)$/.test(line))
    .join('\n');

  content = content
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^Title:\s*.*$/m, '')
    .replace(/^URL Source:\s*.*$/m, '')
    .replace(/^Published Time:\s*.*$/m, '')
    .trim();

  return content.slice(0, 6000).trim();
}
