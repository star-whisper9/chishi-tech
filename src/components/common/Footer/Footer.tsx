import React from "react";
import {
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import GlitchText from "./GlitchText";

const MOE_COUNTER_URL = `${
  import.meta.env.DEV
    ? "/ext/moe-counter"
    : "https://api.f1a.me/moe-counter"
}/@chishi-tech?name=chishi-tech&theme=booru-lewd&padding=7&offset=0&align=top&scale=0.4&pixelated=1&darkmode=0`;

const Footer: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: "auto",
      }}
    >
      <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
        <img
          src={MOE_COUNTER_URL}
          alt="moe counter"
          loading="lazy"
          crossOrigin="anonymous"
          style={{ height: 40, imageRendering: "pixelated" }}
        />
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ width: "100%", flexDirection: { xs: "column", sm: "row" } }}
      >
        <Box
          sx={{
            flex: 1,
            textAlign: isSmall ? "center" : "right",
            display: "flex",
            flexDirection: "column",
            alignItems: isSmall ? "center" : "flex-end",
          }}
        >
          <GlitchText prefix="Built with " glitchLength={4} />
        </Box>

        {/* Divider: only visible on larger screens */}
        {!isSmall && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 2, borderColor: "grey.400" }}
          />
        )}

        <Box
          sx={{
            flex: 1,
            textAlign: isSmall ? "center" : "left",
            display: "flex",
            flexDirection: "column",
            alignItems: isSmall ? "center" : "flex-start",
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} star-whisper9. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
