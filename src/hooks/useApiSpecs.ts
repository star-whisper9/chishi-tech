import { useMemo } from "react";
import { apiSpecs } from "../generated/api/apiSpecs.generated";
import type { ApiEndpoint, ApiServiceBundle } from "../config/api/types";

interface UseApiSpecsResult {
  bundles: ApiServiceBundle[];
  allEndpoints: ApiEndpoint[];
  filterByService: (service: string) => ApiEndpoint[];
  filterByVersion: (service: string, version: string) => ApiEndpoint[];
  findByOperationId: (operationId: string) => ApiEndpoint | undefined;
}

export function useApiSpecs(): UseApiSpecsResult {
  // 由于数据是静态生成的，直接使用内存即可；后续可添加刷新逻辑。
  const { bundles, allEndpoints } = apiSpecs;

  const filterByService = useMemo(
    () => (service: string) =>
      allEndpoints.filter((e) => e.service === service),
    [allEndpoints]
  );
  const filterByVersion = useMemo(
    () => (service: string, version: string) =>
      allEndpoints.filter(
        (e) => e.service === service && e.version === version
      ),
    [allEndpoints]
  );
  const findByOperationId = useMemo(
    () => (operationId: string) =>
      allEndpoints.find((e) => e.operationId === operationId),
    [allEndpoints]
  );

  return {
    bundles,
    allEndpoints,
    filterByService,
    filterByVersion,
    findByOperationId,
  };
}
