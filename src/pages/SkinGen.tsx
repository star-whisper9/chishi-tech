import React from "react";
import { Box, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import PageIntro from "../components/common/PageIntro";
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
      <Box sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={{ xs: 3, md: 4 }} alignItems="center">
          <PageIntro title={title} description={description} />
          <SkinGen />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default SkinGenPage;
