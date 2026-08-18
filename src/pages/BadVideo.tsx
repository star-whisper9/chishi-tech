import React from "react";
import MainLayout from "../components/layout/MainLayout";
import PageIntro from "../components/common/PageIntro";
import BadVideo from "../components/specific/badvideo/BadVideo";
import { Box, Stack } from "@mui/material";
import { pages } from "./index";

const BadVideoPage: React.FC = () => {
  let title = "随机损坏 MP4";
  let description = "导出一个每字节有概率损坏的 MP4 视频文件。";
  for (const page of pages) {
    if (page.link === "/badvideo") {
      title = page.title;
      description = page.description;
    }
  }

  return (
    <MainLayout>
      <Box sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          <PageIntro title={title} description={description} />
          <BadVideo />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default BadVideoPage;
