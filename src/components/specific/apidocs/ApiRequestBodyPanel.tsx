import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { ApiRequestBody } from "../../../config/api/types";
import SchemaTree from "./common/SchemaTree";
import CodeBlock from "./common/CodeBlock";

interface ApiRequestBodyPanelProps {
  requestBody?: ApiRequestBody;
}

const ApiRequestBodyPanel: React.FC<ApiRequestBodyPanelProps> = ({
  requestBody,
}) => {
  const [tabValue, setTabValue] = useState(0);

  if (!requestBody) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        请求体
        {requestBody.required && (
          <Typography component="span" color="error.main" sx={{ ml: 1 }}>
            *必填
          </Typography>
        )}
      </Typography>

      <Accordion disableGutters defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ borderBottom: "1px solid", borderColor: { md: "divider" } }}
        >
          <Typography>
            Content-Type: <code>{requestBody.mimeType}</code>
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ paddingTop: "0" }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Schema 结构" />
            <Tab label="示例" />
          </Tabs>

          {tabValue === 0 && requestBody.resolvedSchema && (
            <SchemaTree schema={requestBody.resolvedSchema} />
          )}

          {tabValue === 1 && requestBody.exampleJson && (
            <CodeBlock
              code={requestBody.exampleJson}
              language="json"
              title="示例 JSON"
            />
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ApiRequestBodyPanel;
