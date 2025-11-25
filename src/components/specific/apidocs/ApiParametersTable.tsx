import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import type { ApiParameter } from "../../../config/api/types";

interface ApiParametersTableProps {
  parameters: ApiParameter[];
  title?: string;
}

const ApiParametersTable: React.FC<ApiParametersTableProps> = ({
  parameters,
  title = "参数",
}) => {
  if (!parameters || parameters.length === 0) {
    return null;
  }

  // 按位置分组
  const pathParams = parameters.filter((p) => p.in === "path");
  const queryParams = parameters.filter((p) => p.in === "query");
  const headerParams = parameters.filter((p) => p.in === "header");

  const renderGroup = (params: ApiParameter[], groupTitle: string) => {
    if (params.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          {groupTitle}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>名称</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>类型</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>必填</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>描述</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {params.map((param, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontWeight: 600 }}
                    >
                      {param.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", color: "info.main" }}
                    >
                      {(param.schema as { type?: string })?.type || "any"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {param.required ? (
                      <Chip label="必填" size="small" color="error" />
                    ) : (
                      <Chip label="可选" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {param.description || "-"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {renderGroup(pathParams, "路径参数")}
      {renderGroup(queryParams, "查询参数")}
      {renderGroup(headerParams, "Header 参数")}
    </Box>
  );
};

export default ApiParametersTable;
