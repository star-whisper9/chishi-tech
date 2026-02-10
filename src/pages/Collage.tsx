import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import { CollageMaker } from "../components/specific/collage";
import { pages } from "./index";

const CollagePage: React.FC = () => {
  let title = "拼图";
  let description = "多布局图片拼接，支持填充模式与导出。";
  for (const page of pages) {
    if (page.link === "/collage") {
      title = page.title;
      description = page.description;
    }
  }

  return (
    <MainLayout>
      <Box sx={{ py: 6 }}>
        <Stack spacing={4} alignItems="stretch">
          <Box textAlign="center">
            <Typography variant="h3" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <CollageMaker />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default CollagePage;
