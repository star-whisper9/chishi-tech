import React from "react";
import { Box, CircularProgress } from "@mui/material";

/**
 * 页面懒加载时的全局加载指示器
 */
const PageLoadingFallback: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <CircularProgress size={48} />
    </Box>
  );
};

export default PageLoadingFallback;
