import React, { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import LocalUpscaylPanel from "./LocalUpscaylPanel";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UpscaylProps {}

const Upscayl: React.FC<UpscaylProps> = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="本地升图" />
        <Tab label="云端升图（需密钥）" />
      </Tabs>

      {tabValue === 0 && <LocalUpscaylPanel />}
      {tabValue === 1 && (
        <Box sx={{ maxWidth: "60%", margin: "0 auto" }}>
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            云端升图功能暂不开放，敬请期待。
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Upscayl;
