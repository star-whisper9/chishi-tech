import React, { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Drawer,
  IconButton,
  Fab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import type { ApiEndpoint } from "../../../config/api/types";
import HttpMethodBadge from "./common/HttpMethodBadge";

interface ApiTableOfContentsProps {
  endpoints: ApiEndpoint[];
}

const ApiTableOfContents: React.FC<ApiTableOfContentsProps> = ({
  endpoints,
}) => {
  const [activeId, setActiveId] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    endpoints.forEach((ep) => {
      const element = document.getElementById(ep.operationId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [endpoints]);

  const handleClick = (operationId: string) => {
    const element = document.getElementById(operationId);
    if (element) {
      const yOffset = -80; // Header 高度偏移
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      // 小屏点击后关闭抽屉
      if (!isLargeScreen) {
        setDrawerOpen(false);
      }
    }
  };

  const tocContent = (inDrawer = false) => (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        maxHeight: { xs: "100%", lg: "calc(100vh - 120px)" },
        overflowY: "auto",
        p: 2,
        border: { xs: "none", lg: "1px solid" },
        borderColor: { lg: "divider" },
        ...(inDrawer && {
          backgroundColor: "transparent",
          backgroundImage: "none",
          border: "none",
        }),
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          端点导航
        </Typography>
        {!isLargeScreen && (
          <IconButton
            size="small"
            onClick={() => setDrawerOpen(false)}
            edge="end"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <List dense disablePadding>
        {endpoints.map((ep) => (
          <ListItemButton
            key={ep.operationId}
            onClick={() => handleClick(ep.operationId)}
            selected={activeId === ep.operationId}
            sx={{
              borderLeft: "2px solid",
              borderColor:
                activeId === ep.operationId ? "primary.main" : "transparent",
              pl: 1.5,
              py: 0.5,
              mb: 0.5,
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
              }}
            >
              <HttpMethodBadge method={ep.method} size="small" />
              <ListItemText
                primary={ep.path}
                primaryTypographyProps={{
                  variant: "caption",
                  sx: {
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            </Box>
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );

  // 大屏直接显示，小屏显示浮动按钮 + Drawer
  if (isLargeScreen) {
    return tocContent(false);
  }

  return (
    <>
      <Fab
        color="primary"
        aria-label="目录"
        size="small"
        sx={{
          position: "fixed",
          top: 100,
          right: 24,
          zIndex: 1000,
        }}
        onClick={() => setDrawerOpen(true)}
      >
        <MenuIcon />
      </Fab>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "85%", sm: 320 },
            maxWidth: 400,
            backgroundColor: "background.paper",
          },
        }}
      >
        {tocContent(true)}
      </Drawer>
    </>
  );
};

export default ApiTableOfContents;
