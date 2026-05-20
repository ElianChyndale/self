"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idleWorkSession = void 0;
exports.createDefaultGameState = createDefaultGameState;
exports.createDefaultProfile = createDefaultProfile;
exports.sanitizeHydratedGameState = sanitizeHydratedGameState;
exports.awardXp = awardXp;
exports.addTodo = addTodo;
exports.updateTodo = updateTodo;
exports.deleteTodo = deleteTodo;
exports.completeTodo = completeTodo;
exports.markArticleRead = markArticleRead;
exports.startWork = startWork;
exports.pauseWork = pauseWork;
exports.resumeWork = resumeWork;
exports.stopWork = stopWork;
exports.completeWork = completeWork;
exports.startLongRest = startLongRest;
exports.completeRest = completeRest;
exports.tickClock = tickClock;
exports.formatClock = formatClock;
const constants_1 = require("./constants");
const gamification_1 = require("./gamification");
exports.idleWorkSession = {
    state: 'idle',
    remainingSeconds: constants_1.WORK_DURATION_SECONDS,
    restType: null,
    cyclesCompleted: 0,
    sessionStart: null,
};
function createDefaultGameState() {
    return {
        level: 1,
        totalXp: 0,
        currentEnergy: constants_1.DEFAULT_MAX_ENERGY,
        maxEnergy: constants_1.DEFAULT_MAX_ENERGY,
        todos: [],
        readArticleIds: [],
        totalTodosCompleted: 0,
        totalArticlesRead: 0,
        totalWorkSeconds: 0,
        workSession: { ...exports.idleWorkSession },
    };
}
function createDefaultProfile(openId) {
    const now = new Date().toISOString();
    return {
        openId,
        nickname: `SELF-${openId.slice(-4).toUpperCase() || 'USER'}`,
        avatarUrl: '',
        createdAt: now,
        updatedAt: now,
    };
}
function sanitizeHydratedGameState(input) {
    var _a, _b;
    const base = createDefaultGameState();
    return {
        ...base,
        ...input,
        currentEnergy: Math.min((_a = input === null || input === void 0 ? void 0 : input.maxEnergy) !== null && _a !== void 0 ? _a : base.maxEnergy, Math.max(0, (_b = input === null || input === void 0 ? void 0 : input.currentEnergy) !== null && _b !== void 0 ? _b : base.currentEnergy)),
        todos: Array.isArray(input === null || input === void 0 ? void 0 : input.todos) ? input.todos : [],
        readArticleIds: Array.isArray(input === null || input === void 0 ? void 0 : input.readArticleIds) ? input.readArticleIds : [],
        workSession: { ...exports.idleWorkSession },
    };
}
function awardXp(state, amount) {
    const totalXp = Math.max(0, state.totalXp + amount);
    return {
        ...state,
        totalXp,
        level: (0, gamification_1.levelFromXp)(totalXp),
    };
}
function addTodo(state, title, difficulty) {
    const now = new Date().toISOString();
    const todo = {
        id: randomId(),
        title: title.trim(),
        difficulty,
        completed: false,
        completedAt: null,
        createdAt: now,
    };
    return { ...state, todos: [todo, ...state.todos] };
}
function updateTodo(state, id, title, difficulty) {
    return {
        ...state,
        todos: state.todos.map((todo) => todo.id === id ? { ...todo, title: title.trim(), difficulty } : todo),
    };
}
function deleteTodo(state, id) {
    return { ...state, todos: state.todos.filter((todo) => todo.id !== id) };
}
function completeTodo(state, id) {
    const todo = state.todos.find((item) => item.id === id);
    if (!todo || todo.completed)
        return state;
    const completedAt = new Date().toISOString();
    const updated = {
        ...state,
        todos: state.todos.map((item) => item.id === id ? { ...item, completed: true, completedAt } : item),
        totalTodosCompleted: state.totalTodosCompleted + 1,
    };
    return awardXp(updated, constants_1.TODO_XP_REWARDS[todo.difficulty]);
}
function markArticleRead(state, articleLink) {
    const link = String(articleLink || '').trim();
    if (!link || state.readArticleIds.includes(link))
        return state;
    const updated = {
        ...state,
        readArticleIds: [...state.readArticleIds, link],
        totalArticlesRead: state.totalArticlesRead + 1,
    };
    return awardXp(updated, constants_1.NEWS_READ_XP);
}
function startWork(state) {
    if (state.currentEnergy <= 0)
        return state;
    return {
        ...state,
        workSession: {
            state: 'working',
            remainingSeconds: constants_1.WORK_DURATION_SECONDS,
            restType: null,
            cyclesCompleted: state.workSession.cyclesCompleted,
            sessionStart: Date.now(),
        },
    };
}
function pauseWork(state) {
    if (state.workSession.state !== 'working')
        return state;
    return { ...state, workSession: { ...state.workSession, state: 'paused', sessionStart: null } };
}
function resumeWork(state) {
    if (state.workSession.state !== 'paused')
        return state;
    return { ...state, workSession: { ...state.workSession, state: 'working', sessionStart: Date.now() } };
}
function stopWork(state) {
    return {
        ...state,
        workSession: { ...exports.idleWorkSession, cyclesCompleted: state.workSession.cyclesCompleted },
    };
}
function completeWork(state) {
    const withXp = awardXp(state, constants_1.WORK_SESSION_XP);
    return {
        ...withXp,
        totalWorkSeconds: withXp.totalWorkSeconds + constants_1.WORK_DURATION_SECONDS,
        workSession: {
            state: 'resting',
            remainingSeconds: constants_1.SHORT_REST_DURATION_SECONDS,
            restType: 'short',
            cyclesCompleted: state.workSession.cyclesCompleted + 1,
            sessionStart: Date.now(),
        },
    };
}
function startLongRest(state) {
    if (state.currentEnergy >= state.maxEnergy)
        return state;
    return {
        ...state,
        workSession: {
            state: 'resting',
            remainingSeconds: constants_1.LONG_REST_DURATION_SECONDS,
            restType: 'long',
            cyclesCompleted: state.workSession.cyclesCompleted,
            sessionStart: Date.now(),
        },
    };
}
function completeRest(state) {
    const isLongRest = state.workSession.restType === 'long';
    return {
        ...state,
        currentEnergy: isLongRest
            ? state.maxEnergy
            : Math.max(0, state.currentEnergy - constants_1.ENERGY_DECREASE_PER_CYCLE),
        workSession: {
            ...exports.idleWorkSession,
            cyclesCompleted: isLongRest ? 0 : state.workSession.cyclesCompleted,
        },
    };
}
function tickClock(state, now = Date.now()) {
    const session = state.workSession;
    if (session.state !== 'working' && session.state !== 'resting')
        return state;
    if (!session.sessionStart)
        return state;
    const elapsed = Math.floor((now - session.sessionStart) / 1000);
    const remainingSeconds = Math.max(0, session.remainingSeconds - elapsed);
    if (remainingSeconds <= 0) {
        return session.state === 'working' ? completeWork(state) : completeRest(state);
    }
    return {
        ...state,
        workSession: {
            ...session,
            remainingSeconds,
            sessionStart: now,
        },
    };
}
function formatClock(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${rest}`;
}
function randomId() {
    const cryptoApi = globalThis.crypto;
    if (cryptoApi === null || cryptoApi === void 0 ? void 0 : cryptoApi.randomUUID)
        return cryptoApi.randomUUID();
    return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
