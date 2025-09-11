import { STORAGE_KEYS } from "../config/storageKeys";
import { type Themes, isValidTheme } from "../hooks/theme";

/**
 * 加载存储的主题选择
 * @returns 初始主题，如果本地存储没有则返回 null
 */
export const loadInitialTheme = (): Themes | null => {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (savedTheme && isValidTheme(savedTheme)) {
    return savedTheme;
  }
  return null;
};
