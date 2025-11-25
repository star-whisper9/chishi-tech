// 基础类型定义，供生成脚本与运行时消费
import type { OpenAPIV3 } from "openapi-types";

export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "options"
  | "head";

export interface ApiParameter {
  name: string;
  in: "path" | "query" | "header";
  required: boolean;
  description?: string;
  schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
}

export interface ApiResponse {
  status: string; // '200', '404' 等
  description?: string;
  schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  resolvedSchema?: Record<string, unknown>; // 展开后的完整 schema（无 $ref）
  exampleJson?: string; // 自动生成的示例 JSON 字符串
}

export interface ApiRequestBody {
  mimeType: string; // application/json 等
  schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  resolvedSchema?: Record<string, unknown>; // 展开后的完整 schema
  exampleJson?: string; // 自动生成的示例 JSON 字符串
  required?: boolean;
}

export interface ApiErrorCode {
  code: string; // 业务错误码，例如 VIDEO_NOT_FOUND
  httpStatus?: number; // 关联的 HTTP 状态码
  message: string; // 错误描述
  solution?: string; // 解决方案提示（可选）
}

export interface ApiEndpoint {
  service: string;
  version: string;
  method: HttpMethod;
  path: string;
  operationId: string;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  parameters: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: ApiResponse[];
  errorCodes?: ApiErrorCode[]; // 自定义业务错误码（从 x-error-codes 解析）
  searchText: string; // 预留给 Pagefind 整页渲染时注入内容
  curlExample?: string; // 构建期生成的简单 curl 示例
  codeExamples?: {
    fetch?: string; // Node fetch 风格（curlconverter toNode）
    axios?: string; // Axios 版本（curlconverter toNodeAxios）
    python?: string; // Python requests 示例（curlconverter toPython）
  }; // 构建期生成的多语言调用示例
}

export interface ApiServiceBundle {
  service: string;
  version: string;
  raw: Record<string, unknown>; // 原始解析后的 OpenAPI 文档（允许扩展字段）
  endpoints: ApiEndpoint[];
  schemas?: Record<string, OpenAPIV3.SchemaObject>; // 展开后的 components.schemas
}

export interface ApiSpecsGenerated {
  bundles: ApiServiceBundle[];
  allEndpoints: ApiEndpoint[];
  generatedInterfaces?: string; // 可选：生成的 TS interface 定义字符串
}
