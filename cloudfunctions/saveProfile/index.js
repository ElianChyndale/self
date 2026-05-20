const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) throw new Error('OPENID unavailable');

  const profile = event.profile || {};
  const now = new Date().toISOString();
  const data = {
    openId: OPENID,
    nickname: String(profile.nickname || `SELF-${OPENID.slice(-4).toUpperCase()}`).slice(0, 32),
    avatarUrl: String(profile.avatarUrl || ''),
    createdAt: profile.createdAt || now,
    updatedAt: now,
  };
  if (profile.firebaseUid) data.firebaseUid = profile.firebaseUid;
  if (profile.claimedFirebaseEmail) data.claimedFirebaseEmail = profile.claimedFirebaseEmail;

  await db.collection('users').doc(OPENID).set({ data });

  return { ok: true };
};
