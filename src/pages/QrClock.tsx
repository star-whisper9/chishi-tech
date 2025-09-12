import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import { QrClock } from "../components/specific/qrclock";

const QrClockPage: React.FC = () => {
  return (
    <MainLayout>
      <Box sx={{ py: 6 }}>
        <Stack spacing={4} alignItems="center">
          <Box textAlign="center">
            <Typography variant="h3" gutterBottom>
              二维码时钟
            </Typography>
            <Typography variant="h6" color="text.secondary">
              每秒更新的时间二维码，可选择常用时区。
            </Typography>
          </Box>
          <QrClock size={260} level="M" />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default QrClockPage;
