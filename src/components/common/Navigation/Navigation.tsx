import React from "react";
import { Box, Grid, Stack } from "@mui/material";
import { pages } from "../../../pages";
import PageIntro from "../PageIntro";
import PageCard from "./PageCard";

const Navigation: React.FC = () => {
  return (
    <Box sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={{ xs: 3, md: 3 }}>
        <PageIntro
          title="功能导航"
          description="浏览当前站点的功能与示例"
        />
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {pages.map((p) => (
            <Grid key={p.link} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
              <PageCard page={p} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
};

export default Navigation;
