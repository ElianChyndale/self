const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) throw new Error('OPENID unavailable');

  const now = new Date().toISOString();
  const profileRef = db.collection('users').doc(OPENID);
  const gameRef = db.collection('gameStates').doc(OPENID);

  let profile = await safeGet(profileRef);
  if (!profile) {
    profile = {
      openId: OPENID,
      nickname: `SELF-${OPENID.slice(-4).toUpperCase()}`,
      avatarUrl: '',
      createdAt: now,
      updatedAt: now,
    };
    await profileRef.set({ data: profile });
  }

  let gameState = await safeGet(gameRef);
  if (!gameState) {
    gameState = createDefaultGameState();
    await gameRef.set({ data: { ...gameState, updatedAt: now } });
  }

  return {
    openId: OPENID,
    profile,
    gameState: sanitizeGameState(gameState),
  };
};

async function safeGet(ref) {
  try {
    const result = await ref.get();
    return result.data || null;
  } catch {
    return null;
  }
}

function createDefaultGameState() {
  return {
    level: 1,
    totalXp: 0,
    currentEnergy: 100,
    maxEnergy: 100,
    todos: [],
    readArticleIds: [],
    totalTodosCompleted: 0,
    totalArticlesRead: 0,
    totalWorkSeconds: 0,
    workSession: idleWorkSession(),
  };
}

function idleWorkSession() {
  return {
    state: 'idle',
    remainingSeconds: 25 * 60,
    restType: null,
    cyclesCompleted: 0,
    sessionStart: null,
  };
}

function sanitizeGameState(input) {
  return {
    ...createDefaultGameState(),
    ...input,
    todos: Array.isArray(input.todos) ? input.todos : [],
    readArticleIds: Array.isArray(input.readArticleIds) ? input.readArticleIds : [],
    workSession: idleWorkSession(),
  };
}
