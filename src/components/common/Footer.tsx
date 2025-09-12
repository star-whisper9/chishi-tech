import React from "react";
import {
  Box,
  Typography,
  Divider,
  Link,
  useTheme,
  useMediaQuery,
} from "@mui/material";

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
          <Link
            href="https://beian.miit.gov.cn/"
            variant="body2"
            underline="hover"
          >
            滇ICP备2024042847号-1
          </Link>
          <Link
            href="https://beian.mps.gov.cn/#/query/webSearch?code=53011102001478"
            variant="body2"
            underline="hover"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <img
              src="/beian.png"
              alt="公安备案徽标"
              style={{
                width: 16,
                height: 16,
                verticalAlign: "middle",
              }}
            />
            <span>滇公网安备53011102001478号</span>
          </Link>
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
