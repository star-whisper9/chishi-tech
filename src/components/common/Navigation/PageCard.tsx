import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Page } from "../../../pages";

interface PageCardProps {
  page: Page;
}

const PageCard: React.FC<PageCardProps> = ({ page }) => {
  const navigate = useNavigate();
  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardActionArea
        onClick={() => navigate(page.link)}
        sx={{ flexGrow: 1, alignItems: "stretch" }}
      >
        <CardContent>
          <Stack spacing={1.2}>
            <Box display="flex" alignItems="center" gap={1.25}>
              {page.icon && (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    borderRadius: 1,
                    bgcolor: (theme) =>
                      theme.palette.mode === "light"
                        ? theme.palette.action.hover
                        : theme.palette.action.selected,
                    "& svg": { fontSize: 28 },
                    "& img": { width: 28, height: 28, objectFit: "contain" },
                  }}
                >
                  {page.icon}
                </Box>
              )}
              <Typography variant="h6" component="h3" fontWeight={600}>
                {page.title}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexGrow: 1 }}
            >
              {page.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              更新: {page.lastUpdated}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PageCard;
