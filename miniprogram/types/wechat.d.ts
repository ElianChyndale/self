declare const wx: any;
declare const Page: any;
declare const Component: any;
declare function App<T = any>(options: T): void;
declare function getApp<T = any>(): T;
declare function getCurrentPages(): Array<{
  route?: string;
  refresh?: () => void;
  setData?: (data: Record<string, unknown>) => void;
  getTabBar?: () => { setData?: (data: Record<string, unknown>) => void } | null;
}>;

interface IAppOption {
  globalData: import('../types').MiniRuntimeState;
  onLaunch: () => Promise<void> | void;
  bootstrap: () => Promise<void>;
  initializeTheme: () => void;
  initializeLanguage: () => void;
  refineAutoLanguageFromRegion: () => Promise<void>;
  applyHydratedState: (
    profile: import('../types').UserProfile,
    gameState: import('../types').GameState,
    capabilities?: import('../types').AppCapabilities,
  ) => void;
  handleSystemThemeChange: (nextTheme: unknown) => void;
  setThemePreference: (themePreference: import('../types').ThemePreference) => void;
  setLanguagePreference: (languagePreference: import('../types').LanguagePreference) => void;
  syncThemeToCurrentPage: () => void;
  refreshCurrentPage: () => void;
  ensureProfileSetup: () => void;
  updateProfile: (profile: Partial<import('../types').UserProfile>) => Promise<{
    profile: import('../types').UserProfile;
    cloudSaved: boolean;
  }>;
  updateGameState: (gameState: import('../types').GameState) => void;
  syncGameState: () => void;
}
