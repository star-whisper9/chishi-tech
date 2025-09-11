import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";
import { themeMiddleware } from "./middlewares";
import { loadInitialTheme } from "./storage";

/**
 * 返回 undefined 以降级到 Slice 的默认值
 * @returns 预加载状态，如果本地存储没有则返回 undefined
 */
const getPreloadedState = () => {
  const storedTheme = loadInitialTheme();
  return storedTheme ? { theme: { currentTheme: storedTheme } } : undefined;
};

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(themeMiddleware),
  preloadedState: getPreloadedState(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
