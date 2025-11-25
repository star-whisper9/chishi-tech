import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Divider,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ThemeSwitcher from "./ThemeSwitcher";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ApiIcon from "@mui/icons-material/Api";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const DRAWER_WIDTH = 280;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "工具箱", path: "/", icon: <HomeIcon /> },
  { label: "API", path: "/api", icon: <ApiIcon /> },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleDrawerClose();
  };

  // 抽屉内容
  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 抽屉头部 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src="/favicon.png"
            alt="Logo"
            style={{ width: 32, height: 32 }}
          />
          <Typography variant="h6" component="span">
            赤石科技
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerClose} aria-label="关闭菜单">
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      {/* 导航列表 */}
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 2,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* 抽屉底部：主题切换 */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <ThemeSwitcher />
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {/* 移动端：菜单按钮 */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="打开菜单"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo 和标题 */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
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
              <Typography
                variant="h6"
                component="span"
                sx={{
                  display: { xs: "none", sm: "block" },
                }}
              >
                赤石科技
              </Typography>
            </RouterLink>

            {/* 桌面端：导航链接 */}
            {!isMobile && (
              <>
                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <IconButton
                    color="inherit"
                    onClick={() => navigate(-1)}
                    aria-label="返回上一页"
                    size="small"
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  {navItems.map((item) => (
                    <RouterLink
                      key={item.path}
                      to={item.path}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          opacity: location.pathname === item.path ? 1 : 0.8,
                          fontWeight:
                            location.pathname === item.path ? 600 : 400,
                          "&:hover": {
                            opacity: 1,
                          },
                        }}
                      >
                        {item.label}
                      </Typography>
                    </RouterLink>
                  ))}
                </Box>
              </>
            )}
          </Box>

          {/* 移动端：返回按钮 */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => navigate(-1)}
              aria-label="返回上一页"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          {/* 桌面端：主题切换器 */}
          {!isMobile && <ThemeSwitcher />}
        </Toolbar>
      </AppBar>

      {/* 移动端抽屉 */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // 移动端性能优化
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Header;
