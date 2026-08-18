import React from "react";
import { Box, Container, type Breakpoint } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Header from "../common/Header";
import Footer from "../common/Footer/Footer";
import BackToTop from "../common/BackToTop";
import RootLayout from "./RootLayout";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  titleSuffix?: string;
  maxWidth?: Breakpoint;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  titleSuffix,
  maxWidth,
}) => {
  return (
    <RootLayout title={title} titleSuffix={titleSuffix}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.default",
          backgroundImage: (theme) =>
            `radial-gradient(circle at 10% 0%, ${alpha(
              theme.palette.primary.main,
              theme.palette.mode === "light" ? 0.08 : 0.12,
            )} 0, transparent 28rem), radial-gradient(circle, ${alpha(
              theme.palette.primary.main,
              theme.palette.mode === "light" ? 0.1 : 0.08,
            )} 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 24px 24px",
          backgroundPosition: "0 0, 0 0",
        }}
      >
        <Header />
        <Container
          maxWidth={maxWidth || "lg"}
          sx={{
            mt: 2,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </Container>
        <Footer />
        <BackToTop />
      </Box>
    </RootLayout>
  );
};

export default MainLayout;
