import { getTabBarItems } from './language';
import type { ActiveTheme, AppLanguage } from '../types';

export function syncCustomTabBar(
  page: any,
  selected: number,
  activeTheme: ActiveTheme,
  activeLanguage: AppLanguage,
): void {
  const tabBar = page?.getTabBar?.();
  if (!tabBar?.setData) return;
  tabBar.setData({
    selected,
    activeTheme,
    items: getTabBarItems(activeLanguage),
  });
}
