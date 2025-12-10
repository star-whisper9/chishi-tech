import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Divider,
  Paper,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import {
  CloudUploadRounded,
  ImageRounded,
  CloseRounded,
  DownloadRounded,
  DeleteRounded,
  MemoryRounded,
  SpeedRounded,
  ScienceRounded,
  HelpOutlineRounded,
  DataUsageRounded,
  TimerRounded,
  CompareArrowsRounded,
} from "@mui/icons-material";
import { useLocalUpscayl } from "../../../hooks/useLocalUpscayl";
import { CONSTS } from "../../../config/consts";
import ImageCompareSlider from "./ImageCompareSlider";

const LocalUpscaylPanel: React.FC = () => {
  const {
    loadModel,
    upscale,
    clearResult,
    cancel,
    modelLoading,
    processing,
    progress,
    error,
    resultUrl,
    currentModelPath,
    executionProvider,
    availableModels,
    durationMs,
  } = useLocalUpscayl();

  const [selectedModelPath, setSelectedModelPath] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetScale, setTargetScale] = useState<number>(4);
  const [openHelp, setOpenHelp] = useState(false);

  useEffect(() => {
    if (availableModels.length > 0 && !selectedModelPath) {
      setSelectedModelPath(availableModels[0].path);
    }
  }, [availableModels, selectedModelPath]);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    clearResult();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const handleLoadModel = () => {
    if (selectedModelPath) {
      loadModel(selectedModelPath);
    }
  };

  const handleUpscale = () => {
    if (selectedFile) {
      upscale(selectedFile, targetScale);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      link.download = `upscaled_${selectedFile?.name || "image.png"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isModelLoaded = currentModelPath === selectedModelPath;

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6">本地模型配置</Typography>
            <Tooltip title="查看帮助与说明">
              <IconButton size="small" onClick={() => setOpenHelp(true)}>
                <HelpOutlineRounded />
              </IconButton>
            </Tooltip>
          </Stack>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <FormControl fullWidth disabled={modelLoading || processing}>
                <InputLabel>选择模型</InputLabel>
                <Select
                  value={selectedModelPath}
                  label="选择模型"
                  onChange={(e) => setSelectedModelPath(e.target.value)}
                >
                  {availableModels.map((model) => (
                    <MenuItem key={model.path} value={model.path}>
                      <Box>
                        <Typography variant="body2">{model.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {model.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                fullWidth
                variant={isModelLoaded ? "outlined" : "contained"}
                color={isModelLoaded ? "success" : "primary"}
                onClick={handleLoadModel}
                disabled={!selectedModelPath || modelLoading || processing}
                startIcon={
                  modelLoading ? (
                    <SpeedRounded />
                  ) : isModelLoaded ? (
                    <MemoryRounded />
                  ) : (
                    <DownloadRounded />
                  )
                }
              >
                {modelLoading
                  ? "加载中..."
                  : isModelLoaded
                  ? "模型已加载"
                  : "加载模型(约1-2分钟)"}
              </Button>
            </Grid>
          </Grid>

          {isModelLoaded && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" icon={<ScienceRounded />}>
                当前运行环境:{" "}
                <strong>
                  {executionProvider === "webgpu"
                    ? "WebGPU (GPU加速)"
                    : "WASM (CPU/通用)"}
                </strong>
                {executionProvider === "wasm" &&
                  " - WebGPU 不可用或加载失败，已回退到 WASM 模式，速度可能较慢。"}
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">选择图片</Typography>

            {!selectedFile && (
              <Paper
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                sx={{
                  p: 4,
                  border: "2px dashed",
                  borderColor: "divider",
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept={CONSTS.UPSCAYL.SUPPORTED_EXTENSIONS.join(",")}
                  onChange={handleFileInputChange}
                  disabled={processing}
                />
                <CloudUploadRounded
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="body1" gutterBottom>
                  拖拽图片到此处，或点击选择文件
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  支持格式: {CONSTS.UPSCAYL.SUPPORTED_EXTENSIONS.join(", ")}
                </Typography>
              </Paper>
            )}

            {selectedFile && (
              <Box>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <ImageRounded color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">{selectedFile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleFileSelect(null)}
                    disabled={processing}
                  >
                    <CloseRounded />
                  </IconButton>
                </Stack>

                {previewUrl && !resultUrl && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    <img
                      src={previewUrl}
                      alt="预览"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 400,
                        objectFit: "contain",
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <FormControl fullWidth disabled={processing}>
                    <InputLabel>目标倍率</InputLabel>
                    <Select
                      label="目标倍率"
                      value={targetScale}
                      onChange={(e) => setTargetScale(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 16].map((s) => (
                        <MenuItem key={s} value={s}>{`${s}x`}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {targetScale === 16 && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      16x 将执行两次 4x 推理，耗时较长且占用内存更高。
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CloudUploadRounded />}
                    onClick={handleUpscale}
                    disabled={!isModelLoaded || processing || !selectedFile}
                  >
                    {processing ? "处理中..." : `开始放大 (${targetScale}x)`}
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}

      {processing && (
        <Card>
          <CardContent>
            <Typography variant="body2" gutterBottom>
              正在处理...
            </Typography>
            <LinearProgress
              variant={progress > 0 ? "determinate" : "indeterminate"}
              value={progress}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <Typography variant="caption" color="text.secondary">
                {progress.toFixed(1)}%
              </Typography>
              <Button size="small" onClick={cancel} disabled={!processing}>
                取消
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {resultUrl && previewUrl && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" color="success.main">
                放大完成！
              </Typography>
              {durationMs != null && (
                <Typography variant="body2" color="text.secondary">
                  用时：{durationMs.toFixed(0)} ms
                </Typography>
              )}
              <ImageCompareSlider
                originalUrl={previewUrl}
                upscaledUrl={resultUrl}
                zoomAmount={100}
              />
              <Divider />
              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<DownloadRounded />}
                  onClick={handleDownload}
                >
                  下载结果
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DeleteRounded />}
                  onClick={clearResult}
                >
                  清除
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={openHelp}
        onClose={() => setOpenHelp(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>本地模型使用说明</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <DataUsageRounded fontSize="small" color="primary" />{" "}
                模型加载流量
              </Typography>
              <Typography variant="body2" color="text.secondary">
                首次加载模型需要下载模型文件和 WASM 运行时：
              </Typography>
              <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    RealESRGAN x4 Plus: 约 73MB
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    RealESRGAN x4 Plus Anime 6B: 约 25MB
                  </Typography>
                </li>
              </ul>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TimerRounded fontSize="small" color="primary" /> 耗时说明
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>加载耗时：</strong> 取决于网络状况，通常需要 1
                分钟左右。
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>处理耗时：</strong> 1000x1000 像素图像进行 4x
                放大，在主流硬件上约需 30 秒。
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <ScienceRounded fontSize="small" color="primary" /> WebGPU 支持
              </Typography>
              <Typography variant="body2" color="text.secondary">
                推荐使用支持 WebGPU 的浏览器（如 Chrome 113+）以获得最佳性能。
                如果不支持，将回退到 WASM 模式，速度会显著变慢。
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CompareArrowsRounded fontSize="small" color="primary" />{" "}
                倍率与性能
              </Typography>
              <Typography variant="body2" color="text.secondary">
                所有倍率均基于 4x 模型推理：
              </Typography>
              <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    1x - 3x: 通过 4x 推理后降采样实现。
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" color="text.secondary">
                    16x: 执行两次 4x 推理。
                  </Typography>
                </li>
              </ul>
              <Alert severity="warning" sx={{ mt: 1 }}>
                <strong>注意：</strong> 16x
                放大非常缓慢，极易导致浏览器卡顿或超时。仅推荐用于非常小的图片测试。
              </Alert>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHelp(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default LocalUpscaylPanel;
