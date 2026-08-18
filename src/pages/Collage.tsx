import React from "react";
import { Box, Stack } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import PageIntro from "../components/common/PageIntro";
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
      <Box sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={{ xs: 3, md: 4 }} alignItems="stretch">
          <PageIntro title={title} description={description} />
          <CollageMaker />
        </Stack>
      </Box>
    </MainLayout>
  );
};

export default CollagePage;
