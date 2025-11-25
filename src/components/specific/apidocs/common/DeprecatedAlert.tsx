import React from "react";
import { Alert, AlertTitle } from "@mui/material";

interface DeprecatedAlertProps {
  message?: string;
  solution?: string;
}

const DeprecatedAlert: React.FC<DeprecatedAlertProps> = ({
  message = "此接口已废弃",
  solution,
}) => {
  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <AlertTitle>⚠️ 已废弃</AlertTitle>
      {message}
      {solution && <div style={{ marginTop: 8 }}>💡 {solution}</div>}
    </Alert>
  );
};

export default DeprecatedAlert;
