import {
  DEFAULT_MAX_ENERGY,
  ENERGY_DECREASE_PER_CYCLE,
  LONG_REST_DURATION_SECONDS,
  SHORT_REST_DURATION_SECONDS,
  TODO_XP_REWARDS,
  WORK_DURATION_SECONDS,
  WORK_SESSION_XP,
  NEWS_READ_XP,
} from './constants';
import { levelFromXp } from './gamification';
import type { GameState, Todo, TodoDifficulty, UserProfile, WorkSession } from '../types';

export const idleWorkSession: WorkSession = {
  state: 'idle',
  remainingSeconds: WORK_DURATION_SECONDS,
  restType: null,
  cyclesCompleted: 0,
  sessionStart: null,
};

export function createDefaultGameState(): GameState {
  return {
    level: 1,
    totalXp: 0,
    currentEnergy: DEFAULT_MAX_ENERGY,
    maxEnergy: DEFAULT_MAX_ENERGY,
    todos: [],
    readArticleIds: [],
    totalTodosCompleted: 0,
    totalArticlesRead: 0,
    totalWorkSeconds: 0,
    workSession: { ...idleWorkSession },
  };
}

export function createDefaultProfile(openId: string): UserProfile {
  const now = new Date().toISOString();
  return {
    openId,
    nickname: `SELF-${openId.slice(-4).toUpperCase() || 'USER'}`,
    avatarUrl: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function sanitizeHydratedGameState(input: Partial<GameState> | null | undefined): GameState {
  const base = createDefaultGameState();
  return {
    ...base,
    ...input,
    currentEnergy: Math.min(input?.maxEnergy ?? base.maxEnergy, Math.max(0, input?.currentEnergy ?? base.currentEnergy)),
    todos: Array.isArray(input?.todos) ? input.todos : [],
    readArticleIds: Array.isArray(input?.readArticleIds) ? input.readArticleIds : [],
    workSession: { ...idleWorkSession },
  };
}

export function awardXp(state: GameState, amount: number): GameState {
  const totalXp = Math.max(0, state.totalXp + amount);
  return {
    ...state,
    totalXp,
    level: levelFromXp(totalXp),
  };
}

export function addTodo(state: GameState, title: string, difficulty: TodoDifficulty): GameState {
  const now = new Date().toISOString();
  const todo: Todo = {
    id: randomId(),
    title: title.trim(),
    difficulty,
    completed: false,
    completedAt: null,
    createdAt: now,
  };
  return { ...state, todos: [todo, ...state.todos] };
}

export function updateTodo(state: GameState, id: string, title: string, difficulty: TodoDifficulty): GameState {
  return {
    ...state,
    todos: state.todos.map((todo) => todo.id === id ? { ...todo, title: title.trim(), difficulty } : todo),
  };
}

export function deleteTodo(state: GameState, id: string): GameState {
  return { ...state, todos: state.todos.filter((todo) => todo.id !== id) };
}

export function completeTodo(state: GameState, id: string): GameState {
  const todo = state.todos.find((item) => item.id === id);
  if (!todo || todo.completed) return state;

  const completedAt = new Date().toISOString();
  const updated = {
    ...state,
    todos: state.todos.map((item) => item.id === id ? { ...item, completed: true, completedAt } : item),
    totalTodosCompleted: state.totalTodosCompleted + 1,
  };
  return awardXp(updated, TODO_XP_REWARDS[todo.difficulty]);
}

export function markArticleRead(state: GameState, articleLink: string): GameState {
  const link = String(articleLink || '').trim();
  if (!link || state.readArticleIds.includes(link)) return state;

  const updated = {
    ...state,
    readArticleIds: [...state.readArticleIds, link],
    totalArticlesRead: state.totalArticlesRead + 1,
  };
  return awardXp(updated, NEWS_READ_XP);
}

export function startWork(state: GameState): GameState {
  if (state.currentEnergy <= 0) return state;
  return {
    ...state,
    workSession: {
      state: 'working',
      remainingSeconds: WORK_DURATION_SECONDS,
      restType: null,
      cyclesCompleted: state.workSession.cyclesCompleted,
      sessionStart: Date.now(),
    },
  };
}

export function pauseWork(state: GameState): GameState {
  if (state.workSession.state !== 'working') return state;
  return { ...state, workSession: { ...state.workSession, state: 'paused', sessionStart: null } };
}

export function resumeWork(state: GameState): GameState {
  if (state.workSession.state !== 'paused') return state;
  return { ...state, workSession: { ...state.workSession, state: 'working', sessionStart: Date.now() } };
}

export function stopWork(state: GameState): GameState {
  return {
    ...state,
    workSession: { ...idleWorkSession, cyclesCompleted: state.workSession.cyclesCompleted },
  };
}

export function completeWork(state: GameState): GameState {
  const withXp = awardXp(state, WORK_SESSION_XP);
  return {
    ...withXp,
    totalWorkSeconds: withXp.totalWorkSeconds + WORK_DURATION_SECONDS,
    workSession: {
      state: 'resting',
      remainingSeconds: SHORT_REST_DURATION_SECONDS,
      restType: 'short',
      cyclesCompleted: state.workSession.cyclesCompleted + 1,
      sessionStart: Date.now(),
    },
  };
}

export function startLongRest(state: GameState): GameState {
  if (state.currentEnergy >= state.maxEnergy) return state;
  return {
    ...state,
    workSession: {
      state: 'resting',
      remainingSeconds: LONG_REST_DURATION_SECONDS,
      restType: 'long',
      cyclesCompleted: state.workSession.cyclesCompleted,
      sessionStart: Date.now(),
    },
  };
}

export function completeRest(state: GameState): GameState {
  const isLongRest = state.workSession.restType === 'long';
  return {
    ...state,
    currentEnergy: isLongRest
      ? state.maxEnergy
      : Math.max(0, state.currentEnergy - ENERGY_DECREASE_PER_CYCLE),
    workSession: {
      ...idleWorkSession,
      cyclesCompleted: isLongRest ? 0 : state.workSession.cyclesCompleted,
    },
  };
}

export function tickClock(state: GameState, now = Date.now()): GameState {
  const session = state.workSession;
  if (session.state !== 'working' && session.state !== 'resting') return state;
  if (!session.sessionStart) return state;

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

export function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const rest = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${rest}`;
}

function randomId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
