import React from "react";
import { Chip } from "@mui/material";
import type { HttpMethod } from "../../../../config/api/types";

interface HttpMethodBadgeProps {
  method: HttpMethod;
  size?: "small" | "medium";
}

const METHOD_CONFIG: Record<
  HttpMethod,
  {
    color: "success" | "primary" | "warning" | "error" | "info" | "default";
    label: string;
  }
> = {
  get: { color: "success", label: "GET" },
  post: { color: "primary", label: "POST" },
  put: { color: "warning", label: "PUT" },
  delete: { color: "error", label: "DELETE" },
  patch: { color: "info", label: "PATCH" },
  options: { color: "default", label: "OPTIONS" },
  head: { color: "default", label: "HEAD" },
};

const HttpMethodBadge: React.FC<HttpMethodBadgeProps> = ({
  method,
  size = "small",
}) => {
  const config = METHOD_CONFIG[method] || {
    color: "default" as const,
    label: method.toUpperCase(),
  };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{
        fontWeight: 600,
        minWidth: size === "small" ? 60 : 70,
        fontFamily: "monospace",
      }}
    />
  );
};

export default HttpMethodBadge;
