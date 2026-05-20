"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLocalProfile = loadLocalProfile;
exports.saveLocalProfile = saveLocalProfile;
exports.loadLocalGameState = loadLocalGameState;
exports.saveLocalGameState = saveLocalGameState;
exports.loadLocalThemePreference = loadLocalThemePreference;
exports.saveLocalThemePreference = saveLocalThemePreference;
exports.loadLocalLanguagePreference = loadLocalLanguagePreference;
exports.saveLocalLanguagePreference = saveLocalLanguagePreference;
exports.loadLocalIntelCache = loadLocalIntelCache;
exports.saveLocalIntelCache = saveLocalIntelCache;
exports.loadLocalIntelArticleCache = loadLocalIntelArticleCache;
exports.saveLocalIntelArticleCache = saveLocalIntelArticleCache;
const constants_1 = require("./constants");
const constants_2 = require("./constants");
const gameState_1 = require("./gameState");
const language_1 = require("./language");
const theme_1 = require("./theme");
function loadLocalProfile() {
    return wx.getStorageSync(constants_1.LOCAL_PROFILE_KEY) || null;
}
function saveLocalProfile(profile) {
    wx.setStorageSync(constants_1.LOCAL_PROFILE_KEY, profile);
}
function loadLocalGameState() {
    const raw = wx.getStorageSync(constants_1.LOCAL_GAME_STATE_KEY);
    return raw ? (0, gameState_1.sanitizeHydratedGameState)(raw) : null;
}
function saveLocalGameState(gameState) {
    wx.setStorageSync(constants_1.LOCAL_GAME_STATE_KEY, gameState);
}
function loadLocalThemePreference() {
    return (0, theme_1.resolveThemePreference)(wx.getStorageSync(constants_1.LOCAL_THEME_PREFERENCE_KEY));
}
function saveLocalThemePreference(themePreference) {
    wx.setStorageSync(constants_1.LOCAL_THEME_PREFERENCE_KEY, themePreference);
}
function loadLocalLanguagePreference() {
    return (0, language_1.resolveLanguagePreference)(wx.getStorageSync(constants_1.LOCAL_LANGUAGE_PREFERENCE_KEY));
}
function saveLocalLanguagePreference(languagePreference) {
    wx.setStorageSync(constants_1.LOCAL_LANGUAGE_PREFERENCE_KEY, languagePreference);
}
function loadLocalIntelCache() {
    const raw = wx.getStorageSync(constants_2.LOCAL_INTEL_CACHE_KEY);
    if (!raw || typeof raw !== 'object')
        return null;
    return {
        articles: Array.isArray(raw.articles) ? raw.articles : [],
        fetchedAt: Number(raw.fetchedAt) || 0,
    };
}
function saveLocalIntelCache(cache) {
    wx.setStorageSync(constants_2.LOCAL_INTEL_CACHE_KEY, cache);
}
function loadLocalIntelArticleCache() {
    const raw = wx.getStorageSync(constants_2.LOCAL_INTEL_ARTICLE_CACHE_KEY);
    return Array.isArray(raw) ? raw : [];
}
function saveLocalIntelArticleCache(entries) {
    wx.setStorageSync(constants_2.LOCAL_INTEL_ARTICLE_CACHE_KEY, entries.slice(-50));
}
