/*
  解析 src/apispec/<service>/<version>/openapi.yaml 并生成 src/generated/api/apiSpecs.generated.ts
  功能：
   - $ref 展开（递归解析 components.schemas）
   - 示例 JSON 自动生成（基于 schema）
   - x-error-codes 错误码规范解析
   - TypeScript interface 生成（可选）
*/
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { OpenAPIV3 } from "openapi-types";
import {
  ApiEndpoint,
  ApiParameter,
  ApiRequestBody,
  ApiResponse,
  ApiServiceBundle,
  ApiSpecsGenerated,
  HttpMethod,
  ApiErrorCode,
} from "../src/config/api/types";
import { toNode, toNodeAxios, toPython } from "curlconverter";

const SPEC_ROOT = path.resolve("src/apispec");
const OUTPUT_FILE = path.resolve("src/generated/api/apiSpecs.generated.ts");

function isHttpMethod(key: string): key is HttpMethod {
  return ["get", "post", "put", "delete", "patch", "options", "head"].includes(
    key
  );
}

// ======== Schema 展开与示例生成工具 ========
type ResolvedSchema = Record<string, unknown>;

function resolveRef(
  ref: string,
  doc: OpenAPIV3.Document
): OpenAPIV3.SchemaObject | null {
  // 仅支持本地引用 #/components/schemas/XXX
  const match = ref.match(/^#\/components\/schemas\/(\w+)$/);
  if (!match) return null;
  const schemaName = match[1];
  return (
    (doc.components?.schemas?.[schemaName] as OpenAPIV3.SchemaObject) || null
  );
}

function isArraySchema(
  schema: OpenAPIV3.SchemaObject
): schema is OpenAPIV3.ArraySchemaObject {
  return schema.type === "array";
}

function resolveSchema(
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined,
  doc: OpenAPIV3.Document,
  depth = 0
): ResolvedSchema | null {
  if (!schema || depth > 10) return null; // 防止循环引用
  if ("$ref" in schema) {
    const resolved = resolveRef(schema.$ref, doc);
    if (!resolved) return null;
    return resolveSchema(resolved, doc, depth + 1);
  }
  // 简化处理：仅保留关键字段
  const result: ResolvedSchema = { type: schema.type };
  if (schema.properties) {
    result.properties = {};
    for (const key in schema.properties) {
      (result.properties as Record<string, unknown>)[key] = resolveSchema(
        schema.properties[key],
        doc,
        depth + 1
      );
    }
  }
  if (isArraySchema(schema) && schema.items) {
    result.items = resolveSchema(schema.items, doc, depth + 1);
  }
  if (schema.enum) result.enum = schema.enum;
  if (schema.required) result.required = schema.required;
  if (schema.description) result.description = schema.description;
  return result;
}

function generateExample(
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined,
  doc: OpenAPIV3.Document,
  depth = 0
): unknown {
  if (!schema || depth > 10) return null;
  if ("$ref" in schema) {
    const resolved = resolveRef(schema.$ref, doc);
    if (!resolved) return null;
    return generateExample(resolved, doc, depth + 1);
  }
  // 优先使用 example 字段
  const schemaWithExample = schema as OpenAPIV3.SchemaObject & {
    example?: unknown;
  };
  if (schemaWithExample.example !== undefined) return schemaWithExample.example;

  const type = schema.type;
  if (type === "object" && schema.properties) {
    const obj: Record<string, unknown> = {};
    for (const key in schema.properties) {
      obj[key] = generateExample(schema.properties[key], doc, depth + 1);
    }
    return obj;
  }
  if (isArraySchema(schema) && schema.items) {
    return [generateExample(schema.items, doc, depth + 1)];
  }
  if (type === "string") return schema.enum?.[0] || "string";
  if (type === "integer" || type === "number") return 0;
  if (type === "boolean") return false;
  return null;
}

// ======== 错误码解析 ========
interface XErrorCode {
  code?: string;
  httpStatus?: number;
  message?: string;
  solution?: string;
}

function extractErrorCodes(
  operation: OpenAPIV3.OperationObject
): ApiErrorCode[] {
  const codes: ApiErrorCode[] = [];
  const operationWithExtensions = operation as OpenAPIV3.OperationObject & {
    "x-error-codes"?: XErrorCode[];
  };
  const xErrorCodes = operationWithExtensions["x-error-codes"];
  if (Array.isArray(xErrorCodes)) {
    for (const ec of xErrorCodes) {
      codes.push({
        code: ec.code || "UNKNOWN",
        httpStatus: ec.httpStatus,
        message: ec.message || "",
        solution: ec.solution,
      });
    }
  }
  return codes;
}

function loadAllSpecs(): ApiServiceBundle[] {
  const bundles: ApiServiceBundle[] = [];
  const services = fs
    .readdirSync(SPEC_ROOT)
    .filter((d) => fs.statSync(path.join(SPEC_ROOT, d)).isDirectory());
  for (const service of services) {
    const serviceDir = path.join(SPEC_ROOT, service);
    const versions = fs
      .readdirSync(serviceDir)
      .filter((d) => fs.statSync(path.join(serviceDir, d)).isDirectory());
    for (const version of versions) {
      const specPath = path.join(serviceDir, version, "openapi.yaml");
      if (!fs.existsSync(specPath)) continue;
      const rawDoc = yaml.load(
        fs.readFileSync(specPath, "utf-8")
      ) as OpenAPIV3.Document;
      const endpoints: ApiEndpoint[] = extractEndpoints(
        service,
        version,
        rawDoc
      );
      bundles.push({
        service,
        version,
        raw: rawDoc as unknown as Record<string, unknown>,
        endpoints,
      });
    }
  }
  return bundles;
}

function extractEndpoints(
  service: string,
  version: string,
  doc: OpenAPIV3.Document
): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];
  const baseUrl = doc.servers?.[0]?.url ?? "https://api.example.com";
  for (const rawPath in doc.paths) {
    const pathItem = doc.paths[rawPath];
    if (!pathItem) continue;
    for (const key in pathItem) {
      if (!isHttpMethod(key)) continue;
      const op = pathItem[key];
      if (!op) continue;
      const operationId =
        op.operationId || `${key}_${rawPath.replace(/\W+/g, "_")}`;
      const parameters: ApiParameter[] = (op.parameters || [])
        .filter(Boolean)
        .map((p) => {
          if ("$ref" in p) {
            return {
              name: p.$ref,
              in: "query",
              required: false,
            }; // 简化处理 $ref 参数
          }
          return {
            name: p.name,
            in: p.in as "path" | "query" | "header",
            required: !!p.required,
            description: p.description,
            schema: p.schema,
          };
        });
      // 合并 pathItem 级别 parameters （OpenAPI 允许）
      if (Array.isArray(pathItem.parameters)) {
        for (const p of pathItem.parameters) {
          if ("$ref" in p) continue; // 简化略过
          if (!parameters.find((pp) => pp.name === p.name && pp.in === p.in)) {
            parameters.push({
              name: p.name,
              in: p.in as "path" | "query" | "header",
              required: !!p.required,
              description: p.description,
              schema: p.schema,
            });
          }
        }
      }
      let requestBody: ApiRequestBody | undefined;
      if (op.requestBody && !("$ref" in op.requestBody)) {
        const rb = op.requestBody;
        const content = rb.content || {};
        const json = content["application/json"];
        if (json) {
          const resolvedSchema = resolveSchema(json.schema, doc);
          const exampleJson = json.schema
            ? JSON.stringify(generateExample(json.schema, doc), null, 2)
            : undefined;
          requestBody = {
            mimeType: "application/json",
            schema: json.schema,
            resolvedSchema: resolvedSchema || undefined,
            exampleJson,
            required: rb.required,
          };
        }
      }
      const responses: ApiResponse[] = [];
      for (const status in op.responses) {
        const resp = op.responses[status];
        if (!resp) continue;
        if ("$ref" in resp) {
          responses.push({ status, description: resp.$ref });
          continue;
        }
        let schema:
          | OpenAPIV3.SchemaObject
          | OpenAPIV3.ReferenceObject
          | undefined;
        const content = resp.content;
        if (content) {
          const json = content["application/json"];
          if (json) schema = json.schema;
        }
        // 展开 schema 与生成示例
        const resolvedSchema = resolveSchema(schema, doc);
        const exampleJson = schema
          ? JSON.stringify(generateExample(schema, doc), null, 2)
          : undefined;
        responses.push({
          status,
          description: resp.description,
          schema,
          resolvedSchema: resolvedSchema || undefined,
          exampleJson,
        });
      }
      // 解析错误码
      const errorCodes = extractErrorCodes(op);

      const searchTextParts = [
        operationId,
        rawPath,
        op.summary,
        op.description,
        ...(op.tags || []),
      ].filter(Boolean);
      const curlExample = buildCurlExample(
        baseUrl,
        key,
        rawPath,
        parameters,
        requestBody,
        doc
      );
      let codeExamples: ApiEndpoint["codeExamples"] | undefined;
      if (curlExample) {
        try {
          codeExamples = {
            fetch: toNode(curlExample),
            axios: toNodeAxios(curlExample),
            python: toPython(curlExample),
          };
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // 保留空，避免阻断生成流程
          codeExamples = undefined;
        }
      }
      endpoints.push({
        service,
        version,
        method: key,
        path: rawPath,
        operationId,
        summary: op.summary,
        description: op.description,
        tags: op.tags,
        deprecated: op.deprecated === true,
        parameters,
        requestBody,
        responses,
        errorCodes: errorCodes.length > 0 ? errorCodes : undefined,
        searchText: searchTextParts.join("\n"),
        curlExample,
        codeExamples,
      });
    }
  }
  return endpoints;
}

function buildCurlExample(
  baseUrl: string,
  method: string,
  rawPath: string,
  parameters: ApiParameter[],
  requestBody?: ApiRequestBody,
  doc?: OpenAPIV3.Document
): string {
  // 简单示例：替换 {param} 为 <param>
  const urlPath = rawPath.replace(/\{(\w+)\}/g, "<$1>");
  const queryParams = parameters.filter((p) => p.in === "query");
  let queryString = "";
  if (queryParams.length) {
    const q = queryParams.map((p) => `${p.name}=<${p.name}>`).join("&");
    queryString = `?${q}`;
  }
  const url = `${baseUrl.replace(/\/$/, "")}${urlPath}${queryString}`;
  let cmd = `curl -X ${method.toUpperCase()} '${url}' -H 'Accept: application/json'`;
  if (requestBody?.schema && doc) {
    const example = generateExample(requestBody.schema, doc);
    const bodyJson = example ? JSON.stringify(example) : "{}";
    cmd += ` -H 'Content-Type: application/json' -d '${bodyJson}'`;
  }
  return cmd;
}

function emitFile(specs: ApiSpecsGenerated) {
  const header = `// 此文件由 generateApiSpecs.ts 自动生成，请勿手动修改。\n`;
  const body = `import type { ApiSpecsGenerated } from '../../config/api/types';\n\nexport const apiSpecs: ApiSpecsGenerated = ${JSON.stringify(
    specs,
    null,
    2
  )};\n`;
  fs.writeFileSync(OUTPUT_FILE, header + body, "utf-8");
}

function main() {
  const bundles = loadAllSpecs();
  const allEndpoints = bundles.flatMap((b) => b.endpoints);
  emitFile({ bundles, allEndpoints });
  console.log(
    `✅ 生成完成：${bundles.length} 个服务包，${allEndpoints.length} 个端点`
  );
}

// ES module 直接执行
main();
