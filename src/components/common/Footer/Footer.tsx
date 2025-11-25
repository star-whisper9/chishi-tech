import React from "react";
import {
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import GlitchText from "./GlitchText";

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
