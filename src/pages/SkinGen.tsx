import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import SkinGen from "../components/specific/skingen/SkinGen";
import { pages } from "./index";

const SkinGenPage: React.FC = () => {
  let title = "AI 皮肤生成";
  let description = "输入提示词，AI 为你生成 Minecraft 皮肤。";
  for (const page of pages) {
    if (page.link === "/skingen") {
      title = page.title;
      description = page.description;
    }
  }

  return (
    <MainLayout>
      <Box sx={{ py: 6 }}>
        <Stack spacing={4} alignItems="center">
          <Box textAlign="center">
            <Typography variant="h3" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <SkinGen />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default SkinGenPage;
