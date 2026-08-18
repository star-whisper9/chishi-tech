import React from "react";
import { Box, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import PageIntro from "../components/common/PageIntro";
import { QrClock } from "../components/specific/qrclock";
import { pages } from "./index";

const QrClockPage: React.FC = () => {
  let title = "二维码时钟";
  let description = "每秒更新的时间二维码，可选择常用时区。";
  for (const page of pages) {
    if (page.link === "/qrclock") {
      title = page.title;
      description = page.description;
    }
  }

  return (
    <MainLayout>
      <Box sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={{ xs: 3, md: 4 }} alignItems="center">
          <PageIntro title={title} description={description} />
          <QrClock size={260} level="M" />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default QrClockPage;
