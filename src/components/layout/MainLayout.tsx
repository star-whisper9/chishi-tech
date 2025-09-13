import React from "react";
import { Box, Container } from "@mui/material";
import Header from "../common/Header";
import Footer from "../common/Footer";
import BackToTop from "../common/BackToTop";
import RootLayout from "./RootLayout";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  titleSuffix?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  titleSuffix,
}) => {
  return (
    <RootLayout title={title} titleSuffix={titleSuffix}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <Container
          maxWidth="lg"
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
