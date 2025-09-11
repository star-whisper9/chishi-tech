import React from "react";
import { Box, AppBar, Toolbar, Typography, Container } from "@mui/material";
import ThemeSwitcher from "../common/ThemeSwitcher";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            赤石科技
          </Typography>
          <ThemeSwitcher />
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        {children}
      </Container>
    </Box>
  );
};

export default MainLayout;
