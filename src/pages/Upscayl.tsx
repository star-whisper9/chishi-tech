import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
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
          <Upscayl />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default UpscaylPage;
