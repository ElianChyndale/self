import { describe, expect, it } from 'vitest';
import { displayNameFromEmail, rankProgress } from '../miniprogram/utils/gamification';

describe('rankProgress', () => {
  it('shows progress inside the current rank', () => {
    expect(rankProgress(675)).toEqual({
      currentLevel: 3,
      nextLevel: 4,
      currentThreshold: 400,
      nextThreshold: 900,
      xpIntoLevel: 275,
      xpNeededForLevel: 500,
      xpRemaining: 225,
      progressPercent: 55,
    });
  });
});

describe('displayNameFromEmail', () => {
  it('extracts a readable display name from an email address', () => {
    expect(displayNameFromEmail('elian@self.com')).toBe('Elian');
  });
});
