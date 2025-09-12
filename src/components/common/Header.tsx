import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import ThemeSwitcher from "./ThemeSwitcher";
import { Link as RouterLink } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <RouterLink
            to="/"
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <img
              src="/favicon.png"
              alt="Logo"
              style={{ width: 32, height: 32, marginRight: 8 }}
            />
            <Typography variant="h6" component="span">
              赤石科技
            </Typography>
          </RouterLink>
        </Box>
        <ThemeSwitcher />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
