import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageIntroProps {
  title: ReactNode;
  description: ReactNode;
}

const PageIntro = ({ title, description }: PageIntroProps) => {
  return (
    <Box sx={{ px: 1, textAlign: "center" }}>
      <Box
        aria-hidden
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          mb: 1.75,
          color: "primary.main",
          opacity: 0.8,
        }}
      >
        <Box
          sx={{
            width: { xs: 24, sm: 36 },
            height: 2,
            borderRadius: 1,
            bgcolor: "currentColor",
          }}
        />
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "2px",
            bgcolor: "secondary.main",
            transform: "rotate(45deg)",
          }}
        />
        <Box
          sx={{
            width: { xs: 24, sm: 36 },
            height: 2,
            borderRadius: 1,
            bgcolor: "currentColor",
          }}
        />
      </Box>
      <Typography
        component="h1"
        variant="h3"
        sx={{
          mb: 1.5,
          fontSize: { xs: "2.25rem", sm: "2.75rem", md: "3rem" },
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          maxWidth: 720,
          mx: "auto",
          fontSize: { sm: "1.05rem" },
          lineHeight: 1.7,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

export default PageIntro;
