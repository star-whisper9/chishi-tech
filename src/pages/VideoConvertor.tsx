import React from "react";
import { Box, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import PageIntro from "../components/common/PageIntro";
import VideoConvertor from "../components/specific/videoconvertor/VideoConvertor";
import { pages } from "./index";

const VideoConvertorPage: React.FC = () => {
  let title = "视频格式转换器";
  let description = "在浏览器中转换视频格式，支持多种格式互转。";

  // 从 pages 配置中读取标题和描述
  for (const page of pages) {
    if (page.link === "/videoconvertor") {
      title = page.title;
      description = page.description;
    }
  }

  return (
    <MainLayout>
      <Box sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={{ xs: 3, md: 4 }} alignItems="center">
          <PageIntro title={title} description={description} />
          <VideoConvertor />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default VideoConvertorPage;
