const crypto = require('crypto');
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) throw new Error('OPENID unavailable');

  const emailLower = String(event.email || '').trim().toLowerCase();
  const claimCode = String(event.claimCode || '').trim().toUpperCase();
  const salt = process.env.CLAIM_CODE_SALT;
  if (!emailLower || !claimCode) throw new Error('Email and claim code are required');
  if (!salt) throw new Error('CLAIM_CODE_SALT is not configured');

  const claimCodeHash = hashClaimCode(claimCode, salt);
  const claimQuery = await db.collection('migrationClaims')
    .where({ emailLower, claimCodeHash })
    .limit(1)
    .get();
  const claim = claimQuery.data && claimQuery.data[0];
  if (!claim) throw new Error('Invalid claim code');
  if (claim.claimedAt || claim.claimedByOpenId) throw new Error('Claim code already used');
  if (claim.expiresAt && new Date(claim.expiresAt).getTime() < Date.now()) throw new Error('Claim code expired');

  const now = new Date().toISOString();
  const profileRef = db.collection('users').doc(OPENID);
  const gameRef = db.collection('gameStates').doc(OPENID);

  const profile = {
    openId: OPENID,
    nickname: displayNameFromEmail(emailLower),
    avatarUrl: '',
    firebaseUid: claim.firebaseUid,
    claimedFirebaseEmail: emailLower,
    createdAt: now,
    updatedAt: now,
  };
  const gameState = sanitizeGameState(claim.gameStateSnapshot || {});

  await profileRef.set({ data: profile });
  await gameRef.set({ data: { ...gameState, updatedAt: now } });
  await db.collection('migrationClaims').doc(claim._id).update({
    data: {
      claimedByOpenId: OPENID,
      claimedAt: now,
    },
  });

  return {
    openId: OPENID,
    profile,
    gameState,
  };
};

function hashClaimCode(claimCode, salt) {
  return crypto.createHash('sha256').update(`${claimCode}:${salt}`).digest('hex');
}

function displayNameFromEmail(email) {
  const username = String(email || '').split('@')[0].split('+')[0].trim();
  if (!username) return 'Unknown Acolyte';
  return username
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function sanitizeGameState(input) {
  const maxEnergy = numberInRange(input.maxEnergy, 1, 1000, 100);
  const currentEnergy = numberInRange(input.currentEnergy, 0, maxEnergy, 100);
  return {
    level: numberInRange(input.level, 1, 999, 1),
    totalXp: numberInRange(input.totalXp, 0, Number.MAX_SAFE_INTEGER, 0),
    currentEnergy,
    maxEnergy,
    todos: Array.isArray(input.todos) ? input.todos : [],
    readArticleIds: Array.isArray(input.readArticleIds) ? input.readArticleIds : [],
    totalTodosCompleted: numberInRange(input.totalTodosCompleted, 0, Number.MAX_SAFE_INTEGER, 0),
    totalArticlesRead: numberInRange(input.totalArticlesRead, 0, Number.MAX_SAFE_INTEGER, 0),
    totalWorkSeconds: numberInRange(input.totalWorkSeconds, 0, Number.MAX_SAFE_INTEGER, 0),
    workSession: {
      state: 'idle',
      remainingSeconds: 25 * 60,
      restType: null,
      cyclesCompleted: 0,
      sessionStart: null,
    },
  };
}

function numberInRange(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}
