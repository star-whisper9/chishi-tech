import React from "react";
import TitleManager from "../common/TitleManager";

interface RootLayoutProps {
  children: React.ReactNode;
  title?: string;
  titleSuffix?: string;
}

/**
 * RootLayout - a lightweight base layout for cross-cutting concerns
 * (document title, analytics hooks, meta tags, keyboard shortcuts, etc.)
 */
const RootLayout: React.FC<RootLayoutProps> = ({
  children,
  title,
  titleSuffix,
}) => {
  return (
    <>
      <TitleManager title={title} titleSuffix={titleSuffix} />
      {children}
    </>
  );
};

export default RootLayout;
