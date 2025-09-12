import React from "react";
import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import ThemeSwitcher from "./ThemeSwitcher";
import { Link as RouterLink, useLocation } from "react-router-dom";

const navLinks = [
  { label: "首页", to: "/" },
  { label: "二维码时钟", to: "/qrclock" },
];

const Header: React.FC = () => {
  const location = useLocation();
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          赤石科技
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
          {navLinks.map((link) => (
            <Button
              key={link.to}
              color={location.pathname === link.to ? "secondary" : "inherit"}
              component={RouterLink}
              to={link.to}
            >
              {link.label}
            </Button>
          ))}
        </Stack>
        <ThemeSwitcher />
      </Toolbar>
    </AppBar>
  );
};
export default Header;
