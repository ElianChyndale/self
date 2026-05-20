import type { UserProfile } from '../types';

const CLAIM_PROFILE_ROUTE = 'pages/claim-profile/index';

export function isProfileComplete(profile: UserProfile | null | undefined): boolean {
  return Boolean(String(profile?.nickname || '').trim() && String(profile?.avatarUrl || '').trim());
}

export function buildProfileUpdate(
  existingProfile: UserProfile | null | undefined,
  profilePatch: Partial<UserProfile>,
  options: {
    openId: string;
    now?: string;
  },
): UserProfile {
  const now = options.now || new Date().toISOString();
  const existing = existingProfile || null;
  const openId = String(existing?.openId || options.openId || '').trim();
  const nextNickname = String(profilePatch.nickname ?? existing?.nickname ?? '').trim();
  const nextAvatarUrl = String(profilePatch.avatarUrl ?? existing?.avatarUrl ?? '').trim();

  const next: UserProfile = {
    openId,
    nickname: nextNickname,
    avatarUrl: nextAvatarUrl,
    createdAt: existing?.createdAt || profilePatch.createdAt || now,
    updatedAt: now,
  };

  const firebaseUid = profilePatch.firebaseUid ?? existing?.firebaseUid;
  const claimedFirebaseEmail = profilePatch.claimedFirebaseEmail ?? existing?.claimedFirebaseEmail;
  if (firebaseUid) next.firebaseUid = firebaseUid;
  if (claimedFirebaseEmail) next.claimedFirebaseEmail = claimedFirebaseEmail;

  return next;
}

export function mergeHydratedProfile(
  localProfile: UserProfile | null | undefined,
  cloudProfile: UserProfile | null | undefined,
): UserProfile | null {
  if (!localProfile && !cloudProfile) return null;
  if (!localProfile) return cloudProfile || null;
  if (!cloudProfile) return localProfile;

  const openId = String(cloudProfile.openId || localProfile.openId || '').trim();
  const cloudNickname = String(cloudProfile.nickname || '').trim();
  const localNickname = String(localProfile.nickname || '').trim();
  const nickname = isGeneratedNickname(cloudNickname, openId) && localNickname
    ? localNickname
    : cloudNickname || localNickname;
  const avatarUrl = String(cloudProfile.avatarUrl || '').trim() || String(localProfile.avatarUrl || '').trim();

  const merged: UserProfile = {
    openId,
    nickname,
    avatarUrl,
    createdAt: earliest(localProfile.createdAt, cloudProfile.createdAt),
    updatedAt: latest(localProfile.updatedAt, cloudProfile.updatedAt),
  };

  const firebaseUid = cloudProfile.firebaseUid || localProfile.firebaseUid;
  const claimedFirebaseEmail = cloudProfile.claimedFirebaseEmail || localProfile.claimedFirebaseEmail;
  if (firebaseUid) merged.firebaseUid = firebaseUid;
  if (claimedFirebaseEmail) merged.claimedFirebaseEmail = claimedFirebaseEmail;

  return merged;
}

export function shouldRequireProfileSetup(
  profile: UserProfile | null | undefined,
  currentRoute: string | null | undefined,
): boolean {
  if (currentRoute === CLAIM_PROFILE_ROUTE) return false;
  return !isProfileComplete(profile);
}

function isGeneratedNickname(nickname: string, openId: string): boolean {
  const normalized = String(nickname || '').trim().toUpperCase();
  if (!normalized) return true;
  const suffix = String(openId || '').slice(-4).toUpperCase();
  return normalized === `SELF-${suffix}` || normalized === 'SELF-USER';
}

function earliest(left: string, right: string): string {
  return left && right ? (left <= right ? left : right) : left || right;
}

function latest(left: string, right: string): string {
  return left && right ? (left >= right ? left : right) : left || right;
}
