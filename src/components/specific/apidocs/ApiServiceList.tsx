import React from "react";
import { Box, Typography } from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import { useApiSpecs } from "../../../hooks/useApiSpecs";
import ApiServiceCard from "./ApiServiceCard.tsx";

const ApiServiceList: React.FC = () => {
  const { bundles } = useApiSpecs();

  // 按服务分组
  const serviceMap = new Map<
    string,
    { versions: string[]; endpointCount: number }
  >();
  bundles.forEach((bundle) => {
    const existing = serviceMap.get(bundle.service);
    if (existing) {
      existing.versions.push(bundle.version);
      existing.endpointCount += bundle.endpoints.length;
    } else {
      serviceMap.set(bundle.service, {
        versions: [bundle.version],
        endpointCount: bundle.endpoints.length,
      });
    }
  });

  if (serviceMap.size === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          暂无 API 服务
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          请在 src/apispec/ 目录下添加 OpenAPI 规范文件
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" gutterBottom>
          API 服务
        </Typography>
        <Typography variant="h6" color="text.secondary">
          浏览所有可用的 HTTP API 文档
        </Typography>
      </Box>
      <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
        {Array.from(serviceMap.entries()).map(([service, data]) => (
          <ApiServiceCard
            key={service}
            service={service}
            versions={data.versions}
            endpointCount={data.endpointCount}
            info={bundles.find((b) => b.service === service)?.raw.info}
          />
        ))}
      </Masonry>
    </Box>
  );
};

export default ApiServiceList;
