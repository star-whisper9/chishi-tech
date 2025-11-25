import React from "react";
import { Box, Divider } from "@mui/material";
import type { ApiEndpoint } from "../../../config/api/types";
import ApiEndpointHeader from "./ApiEndpointHeader";
import ApiParametersTable from "./ApiParametersTable";
import ApiRequestBodyPanel from "./ApiRequestBodyPanel";
import ApiResponsesPanel from "./ApiResponsesPanel";
import ApiErrorCodesTable from "./ApiErrorCodesTable";
import ApiCodeExamples from "./ApiCodeExamples";
import FavoriteIcon from "@mui/icons-material/Favorite";

interface ApiEndpointSectionProps {
  endpoint: ApiEndpoint;
}

const ApiEndpointSection: React.FC<ApiEndpointSectionProps> = ({
  endpoint,
}) => {
  return (
    <Box
      id={endpoint.operationId}
      sx={{
        pb: 4,
        scrollMarginTop: "80px", // 为固定 header 留出空间
      }}
    >
      <ApiEndpointHeader endpoint={endpoint} />

      <ApiParametersTable parameters={endpoint.parameters} />

      <ApiRequestBodyPanel requestBody={endpoint.requestBody} />

      <ApiResponsesPanel responses={endpoint.responses} />

      <ApiErrorCodesTable errorCodes={endpoint.errorCodes} />

      <ApiCodeExamples
        curlExample={endpoint.curlExample}
        codeExamples={endpoint.codeExamples}
        operationId={endpoint.operationId}
      />

      <Divider sx={{ mt: 3 }}>
        <FavoriteIcon color="error" />
      </Divider>
    </Box>
  );
};

export default ApiEndpointSection;
