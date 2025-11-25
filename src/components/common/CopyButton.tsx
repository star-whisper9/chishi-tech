import React, { useState } from "react";
import { IconButton, Snackbar, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

interface CopyButtonProps {
  text: string;
  tooltipTitle?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  tooltipTitle = "复制",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  return (
    <>
      <Tooltip title={copied ? "已复制" : tooltipTitle}>
        <IconButton
          size="small"
          onClick={handleCopy}
          color={copied ? "success" : "default"}
        >
          {copied ? (
            <CheckIcon fontSize="small" />
          ) : (
            <ContentCopyIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="已复制到剪贴板"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default CopyButton;
