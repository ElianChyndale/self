"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpToLevel = xpToLevel;
exports.levelFromXp = levelFromXp;
exports.hasLeveledUp = hasLeveledUp;
exports.rankProgress = rankProgress;
exports.displayNameFromEmail = displayNameFromEmail;
function xpToLevel(level) {
    if (level < 1)
        return 0;
    return (level - 1) * (level - 1) * 100;
}
function levelFromXp(totalXp) {
    if (totalXp < 0)
        return 1;
    return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}
function hasLeveledUp(totalXpBefore, totalXpAfter) {
    return levelFromXp(totalXpAfter) > levelFromXp(totalXpBefore);
}
function rankProgress(totalXp) {
    const safeXp = Math.max(0, totalXp);
    const currentLevel = levelFromXp(safeXp);
    const nextLevel = currentLevel + 1;
    const currentThreshold = xpToLevel(currentLevel);
    const nextThreshold = xpToLevel(nextLevel);
    const xpNeededForLevel = Math.max(0, nextThreshold - currentThreshold);
    const xpIntoLevel = Math.min(xpNeededForLevel, Math.max(0, safeXp - currentThreshold));
    const xpRemaining = Math.max(0, xpNeededForLevel - xpIntoLevel);
    const rawProgressPercent = xpNeededForLevel > 0
        ? Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForLevel) * 100))
        : 100;
    return {
        currentLevel,
        nextLevel,
        currentThreshold,
        nextThreshold,
        xpIntoLevel,
        xpNeededForLevel,
        xpRemaining,
        progressPercent: Math.round(rawProgressPercent * 100) / 100,
    };
}
function displayNameFromEmail(email) {
    var _a, _b;
    const username = (_b = (_a = email === null || email === void 0 ? void 0 : email.split('@')[0]) === null || _a === void 0 ? void 0 : _a.split('+')[0]) === null || _b === void 0 ? void 0 : _b.trim();
    if (!username)
        return null;
    const words = username
        .replace(/[._-]+/g, ' ')
        .split(/\s+/)
        .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
        .filter(Boolean);
    if (words.length === 0)
        return null;
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}
