"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildThemePageData = buildThemePageData;
exports.buildSharedPageData = buildSharedPageData;
const gamification_1 = require("./gamification");
const gameState_1 = require("./gameState");
const language_1 = require("./language");
const theme_1 = require("./theme");
function buildThemePageData(themePreference, activeTheme, statusBarHeight, languagePreference, activeLanguage) {
    return {
        themePreference,
        activeTheme,
        languagePreference,
        activeLanguage,
        languageLabel: (0, language_1.getLanguageName)(activeLanguage),
        themeLabel: (0, theme_1.getThemeLabel)(themePreference, activeLanguage),
        activeThemeLabel: (0, theme_1.getThemeLabel)(activeTheme, activeLanguage),
        statusBarHeight,
    };
}
function buildSharedPageData(profile, gameState, themePreference, activeTheme, statusBarHeight, languagePreference, activeLanguage) {
    const rank = (0, gamification_1.rankProgress)(gameState.totalXp);
    const activeTodos = gameState.todos.filter((todo) => !todo.completed);
    const workHours = Math.floor(gameState.totalWorkSeconds / 3600);
    const workMinutes = Math.floor((gameState.totalWorkSeconds % 3600) / 60);
    return {
        ...buildThemePageData(themePreference, activeTheme, statusBarHeight, languagePreference, activeLanguage),
        profileName: (profile === null || profile === void 0 ? void 0 : profile.nickname) || (0, language_1.getDefaultProfileName)(activeLanguage),
        avatarUrl: (profile === null || profile === void 0 ? void 0 : profile.avatarUrl) || '',
        rank,
        activeTodos,
        pendingCount: activeTodos.length,
        totalXp: gameState.totalXp,
        currentEnergy: Math.round(gameState.currentEnergy),
        energyPercent: Math.round((gameState.currentEnergy / gameState.maxEnergy) * 100),
        energyClass: gameState.currentEnergy > 50 ? 'energy-good' : gameState.currentEnergy > 20 ? 'energy-warn' : 'energy-danger',
        totalTodosCompleted: gameState.totalTodosCompleted,
        totalArticlesRead: gameState.totalArticlesRead,
        totalWorkSeconds: gameState.totalWorkSeconds,
        totalService: `${workHours}h ${workMinutes}m`,
        clockText: (0, gameState_1.formatClock)(gameState.workSession.remainingSeconds),
        workSession: gameState.workSession,
    };
}
