import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
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
          <QrClock size={260} level="M" />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default QrClockPage;
