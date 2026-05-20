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
  if (!emailLower || !claimCode) return fail('INVALID_CODE', 'Email and claim code are required', Boolean(salt));
  if (!salt) return fail('NOT_CONFIGURED', 'CLAIM_CODE_SALT is not configured', false);

  const claimCodeHash = hashClaimCode(claimCode, salt);
  const claimQuery = await db.collection('migrationClaims')
    .where({ emailLower, claimCodeHash })
    .limit(1)
    .get();
  const claim = claimQuery.data && claimQuery.data[0];
  if (!claim) return fail('INVALID_CODE', 'Invalid claim code', true);
  if (claim.claimedAt || claim.claimedByOpenId) return fail('ALREADY_USED', 'Claim code already used', true);
  if (claim.expiresAt && new Date(claim.expiresAt).getTime() < Date.now()) {
    return fail('EXPIRED', 'Claim code expired', true);
  }

  const now = new Date().toISOString();
  const profileRef = db.collection('users').doc(OPENID);
  const gameRef = db.collection('gameStates').doc(OPENID);
  const existingProfile = await safeGet(profileRef);
  const importedProfile = sanitizeImportedProfile(claim.profileSnapshot || claim.gameStateSnapshot?.migratedProfile || {});

  const profile = {
    openId: OPENID,
    nickname: String(existingProfile?.nickname || importedProfile.nickname || displayNameFromEmail(emailLower)).slice(0, 32),
    avatarUrl: String(existingProfile?.avatarUrl || importedProfile.avatarUrl || ''),
    firebaseUid: claim.firebaseUid,
    claimedFirebaseEmail: emailLower,
    createdAt: existingProfile?.createdAt || now,
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
    ok: true,
    openId: OPENID,
    profile,
    gameState,
    capabilities: {
      claimMigrationConfigured: true,
    },
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

function sanitizeImportedProfile(input) {
  return {
    nickname: String(input?.nickname || '').trim(),
    avatarUrl: String(input?.avatarUrl || '').trim(),
  };
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

async function safeGet(ref) {
  try {
    const result = await ref.get();
    return result.data || null;
  } catch {
    return null;
  }
}

function fail(code, message, claimMigrationConfigured) {
  return {
    ok: false,
    code,
    message,
    claimMigrationConfigured,
  };
}
