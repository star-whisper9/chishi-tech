import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  CircularProgress,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import useBadVideo from "../../../hooks/badvideo/useBadVideo";
import { CONSTS } from "../../../config/consts";

const formatMB = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(0)} MB`;

const BadVideo: React.FC = () => {
  const {
    status,
    error,
    outputUrl,
    file,
    percent,
    setPercent,
    selectFile,
    start,
    cancel,
    reset,
  } = useBadVideo();

  const disabled = status === "processing";
  const minPct = CONSTS.BADVIDEO.MIN_PERCENT * 100; // 0.001%
  const maxPct = CONSTS.BADVIDEO.MAX_PERCENT * 100; // 1%

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("\u5904\u7406\u5b8c\u6210");
  const [snackSeverity, setSnackSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const percentText = useMemo(() => (percent * 100).toFixed(3), [percent]);

  // 预览 URL：使用 state 以触发渲染，且清理仅撤销本次创建的 URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    let createdUrl: string | null = null;
    if (file) {
      createdUrl = URL.createObjectURL(file);
      setPreviewUrl(createdUrl);
    } else {
      setPreviewUrl(null);
    }
    return () => {
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [file]);

  // 状态变化时提示
  useEffect(() => {
    if (status === "done") {
      setSnackMsg("处理完成，可下载结果文件");
      setSnackSeverity("success");
      setSnackOpen(true);
    } else if (status === "error") {
      setSnackMsg(error || "处理失败");
      setSnackSeverity("error");
      setSnackOpen(true);
    } else if (status === "cancelled") {
      setSnackMsg("已取消处理");
      setSnackSeverity("info");
      setSnackOpen(true);
    }
  }, [status, error]);

  return (
    <Card elevation={3}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
          >
            <Button component="label" variant="contained" disabled={disabled}>
              选择 MP4 文件
              <input
                type="file"
                hidden
                accept="video/mp4,.mp4"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  selectFile(f);
                }}
              />
            </Button>
            <Typography variant="body2" color="text.secondary">
              {file
                ? `${file.name} — ${formatMB(file.size)}`
                : `最大大小 ${formatMB(
                    CONSTS.BADVIDEO.MAX_FILE_SIZE_BYTES
                  )}，仅支持 .mp4`}
            </Typography>
          </Stack>

          {/* 百分比滑条 + 输入 */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                损坏百分比（%）
              </Typography>
              <Slider
                value={Number(percentText)}
                min={minPct}
                max={maxPct}
                step={0.005}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v.toFixed(3)}%`}
                onChange={(_e, v) => {
                  const num = Array.isArray(v) ? v[0] : v;
                  setPercent(Number(num) / 100);
                }}
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="百分比"
                  type="number"
                  size="small"
                  sx={{ width: 200 }}
                  slotProps={{
                    htmlInput: { step: 0.005, min: minPct, max: maxPct },
                  }}
                  value={percentText}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isFinite(v)) return;
                    const clamped = Math.min(maxPct, Math.max(minPct, v));
                    setPercent(clamped / 100);
                  }}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* 原视频预览 */}
          {file && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                原视频预览
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxWidth: "100%" }}>
                <video
                  controls
                  src={previewUrl ?? undefined}
                  style={{ width: "100%", borderRadius: 8 }}
                />
              </Box>
            </Paper>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={start}
              disabled={!file || disabled}
            >
              开始处理
            </Button>
            <Button
              variant="outlined"
              color="warning"
              onClick={cancel}
              disabled={status !== "processing"}
            >
              取消
            </Button>
            <Button
              variant="contained"
              color="success"
              disabled={!outputUrl || status !== "done"}
              onClick={() => {
                if (!outputUrl) return;
                const a = document.createElement("a");
                a.href = outputUrl;
                const name = file?.name ?? "output.mp4";
                a.download = name.replace(/\.mp4$/i, ".bad.mp4");
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
            >
              下载结果
            </Button>
            <Button variant="text" color="inherit" onClick={reset}>
              重置
            </Button>
          </Stack>

          {status === "processing" && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress size={40} />
            </Box>
          )}

          {error && <Typography color="error">{error}</Typography>}
        </Stack>
      </CardContent>
      <CardActions />

      {/* 页面通知 */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackSeverity}
          onClose={() => setSnackOpen(false)}
          sx={{ width: "100%" }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default BadVideo;
