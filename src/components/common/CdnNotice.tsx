import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Typography,
} from "@mui/material";

const STORAGE_KEY = "cdn-notice-dismissed";

const CdnNotice: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        Tips
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <Typography variant="body1" gutterBottom>
            本站部分功能依赖 jsDelivr CDN 加载运行时资源（FFmpeg、ONNX Runtime
            等）。
          </Typography>
          <Alert severity="warning" sx={{ mt: 2, mb: 1 }}>
            中国大陆部分运营商（尤其是移动网络）可能无法正常访问 jsDelivr
            CDN，导致相关功能加载失败。
          </Alert>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            如果遇到功能无法加载的情况，建议使用代理访问本站。
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          我知道了
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CdnNotice;
