import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Page } from "../../../pages";
import {
  ArrowForwardRounded,
  AutoAwesomeRounded,
  CalendarTodayRounded,
} from "@mui/icons-material";
import Poop from "../Icons/Poop";

interface PageCardProps {
  page: Page;
}

const PageCard: React.FC<PageCardProps> = ({ page }) => {
  const navigate = useNavigate();
  const isOffline = page.status === "offline";

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: 3,
        transition: (theme) =>
          theme.transitions.create(
            ["border-color", "box-shadow", "transform"],
            { duration: theme.transitions.duration.short },
          ),
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 3,
          transform: "translateY(-3px)",
        },
        "&:focus-within": {
          borderColor: "primary.main",
          boxShadow: 2,
        },
      }}
    >
      <CardActionArea
        onClick={() => navigate(page.link)}
        sx={{
          flexGrow: 1,
          alignItems: "stretch",
          display: "flex",
          flexDirection: "column",
          "&:hover .page-card-arrow": {
            color: "primary.main",
            transform: "translateX(4px)",
          },
        }}
      >
        <CardContent
          sx={{
            width: "100%",
            flexGrow: 1,
            p: { xs: 2.25, sm: 3 },
            "&:last-child": { pb: { xs: 2.25, sm: 3 } },
          }}
        >
          <Stack spacing={1.75} sx={{ height: "100%" }}>
            {/* 头部：图标 + 标题 + 标签 */}
            <Box display="flex" alignItems="center" gap={1.5}>
              {/* 大图标 Box */}
              {page.icon && (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    color: "primary.main",
                    "& svg": { fontSize: 24 },
                    "& img": { width: 24, height: 24, objectFit: "contain" },
                  }}
                >
                  {page.icon}
                </Box>
              )}

              {/* 右侧：标题与标签 */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {/* 
                  移除 flexWrap="wrap" 可以避免因宽度不够导致标签换行时，
                  alignItems="center" 把标题也往上顶的情况。
                  如果需要换行，保留 wrap，但依赖微调。
                */}
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      lineHeight: 1.3,
                    }}
                  >
                    {page.title}
                  </Typography>

                  {isOffline && (
                    <Chip
                      label="已下线"
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    />
                  )}

                  {!isOffline && page.shit === false && (
                    <Chip
                      label="精选"
                      size="small"
                      color="primary"
                      icon={<AutoAwesomeRounded />}
                      sx={{
                        height: 22,
                        fontSize: "0.75rem", // 稍微调大一点点，0.7 有时渲染发虚
                        fontWeight: 600,
                        "& .MuiChip-label": {
                          px: 1,
                          lineHeight: 1, // 3. 抹除文字默认行高
                          transform: "translateY(0.5px)", // 4. 微调 Chip 内中文字的位置
                        },
                        "& .MuiChip-icon": {
                          fontSize: 14,
                          ml: "6px", // 缩小图标和边缘的距离
                          mr: "-4px", // 缩小图标和文字的距离
                        },
                      }}
                    />
                  )}

                  {page.shit === true && (
                    <Chip
                      label="赤石"
                      size="small"
                      icon={<Poop />}
                      sx={{
                        height: 22,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#fff",
                        bgcolor: "#795548",
                        "& .MuiChip-label": {
                          px: 1,
                          lineHeight: 1,
                          transform: "translateY(0.5px)",
                        },
                        "& .MuiChip-icon": {
                          color: "#fff",
                          fontSize: 14,
                          ml: "6px",
                          mr: "-4px",
                          // 有些自定义 SVG 图标可能没居中，如果有问题可以加这一句：
                          // transform: "translateY(-0.5px)"
                        },
                        "&:hover": { bgcolor: "#5d4037" },
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexGrow: 1, lineHeight: 1.65 }}
            >
              {page.description}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                mt: 0.5,
              }}
            >
              <Stack direction="row" spacing={0.75} alignItems="center">
                <CalendarTodayRounded
                  sx={{ fontSize: 15, color: "text.disabled" }}
                />
                <Typography variant="caption" color="text.secondary">
                  更新 {page.lastUpdated}
                </Typography>
              </Stack>
              <ArrowForwardRounded
                className="page-card-arrow"
                sx={{
                  fontSize: 20,
                  color: "text.disabled",
                  transition: "transform 160ms ease, color 160ms ease",
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PageCard;
