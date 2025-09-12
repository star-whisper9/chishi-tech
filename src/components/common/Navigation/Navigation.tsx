import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { pages } from "../../../pages";
import PageCard from "./PageCard";

const Navigation: React.FC = () => {
  return (
    <Box sx={{ py: 6 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" gutterBottom>
          功能导航
        </Typography>
        <Typography variant="h6" color="text.secondary">
          浏览当前站点的功能与示例
        </Typography>
      </Box>
      <Grid container spacing={4}>
        {pages.map((p) => (
          <Grid key={p.link} size={{ xs: 12, sm: 6, md: 4 }}>
            <PageCard page={p} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Navigation;
