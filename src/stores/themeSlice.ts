import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type Themes } from "../hooks/theme";

interface ThemeState {
  currentTheme: Themes;
}

const initialState: ThemeState = {
  currentTheme: "light",
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Themes>) => {
      state.currentTheme = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
