const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) throw new Error('OPENID unavailable');

  const profile = event.profile || {};
  const now = new Date().toISOString();
  const existing = await safeGet(db.collection('users').doc(OPENID));
  const data = {
    openId: OPENID,
    nickname: String(profile.nickname || existing?.nickname || `SELF-${OPENID.slice(-4).toUpperCase()}`).slice(0, 32),
    avatarUrl: String(profile.avatarUrl || existing?.avatarUrl || ''),
    createdAt: existing?.createdAt || profile.createdAt || now,
    updatedAt: now,
  };
  if (profile.firebaseUid || existing?.firebaseUid) data.firebaseUid = profile.firebaseUid || existing.firebaseUid;
  if (profile.claimedFirebaseEmail || existing?.claimedFirebaseEmail) {
    data.claimedFirebaseEmail = profile.claimedFirebaseEmail || existing.claimedFirebaseEmail;
  }

  await db.collection('users').doc(OPENID).set({ data });

  return { ok: true, profile: data };
};

async function safeGet(ref) {
  try {
    const result = await ref.get();
    return result.data || null;
  } catch {
    return null;
  }
}
