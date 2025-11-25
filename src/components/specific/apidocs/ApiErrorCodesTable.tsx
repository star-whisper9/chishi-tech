import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import type { ApiErrorCode } from "../../../config/api/types";

interface ApiErrorCodesTableProps {
  errorCodes?: ApiErrorCode[];
}

const ApiErrorCodesTable: React.FC<ApiErrorCodesTableProps> = ({
  errorCodes,
}) => {
  if (!errorCodes || errorCodes.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        业务错误码
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>错误码</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>HTTP 状态</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>描述</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>解决方案</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errorCodes.map((error, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: "error.main",
                    }}
                  >
                    {error.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  {error.httpStatus && (
                    <Chip
                      label={error.httpStatus}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{error.message}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {error.solution || "-"}
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

export default ApiErrorCodesTable;
