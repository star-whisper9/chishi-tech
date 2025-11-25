import React from "react";
import { Typography, Box } from "@mui/material";
import { useGlitchText } from "../../../hooks/useGlitchText";

interface GlitchTextProps {
  prefix?: string;
  glitchLength?: number;
  variant?: "body1" | "body2" | "caption";
}

const GlitchText: React.FC<GlitchTextProps> = ({
  prefix = "Built with ",
  glitchLength = 4,
  variant = "body2",
}) => {
  const glitchText = useGlitchText(glitchLength, 70);

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "monospace",
      }}
    >
      <Typography variant={variant} component="span">
        {prefix}
      </Typography>
      <Typography
        variant={variant}
        component="span"
        sx={{
          fontFamily: "monospace",
          fontWeight: "bold",
          letterSpacing: "0.1em",
          color: "primary.main",
          textShadow: (theme) => `0 0 5px ${theme.palette.primary.main}40`,
          transition: "all 0.1s ease",
          display: "inline-block",
          minWidth: `${glitchLength * 1.1}em`,
          textAlign: "center",
        }}
      >
        {glitchText}
      </Typography>
    </Box>
  );
};

export default GlitchText;
