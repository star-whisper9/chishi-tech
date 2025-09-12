import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import ThemeSwitcher from "./ThemeSwitcher";
import { Link as RouterLink } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          赤石科技
        </Typography>
        <ThemeSwitcher />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
