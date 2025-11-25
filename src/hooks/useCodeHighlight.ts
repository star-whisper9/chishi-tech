import { useTheme } from "@mui/material/styles";
import { themes, type Language, type PrismTheme } from "prism-react-renderer";

// 仅声明会使用到的语言，避免随意滥用 any
export type SupportedLanguage =
  | "text"
  | "json"
  | "javascript"
  | "typescript"
  | "bash"
  | "python";

interface UseCodeHighlightResult {
  language: Language;
  theme: PrismTheme;
}

export const useCodeHighlight = (
  language: SupportedLanguage = "text"
): UseCodeHighlightResult => {
  const muiTheme = useTheme();
  const mode = muiTheme.palette.mode;
  // 选择基础 Prism 主题后与 MUI 主题融合，保持单层背景
  const base = mode === "dark" ? themes.vsDark : themes.github;
  const merged: PrismTheme = {
    ...base,
    plain: {
      ...base.plain,
      backgroundColor: muiTheme.palette.background.paper,
      color: muiTheme.palette.text.primary,
    },
  };
  return { language: language as Language, theme: merged };
};

export const prismDefaultProps = {};
