import { rankProgress } from './gamification';
import { formatClock } from './gameState';
import { getDefaultProfileName, getLanguageName } from './language';
import { getThemeLabel } from './theme';
import type {
  ActiveTheme,
  AppLanguage,
  GameState,
  LanguagePreference,
  ThemePreference,
  UserProfile,
} from '../types';

export function buildThemePageData(
  themePreference: ThemePreference,
  activeTheme: ActiveTheme,
  statusBarHeight: number,
  languagePreference: LanguagePreference,
  activeLanguage: AppLanguage,
) {
  return {
    themePreference,
    activeTheme,
    languagePreference,
    activeLanguage,
    languageLabel: getLanguageName(activeLanguage),
    themeLabel: getThemeLabel(themePreference, activeLanguage),
    activeThemeLabel: getThemeLabel(activeTheme, activeLanguage),
    statusBarHeight,
  };
}

export function buildSharedPageData(
  profile: UserProfile | null,
  gameState: GameState,
  themePreference: ThemePreference,
  activeTheme: ActiveTheme,
  statusBarHeight: number,
  languagePreference: LanguagePreference,
  activeLanguage: AppLanguage,
) {
  const rank = rankProgress(gameState.totalXp);
  const activeTodos = gameState.todos.filter((todo) => !todo.completed);
  const workHours = Math.floor(gameState.totalWorkSeconds / 3600);
  const workMinutes = Math.floor((gameState.totalWorkSeconds % 3600) / 60);

  return {
    ...buildThemePageData(
      themePreference,
      activeTheme,
      statusBarHeight,
      languagePreference,
      activeLanguage,
    ),
    profileName: profile?.nickname || getDefaultProfileName(activeLanguage),
    avatarUrl: profile?.avatarUrl || '',
    rank,
    activeTodos,
    pendingCount: activeTodos.length,
    totalXp: gameState.totalXp,
    currentEnergy: Math.round(gameState.currentEnergy),
    energyPercent: Math.round((gameState.currentEnergy / gameState.maxEnergy) * 100),
    energyClass: gameState.currentEnergy > 50 ? 'energy-good' : gameState.currentEnergy > 20 ? 'energy-warn' : 'energy-danger',
    totalTodosCompleted: gameState.totalTodosCompleted,
    totalArticlesRead: gameState.totalArticlesRead,
    totalWorkSeconds: gameState.totalWorkSeconds,
    totalService: `${workHours}h ${workMinutes}m`,
    clockText: formatClock(gameState.workSession.remainingSeconds),
    workSession: gameState.workSession,
  };
}
