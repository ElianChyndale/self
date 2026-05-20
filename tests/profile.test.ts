import { describe, expect, it } from 'vitest';
import {
  buildProfileUpdate,
  isProfileComplete,
  mergeHydratedProfile,
  shouldRequireProfileSetup,
} from '../miniprogram/utils/profile';
import type { UserProfile } from '../miniprogram/types';

describe('profile completeness', () => {
  it('requires both nickname and avatar url', () => {
    expect(isProfileComplete(null)).toBe(false);
    expect(isProfileComplete({
      openId: 'abc',
      nickname: 'Tester',
      avatarUrl: '',
      createdAt: '2026-05-20T00:00:00.000Z',
      updatedAt: '2026-05-20T00:00:00.000Z',
    })).toBe(false);
    expect(isProfileComplete({
      openId: 'abc',
      nickname: 'Tester',
      avatarUrl: 'cloud://avatar.png',
      createdAt: '2026-05-20T00:00:00.000Z',
      updatedAt: '2026-05-20T00:00:00.000Z',
    })).toBe(true);
  });
});

describe('profile update creation', () => {
  it('creates a valid profile when no profile exists yet', () => {
    expect(buildProfileUpdate(null, {
      nickname: 'First User',
      avatarUrl: 'cloud://avatar.png',
    }, {
      openId: 'openid-1234',
      now: '2026-05-20T00:00:00.000Z',
    })).toEqual({
      openId: 'openid-1234',
      nickname: 'First User',
      avatarUrl: 'cloud://avatar.png',
      createdAt: '2026-05-20T00:00:00.000Z',
      updatedAt: '2026-05-20T00:00:00.000Z',
    });
  });
});

describe('hydrated profile merging', () => {
  it('preserves local custom nickname and avatar when cloud profile is still default/incomplete', () => {
    const local: UserProfile = {
      openId: 'openid-1234',
      nickname: 'Commander Jane',
      avatarUrl: 'cloud://local-avatar.png',
      createdAt: '2026-05-20T00:00:00.000Z',
      updatedAt: '2026-05-20T00:01:00.000Z',
    };
    const cloud: UserProfile = {
      openId: 'openid-1234',
      nickname: 'SELF-1234',
      avatarUrl: '',
      createdAt: '2026-05-20T00:00:00.000Z',
      updatedAt: '2026-05-20T00:02:00.000Z',
      firebaseUid: 'firebase-1',
      claimedFirebaseEmail: 'user@example.com',
    };

    expect(mergeHydratedProfile(local, cloud)).toEqual({
      openId: 'openid-1234',
      nickname: 'Commander Jane',
      avatarUrl: 'cloud://local-avatar.png',
      createdAt: '2026-05-20T00:00:00.000Z',
      updatedAt: '2026-05-20T00:02:00.000Z',
      firebaseUid: 'firebase-1',
      claimedFirebaseEmail: 'user@example.com',
    });
  });
});

describe('setup gating', () => {
  it('requires onboarding only for incomplete profiles outside the claim-profile page', () => {
    const incomplete: UserProfile = {
      openId: 'openid-1234',
      nickname: 'Commander Jane',
      avatarUrl: '',
      createdAt: '2026-05-20T00:00:00.000Z',
      updatedAt: '2026-05-20T00:00:00.000Z',
    };

    expect(shouldRequireProfileSetup(incomplete, 'pages/dashboard/index')).toBe(true);
    expect(shouldRequireProfileSetup(incomplete, 'pages/claim-profile/index')).toBe(false);
    expect(shouldRequireProfileSetup(null, 'pages/stats/index')).toBe(true);
  });
});
