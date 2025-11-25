import React from "react";
import { Box, Typography, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import { useApiSpecs } from "../../../hooks/useApiSpecs";
import ApiServiceHeader from "./ApiServiceHeader";
import ApiTableOfContents from "./ApiTableOfContents";
import ApiEndpointSection from "./ApiEndpointSection";

const ApiServiceDetail: React.FC = () => {
  const { service, version } = useParams<{
    service: string;
    version: string;
  }>();
  const { bundles } = useApiSpecs();

  // 查找当前服务的所有版本
  const serviceBundles = bundles.filter((b) => b.service === service);
  const versions = serviceBundles.map((b) => b.version);

  // 查找当前版本的 bundle
  const currentBundle = bundles.find(
    (b) => b.service === service && b.version === version
  );

  if (!currentBundle) {
    return (
      <Box sx={{ py: 6 }}>
        <Alert severity="error">
          未找到服务 <code>{service}</code> 的版本 <code>{version}</code>
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          请检查 URL 是否正确，或返回 <a href="/api">API 列表页</a>
        </Typography>
      </Box>
    );
  }

  const rawInfo = currentBundle.raw as {
    info?: { title?: string; description?: string };
  };
  const title = rawInfo.info?.title;
  const description = rawInfo.info?.description;

  return (
    <Box sx={{ py: 4 }}>
      <ApiServiceHeader
        service={service!}
        version={version!}
        versions={versions}
        title={title}
        description={description}
      />

      {currentBundle.endpoints.length === 0 ? (
        <Alert severity="info">此版本暂无接口端点</Alert>
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {currentBundle.endpoints.map((endpoint) => (
                <ApiEndpointSection
                  key={endpoint.operationId}
                  endpoint={endpoint}
                />
              ))}
            </Box>

            <Box
              sx={{
                width: 240,
                flexShrink: 0,
                display: { xs: "none", lg: "block" },
                position: "sticky",
                top: 100,
                alignSelf: "flex-start",
              }}
            >
              <ApiTableOfContents endpoints={currentBundle.endpoints} />
            </Box>
          </Box>
          {/* 小屏浮动按钮由 TOC 组件自己控制 */}
          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            <ApiTableOfContents endpoints={currentBundle.endpoints} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ApiServiceDetail;
