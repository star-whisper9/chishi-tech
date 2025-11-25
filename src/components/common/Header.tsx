import React from "react";
import { AppBar, Toolbar, Typography, Box, Divider } from "@mui/material";
import ThemeSwitcher from "./ThemeSwitcher";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Header: React.FC = () => {
  const navigate = useNavigate();
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
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          <Box sx={{ display: "flex", gap: 3 }}>
            <ArrowBackIcon
              onClick={() => navigate(-1)}
              sx={{ cursor: "pointer" }}
            />
            <RouterLink
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography component="span">工具箱</Typography>
            </RouterLink>
            <RouterLink
              to="/api"
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Typography component="span">API</Typography>
            </RouterLink>
          </Box>
        </Box>
        <ThemeSwitcher />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
