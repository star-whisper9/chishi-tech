import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import LocalUpscaylPanel from "./LocalUpscaylPanel";
import RemoteUpscaylPanel from "./RemoteUpscaylPanel";

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
        <Tab label="前端版本 (WebGPU/WASM)" />
        <Tab label="后端版本 (Remote API)" />
      </Tabs>

      {tabValue === 0 && <LocalUpscaylPanel />}
      {tabValue === 1 && <RemoteUpscaylPanel />}
    </Box>
  );
};

export default Upscayl;
