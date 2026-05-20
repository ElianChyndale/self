"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProfileComplete = isProfileComplete;
exports.buildProfileUpdate = buildProfileUpdate;
exports.mergeHydratedProfile = mergeHydratedProfile;
exports.shouldRequireProfileSetup = shouldRequireProfileSetup;
const CLAIM_PROFILE_ROUTE = 'pages/claim-profile/index';
function isProfileComplete(profile) {
    return Boolean(String((profile === null || profile === void 0 ? void 0 : profile.nickname) || '').trim() && String((profile === null || profile === void 0 ? void 0 : profile.avatarUrl) || '').trim());
}
function buildProfileUpdate(existingProfile, profilePatch, options) {
    var _a, _b, _c, _d, _e, _f;
    const now = options.now || new Date().toISOString();
    const existing = existingProfile || null;
    const openId = String((existing === null || existing === void 0 ? void 0 : existing.openId) || options.openId || '').trim();
    const nextNickname = String((_b = (_a = profilePatch.nickname) !== null && _a !== void 0 ? _a : existing === null || existing === void 0 ? void 0 : existing.nickname) !== null && _b !== void 0 ? _b : '').trim();
    const nextAvatarUrl = String((_d = (_c = profilePatch.avatarUrl) !== null && _c !== void 0 ? _c : existing === null || existing === void 0 ? void 0 : existing.avatarUrl) !== null && _d !== void 0 ? _d : '').trim();
    const next = {
        openId,
        nickname: nextNickname,
        avatarUrl: nextAvatarUrl,
        createdAt: (existing === null || existing === void 0 ? void 0 : existing.createdAt) || profilePatch.createdAt || now,
        updatedAt: now,
    };
    const firebaseUid = (_e = profilePatch.firebaseUid) !== null && _e !== void 0 ? _e : existing === null || existing === void 0 ? void 0 : existing.firebaseUid;
    const claimedFirebaseEmail = (_f = profilePatch.claimedFirebaseEmail) !== null && _f !== void 0 ? _f : existing === null || existing === void 0 ? void 0 : existing.claimedFirebaseEmail;
    if (firebaseUid)
        next.firebaseUid = firebaseUid;
    if (claimedFirebaseEmail)
        next.claimedFirebaseEmail = claimedFirebaseEmail;
    return next;
}
function mergeHydratedProfile(localProfile, cloudProfile) {
    if (!localProfile && !cloudProfile)
        return null;
    if (!localProfile)
        return cloudProfile || null;
    if (!cloudProfile)
        return localProfile;
    const openId = String(cloudProfile.openId || localProfile.openId || '').trim();
    const cloudNickname = String(cloudProfile.nickname || '').trim();
    const localNickname = String(localProfile.nickname || '').trim();
    const nickname = isGeneratedNickname(cloudNickname, openId) && localNickname
        ? localNickname
        : cloudNickname || localNickname;
    const avatarUrl = String(cloudProfile.avatarUrl || '').trim() || String(localProfile.avatarUrl || '').trim();
    const merged = {
        openId,
        nickname,
        avatarUrl,
        createdAt: earliest(localProfile.createdAt, cloudProfile.createdAt),
        updatedAt: latest(localProfile.updatedAt, cloudProfile.updatedAt),
    };
    const firebaseUid = cloudProfile.firebaseUid || localProfile.firebaseUid;
    const claimedFirebaseEmail = cloudProfile.claimedFirebaseEmail || localProfile.claimedFirebaseEmail;
    if (firebaseUid)
        merged.firebaseUid = firebaseUid;
    if (claimedFirebaseEmail)
        merged.claimedFirebaseEmail = claimedFirebaseEmail;
    return merged;
}
function shouldRequireProfileSetup(profile, currentRoute) {
    if (currentRoute === CLAIM_PROFILE_ROUTE)
        return false;
    return !isProfileComplete(profile);
}
function isGeneratedNickname(nickname, openId) {
    const normalized = String(nickname || '').trim().toUpperCase();
    if (!normalized)
        return true;
    const suffix = String(openId || '').slice(-4).toUpperCase();
    return normalized === `SELF-${suffix}` || normalized === 'SELF-USER';
}
function earliest(left, right) {
    return left && right ? (left <= right ? left : right) : left || right;
}
function latest(left, right) {
    return left && right ? (left >= right ? left : right) : left || right;
}
