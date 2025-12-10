import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  TextField,
  IconButton,
  Chip,
  Paper,
  Divider,
  Grid,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  CloudUploadRounded,
  ImageRounded,
  DownloadRounded,
  DeleteRounded,
  VerifiedUserRounded,
  CloseRounded,
  HourglassEmptyRounded,
  LockRounded,
} from "@mui/icons-material";
import { useUpscayl } from "../../../hooks/useUpscayl";
import { CONSTS } from "../../../config/consts";
import ImageCompareSlider from "./ImageCompareSlider";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UpscaylProps {}

const Upscayl: React.FC<UpscaylProps> = () => {
  const {
    status,
    isLoading,
    progress,
    error,
    apiKey,
    models,
    selectedModel,
    scale,
    selectedFile,
    previewUrl,
    resultUrl,
    setApiKey,
    setSelectedModel,
    setScale,
    fetchModels,
    handleFileSelect,
    uploadAndUpscale,
    cancelUpscale,
    clearResult,
    clearError,
    downloadResult,
  } = useUpscayl();

  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // 监听模型列表变化，如果有模型则认为验证成功
  useEffect(() => {
    if (models.length > 0) {
      setIsVerified(true);
    }
  }, [models]);

  // 手动验证 API Key
  const handleVerifyKey = async () => {
    if (!apiKey) {
      return;
    }
    setIsVerifying(true);
    await fetchModels();
    setIsVerifying(false);
  };

  // 处理文件拖拽
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

  // 处理文件输入
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  // 获取状态描述
  const getStatusMessage = () => {
    switch (status) {
      case "uploading":
        return "正在上传...";
      case "queued":
        return `排队中 (位置: ${progress ?? "未知"})`;
      case "processing":
        return "正在处理...";
      case "success":
        return "放大完成！";
      case "failure":
        return "处理失败";
      default:
        return "";
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <Stack spacing={3}>
        {/* API 配置和放大选项 - 两栏布局 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              配置选项
            </Typography>
            <Grid container spacing={3}>
              {/* 左栏：API 配置 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    API 配置
                  </Typography>
                  <TextField
                    fullWidth
                    label="API Key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="请输入您的 API Key"
                    helperText="所有请求都需要提供有效的 API Key"
                    disabled={isLoading}
                  />
                  <Button
                    fullWidth
                    variant={isVerified ? "outlined" : "contained"}
                    color={isVerified ? "success" : "primary"}
                    startIcon={
                      isVerifying ? (
                        <CircularProgress size={20} />
                      ) : isVerified ? (
                        <VerifiedUserRounded />
                      ) : (
                        <LockRounded />
                      )
                    }
                    onClick={handleVerifyKey}
                    disabled={!apiKey || isLoading || isVerifying}
                  >
                    {isVerifying
                      ? "验证中..."
                      : isVerified
                      ? "已验证"
                      : "验证 API Key"}
                  </Button>
                </Stack>
              </Grid>

              {/* 右栏：放大选项 */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    放大选项
                  </Typography>
                  <FormControl fullWidth disabled={isLoading}>
                    <InputLabel>模型</InputLabel>
                    <Select
                      value={selectedModel}
                      label="模型"
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      {models.length > 0 ? (
                        models.map((model) => (
                          <MenuItem key={model.req_name} value={model.req_name}>
                            <Box>
                              <Typography variant="body2">
                                {model.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {model.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value={CONSTS.UPSCAYL.DEFAULT_MODEL}>
                          {CONSTS.UPSCAYL.DEFAULT_MODEL}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth disabled={isLoading}>
                    <InputLabel>放大倍数</InputLabel>
                    <Select
                      value={scale}
                      label="放大倍数"
                      onChange={(e) => setScale(Number(e.target.value))}
                    >
                      {CONSTS.UPSCAYL.SCALE_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}x
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 文件上传区域 */}
        <Card sx={{ position: "relative" }}>
          {/* 未验证遮罩层 */}
          {!isVerified && (
            <Backdrop
              open
              sx={{
                position: "absolute",
                zIndex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(4px)",
              }}
            >
              <Stack spacing={2} alignItems="center">
                <LockRounded sx={{ fontSize: 48, color: "white" }} />
                <Typography variant="h6" color="white">
                  请先验证 API Key
                </Typography>
                <Typography variant="body2" color="white" textAlign="center">
                  输入有效的 API Key 并点击验证按钮
                </Typography>
              </Stack>
            </Backdrop>
          )}

          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">选择图片</Typography>

              {/* 拖拽上传区域 */}
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
                    disabled={isLoading || !isVerified}
                  />
                  <CloudUploadRounded
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="body1" gutterBottom>
                    拖拽图片到此处，或点击选择文件
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    支持格式: {CONSTS.UPSCAYL.SUPPORTED_EXTENSIONS.join(", ")}
                    <br />
                    最大文件大小:{" "}
                    {formatFileSize(CONSTS.UPSCAYL.MAX_FILE_SIZE_BYTES)}
                  </Typography>
                </Paper>
              )}

              {/* 文件预览 */}
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
                      <Typography variant="body2">
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(selectedFile.size)}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleFileSelect(null)}
                      disabled={isLoading}
                    >
                      <CloseRounded />
                    </IconButton>
                  </Stack>

                  {previewUrl && status !== "success" && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 2,
                      }}
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

                  <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CloudUploadRounded />}
                      onClick={uploadAndUpscale}
                      disabled={isLoading || !selectedFile || !isVerified}
                    >
                      开始放大
                    </Button>
                    {isLoading && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={cancelUpscale}
                      >
                        取消
                      </Button>
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* 进度显示 */}
        {isLoading && (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <HourglassEmptyRounded color="primary" />
                    <Typography variant="body1">
                      {getStatusMessage()}
                    </Typography>
                  </Stack>
                  {status === "queued" && progress !== null && (
                    <Chip label={`队列位置: ${progress}`} color="primary" />
                  )}
                </Stack>
                <LinearProgress />
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* 结果显示 - 使用滑动对比组件 */}
        {status === "success" && resultUrl && previewUrl && (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" color="success.main">
                  放大完成！
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  拖动滑块对比原图和放大后的效果
                </Typography>
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
                    onClick={downloadResult}
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
      </Stack>
    </Box>
  );
};

export default Upscayl;
