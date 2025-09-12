import React from "react";
import { Box, Container } from "@mui/material";
import Header from "../common/Header";
import Footer from "../common/Footer";
import BackToTop from "../common/BackToTop";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
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
  );
};

export default MainLayout;
