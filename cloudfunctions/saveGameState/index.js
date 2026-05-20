const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  if (!OPENID) throw new Error('OPENID unavailable');

  const gameState = sanitizeGameState(event.gameState || {});
  await db.collection('gameStates').doc(OPENID).set({
    data: {
      ...gameState,
      updatedAt: new Date().toISOString(),
    },
  });

  return { ok: true };
};

function sanitizeGameState(input) {
  const maxEnergy = numberInRange(input.maxEnergy, 1, 1000, 100);
  const currentEnergy = numberInRange(input.currentEnergy, 0, maxEnergy, 100);
  return {
    level: numberInRange(input.level, 1, 999, 1),
    totalXp: numberInRange(input.totalXp, 0, Number.MAX_SAFE_INTEGER, 0),
    currentEnergy,
    maxEnergy,
    todos: Array.isArray(input.todos) ? input.todos.slice(0, 500) : [],
    readArticleIds: Array.isArray(input.readArticleIds) ? input.readArticleIds.slice(0, 1000) : [],
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
