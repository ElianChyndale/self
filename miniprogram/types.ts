export type TodoDifficulty = 'easy' | 'medium' | 'hard';
export type ClockState = 'idle' | 'working' | 'resting' | 'paused';
export type RestType = 'short' | 'long' | null;
export type ThemePreference = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';
export type AppLanguage = 'zh-CN' | 'en';
export type LanguagePreference = 'auto' | AppLanguage;
export type CloudBootstrapState = 'pending' | 'online' | 'offline';
export type NewsCategory = 'finance' | 'computer-science' | 'ai' | 'politics';
export type IntelSource = 'bundled' | 'cache' | 'live';

export interface AppCapabilities {
  claimMigrationConfigured: boolean;
}

export interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  category: NewsCategory;
}

export interface Todo {
  id: string;
  title: string;
  difficulty: TodoDifficulty;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface WorkSession {
  state: ClockState;
  remainingSeconds: number;
  restType: RestType;
  cyclesCompleted: number;
  sessionStart: number | null;
}

export interface GameState {
  level: number;
  totalXp: number;
  currentEnergy: number;
  maxEnergy: number;
  todos: Todo[];
  readArticleIds: string[];
  totalTodosCompleted: number;
  totalArticlesRead: number;
  totalWorkSeconds: number;
  workSession: WorkSession;
}

export interface UserProfile {
  openId: string;
  nickname: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
  firebaseUid?: string;
  claimedFirebaseEmail?: string;
}

export interface RankProgress {
  currentLevel: number;
  nextLevel: number;
  currentThreshold: number;
  nextThreshold: number;
  xpIntoLevel: number;
  xpNeededForLevel: number;
  xpRemaining: number;
  progressPercent: number;
}

export interface MiniRuntimeState {
  profile: UserProfile | null;
  gameState: GameState;
  themePreference: ThemePreference;
  activeTheme: ActiveTheme;
  systemTheme: ActiveTheme;
  languagePreference: LanguagePreference;
  activeLanguage: AppLanguage;
  capabilities: AppCapabilities;
  cloudBootstrapState: CloudBootstrapState;
  statusBarHeight: number;
  ready: boolean;
}
