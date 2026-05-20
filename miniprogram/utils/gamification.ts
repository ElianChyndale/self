import type { RankProgress } from '../types';

export function xpToLevel(level: number): number {
  if (level < 1) return 0;
  return (level - 1) * (level - 1) * 100;
}

export function levelFromXp(totalXp: number): number {
  if (totalXp < 0) return 1;
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

export function hasLeveledUp(totalXpBefore: number, totalXpAfter: number): boolean {
  return levelFromXp(totalXpAfter) > levelFromXp(totalXpBefore);
}

export function rankProgress(totalXp: number): RankProgress {
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

export function displayNameFromEmail(email: string | null | undefined): string | null {
  const username = email?.split('@')[0]?.split('+')[0]?.trim();
  if (!username) return null;

  const words = username
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);

  if (words.length === 0) return null;
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}
