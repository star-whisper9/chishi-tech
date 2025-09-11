import { createTheme, type ThemeOptions } from "@mui/material/styles";

const darkHCPalette: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#baffff",
    },
    secondary: {
      main: "#ccdfef",
    },
  },
};

const lightHCPalette: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#003046",
    },
    secondary: {
      main: "#1d2e3a",
    },
  },
};

const darkPalette: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#93cdf6",
    },
    secondary: {
      main: "#b7c9d8",
    },
  },
};

const lightPalette: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#236488",
    },
    secondary: {
      main: "#4f616e",
    },
  },
};

export const light = createTheme(lightPalette);
export const dark = createTheme(darkPalette);
export const lightHC = createTheme(lightHCPalette);
export const darkHC = createTheme(darkHCPalette);
export type Themes = "light" | "dark" | "lightHC" | "darkHC";
export const themeNameMap: Record<Themes, string> = {
  light: "浅色",
  dark: "深色",
  lightHC: "浅色高对比度",
  darkHC: "深色高对比度",
};
export const isValidTheme = (theme: string): theme is Themes => {
  return ["light", "dark", "lightHC", "darkHC"].includes(theme);
};
