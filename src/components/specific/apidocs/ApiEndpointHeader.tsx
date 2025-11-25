import React from "react";
import { Box, Typography, Stack, Chip } from "@mui/material";
import type { ApiEndpoint } from "../../../config/api/types";
import HttpMethodBadge from "./common/HttpMethodBadge";
import DeprecatedAlert from "./common/DeprecatedAlert";

interface ApiEndpointHeaderProps {
  endpoint: ApiEndpoint;
}

const ApiEndpointHeader: React.FC<ApiEndpointHeaderProps> = ({ endpoint }) => {
  // 高亮路径参数 {xxx}
  const renderPath = () => {
    const parts = endpoint.path.split(/(\{[^}]+\})/);
    return parts.map((part, idx) => {
      if (part.startsWith("{") && part.endsWith("}")) {
        return (
          <Typography
            key={idx}
            component="span"
            sx={{ color: "warning.main", fontWeight: 600 }}
          >
            {part}
          </Typography>
        );
      }
      return (
        <Typography key={idx} component="span">
          {part}
        </Typography>
      );
    });
  };

  return (
    <Box>
      {endpoint.deprecated && (
        <DeprecatedAlert message="此接口已废弃，请尽快迁移到新版本" />
      )}

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <HttpMethodBadge method={endpoint.method} size="medium" />
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontFamily: "monospace",
            flexGrow: 1,
          }}
        >
          {renderPath()}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: { md: "space-between" },
          alignItems: { md: "flex-start" },
          gap: 1,
          mt: 1,
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            borderRight: { md: "1px solid" },
            borderColor: { md: "divider" },
            pr: { md: 2 },
          }}
        >
          {endpoint.summary && (
            <Typography variant="h6" gutterBottom sx={{ mb: 0.5 }}>
              {endpoint.summary}
            </Typography>
          )}
          {endpoint.description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ whiteSpace: "pre-line" }}
            >
              {endpoint.description}
            </Typography>
          )}
        </Box>
        {endpoint.tags && endpoint.tags.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{
              minWidth: { md: 220 },
              maxWidth: { md: 300 },
            }}
          >
            {endpoint.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default ApiEndpointHeader;
