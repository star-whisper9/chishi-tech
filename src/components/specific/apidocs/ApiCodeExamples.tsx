// ApiCodeExamples.tsx
import React, { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import CodeBlock from "./common/CodeBlock";

interface ApiCodeExamplesProps {
  curlExample?: string;
  codeExamples?: {
    fetch?: string;
    axios?: string;
    python?: string;
  };
  operationId?: string; // 保留扩展需要
}

const ApiCodeExamples: React.FC<ApiCodeExamplesProps> = ({
  curlExample,
  codeExamples,
}) => {
  const [tabValue, setTabValue] = useState(0);
  if (!curlExample) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        示例代码
      </Typography>

      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="cURL" />
        <Tab label="Fetch" />
        <Tab label="Axios" />
        <Tab label="Python" />
      </Tabs>

      {tabValue === 0 && (
        <CodeBlock code={curlExample} language="bash" title="cURL" />
      )}

      {tabValue === 1 && (
        <CodeBlock
          code={codeExamples?.fetch || "// 未能生成示例代码"}
          language="javascript"
          title="JavaScript (Fetch)"
        />
      )}
      {tabValue === 2 && (
        <CodeBlock
          code={codeExamples?.axios || "// 未能生成示例代码"}
          language="javascript"
          title="JavaScript (Axios)"
        />
      )}
      {tabValue === 3 && (
        <CodeBlock
          code={codeExamples?.python || "# 未能生成示例代码"}
          language="python"
          title="Python (Requests)"
        />
      )}
    </Box>
  );
};

export default ApiCodeExamples;
