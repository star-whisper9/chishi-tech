import { type Middleware, isAction } from "@reduxjs/toolkit";
import { setTheme } from "../themeSlice"; // 引入你的 actions
import { STORAGE_KEYS } from "../../config/storageKeys";

export const themeMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // 检查 action 是否是已知的 Redux action
  if (isAction(action)) {
    // 检查 action 的 type 是否是我们关心的
    if (action.type === setTheme.type) {
      const state = store.getState();
      const currentTheme = state.theme.currentTheme;
      localStorage.setItem(STORAGE_KEYS.THEME, currentTheme);
    }
  }

  return result;
};
