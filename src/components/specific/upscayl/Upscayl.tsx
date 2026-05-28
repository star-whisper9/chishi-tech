import React from "react";
import { Box } from "@mui/material";
import LocalUpscaylPanel from "./LocalUpscaylPanel";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UpscaylProps {}

const Upscayl: React.FC<UpscaylProps> = () => {
  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <LocalUpscaylPanel />
    </Box>
  );
};

export default Upscayl;
