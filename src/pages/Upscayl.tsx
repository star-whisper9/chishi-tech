import React from "react";
import { Box, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import PageIntro from "../components/common/PageIntro";
import Upscayl from "../components/specific/upscayl/Upscayl";
import { pages } from "./index";

const UpscaylPage: React.FC = () => {
  let title = "图像放大";
  let description = "使用 AI 模型放大图片，提升图片质量。";

  // 从 pages 配置中读取标题和描述
  for (const page of pages) {
    if (page.link === "/upscayl") {
      title = page.title;
      description = page.description;
    }
  }

  return (
    <MainLayout>
      <Box sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={{ xs: 3, md: 4 }} alignItems="center">
          <PageIntro title={title} description={description} />
          <Upscayl />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default UpscaylPage;
