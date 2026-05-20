import {
  LOCAL_GAME_STATE_KEY,
  LOCAL_LANGUAGE_PREFERENCE_KEY,
  LOCAL_PROFILE_KEY,
  LOCAL_THEME_PREFERENCE_KEY,
} from './constants';
import { LOCAL_INTEL_ARTICLE_CACHE_KEY, LOCAL_INTEL_CACHE_KEY } from './constants';
import type { IntelArticleCacheEntry, IntelCache } from './intel';
import { sanitizeHydratedGameState } from './gameState';
import { resolveLanguagePreference } from './language';
import { resolveThemePreference } from './theme';
import type { GameState, LanguagePreference, ThemePreference, UserProfile } from '../types';

export function loadLocalProfile(): UserProfile | null {
  return wx.getStorageSync(LOCAL_PROFILE_KEY) || null;
}

export function saveLocalProfile(profile: UserProfile): void {
  wx.setStorageSync(LOCAL_PROFILE_KEY, profile);
}

export function loadLocalGameState(): GameState | null {
  const raw = wx.getStorageSync(LOCAL_GAME_STATE_KEY);
  return raw ? sanitizeHydratedGameState(raw) : null;
}

export function saveLocalGameState(gameState: GameState): void {
  wx.setStorageSync(LOCAL_GAME_STATE_KEY, gameState);
}

export function loadLocalThemePreference(): ThemePreference {
  return resolveThemePreference(wx.getStorageSync(LOCAL_THEME_PREFERENCE_KEY));
}

export function saveLocalThemePreference(themePreference: ThemePreference): void {
  wx.setStorageSync(LOCAL_THEME_PREFERENCE_KEY, themePreference);
}

export function loadLocalLanguagePreference(): LanguagePreference {
  return resolveLanguagePreference(wx.getStorageSync(LOCAL_LANGUAGE_PREFERENCE_KEY));
}

export function saveLocalLanguagePreference(languagePreference: LanguagePreference): void {
  wx.setStorageSync(LOCAL_LANGUAGE_PREFERENCE_KEY, languagePreference);
}

export function loadLocalIntelCache(): IntelCache | null {
  const raw = wx.getStorageSync(LOCAL_INTEL_CACHE_KEY);
  if (!raw || typeof raw !== 'object') return null;
  return {
    articles: Array.isArray(raw.articles) ? raw.articles : [],
    fetchedAt: Number(raw.fetchedAt) || 0,
  };
}

export function saveLocalIntelCache(cache: IntelCache): void {
  wx.setStorageSync(LOCAL_INTEL_CACHE_KEY, cache);
}

export function loadLocalIntelArticleCache(): IntelArticleCacheEntry[] {
  const raw = wx.getStorageSync(LOCAL_INTEL_ARTICLE_CACHE_KEY);
  return Array.isArray(raw) ? raw : [];
}

export function saveLocalIntelArticleCache(entries: IntelArticleCacheEntry[]): void {
  wx.setStorageSync(LOCAL_INTEL_ARTICLE_CACHE_KEY, entries.slice(-50));
}
