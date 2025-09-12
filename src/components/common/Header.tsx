import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import ThemeSwitcher from "./ThemeSwitcher";

const Header: React.FC = () => {
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          赤石科技
        </Typography>
        <ThemeSwitcher />
      </Toolbar>
    </AppBar>
  );
};
export default Header;
