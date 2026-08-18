import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageIntroProps {
  title: ReactNode;
  description: ReactNode;
}

const PageIntro = ({ title, description }: PageIntroProps) => {
  return (
    <Box sx={{ px: 1, textAlign: "center" }}>
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
