import React, { useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tabs,
  Tab,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { ApiResponse } from "../../../config/api/types";
import SchemaTree from "./common/SchemaTree";
import CodeBlock from "./common/CodeBlock";

interface ApiResponsesPanelProps {
  responses: ApiResponse[];
}

const ApiResponsesPanel: React.FC<ApiResponsesPanelProps> = ({ responses }) => {
  const [tabValues, setTabValues] = useState<Record<string, number>>({});

  if (!responses || responses.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    const code = parseInt(status);
    if (code >= 200 && code < 300) return "success";
    if (code >= 400 && code < 500) return "warning";
    if (code >= 500) return "error";
    return "default";
  };

  const handleTabChange = (responseStatus: string, newValue: number) => {
    setTabValues((prev) => ({ ...prev, [responseStatus]: newValue }));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        响应
      </Typography>

      {responses.map((response, idx) => (
        <Accordion key={idx} defaultExpanded={idx === 0} disableGutters>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ borderBottom: "1px solid", borderColor: { md: "divider" } }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={response.status}
                color={getStatusColor(response.status)}
                size="small"
                sx={{ fontWeight: 600, minWidth: 60 }}
              />
              <Typography>{response.description || "响应"}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ paddingTop: "0" }}>
            {(response.resolvedSchema || response.exampleJson) && (
              <>
                <Tabs
                  value={tabValues[response.status] || 0}
                  onChange={(_, v) => handleTabChange(response.status, v)}
                  sx={{ mb: 2 }}
                >
                  {response.resolvedSchema && <Tab label="Schema 结构" />}
                  {response.exampleJson && <Tab label="示例" />}
                </Tabs>

                {(tabValues[response.status] || 0) === 0 &&
                  response.resolvedSchema && (
                    <SchemaTree schema={response.resolvedSchema} />
                  )}

                {(tabValues[response.status] || 0) === 1 &&
                  response.exampleJson && (
                    <CodeBlock
                      code={response.exampleJson}
                      language="json"
                      title="响应示例"
                    />
                  )}
              </>
            )}

            {!response.resolvedSchema && !response.exampleJson && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ marginTop: 2 }}
              >
                无内容
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default ApiResponsesPanel;
