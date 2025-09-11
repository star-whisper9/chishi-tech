import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { useAppSelector } from "../../hooks/reduxHooks";
import { light, dark, lightHC, darkHC } from "../../hooks/theme";

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

const ThemeProviderWrapper: React.FC<ThemeProviderWrapperProps> = ({
  children,
}) => {
  const currentTheme = useAppSelector((state) => state.theme.currentTheme);

  const getTheme = () => {
    switch (currentTheme) {
      case "light":
        return light;
      case "dark":
        return dark;
      case "lightHC":
        return lightHC;
      case "darkHC":
        return darkHC;
      default:
        return dark;
    }
  };

  return <ThemeProvider theme={getTheme()}>{children}</ThemeProvider>;
};

export default ThemeProviderWrapper;
