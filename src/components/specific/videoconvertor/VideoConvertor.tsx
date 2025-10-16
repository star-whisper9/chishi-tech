import React from "react";
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
  Chip,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  CloudUploadRounded,
  PlayCircleOutlineRounded,
  DownloadRounded,
  DeleteRounded,
  CloseRounded,
  WarningRounded,
} from "@mui/icons-material";
import {
  useVideoConvertor,
  type OutputFormat,
  type GifConfig,
} from "../../../hooks/useVideoConvertor";
import { CONSTS } from "../../../config/consts";
import { formatFileSize } from "../../../utils/ffmpegHelper";
import GifConfigPanel from "./GifConfigPanel";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface VideoConvertorProps {
  // 可以添加自定义属性
}

const VideoConvertor: React.FC<VideoConvertorProps> = () => {
  const {
    isLoading,
    isConverting,
    progress,
    error,
    outputFile,
    loadFFmpeg,
    convertVideo,
    cancelConversion,
    clearOutput,
    clearError,
    getPreviewUrl,
    revokePreviewUrl,
  } = useVideoConvertor();

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [outputFormat, setOutputFormat] = React.useState<OutputFormat>("mp4");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [videoDuration, setVideoDuration] = React.useState<number | null>(null);
  const [maxFileSize, setMaxFileSize] = React.useState<number>(
    CONSTS.VIDEO_CONVERTOR.MAX_FILE_SIZE_BYTES
  );
  const [showUnlockDialog, setShowUnlockDialog] = React.useState(false);
  const [gifConfig, setGifConfig] = React.useState<GifConfig>({
    fps: 10,
    width: CONSTS.VIDEO_CONVERTOR.DEFAULT_WIDTH,
  });

  const videoRef = React.useRef<HTMLVideoElement>(null);

  // 自动加载 FFmpeg
  React.useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  // 清理预览 URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        revokePreviewUrl(previewUrl);
      }
    };
  }, [previewUrl, revokePreviewUrl]);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith("video/") && !file.name.endsWith(".mkv")) {
        alert("请选择视频文件");
        return;
      }

      // 检查文件大小
      if (file.size > maxFileSize) {
        alert(
          `文件大小超过限制 (${formatFileSize(
            maxFileSize
          )})。\n当前文件大小: ${formatFileSize(
            file.size
          )}\n\n您可以在下方解除限制。`
        );
        return;
      }

      setSelectedFile(file);
      clearError();

      // 生成预览 URL
      const url = getPreviewUrl(file);
      setPreviewUrl(url);

      // 获取视频时长
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.src = url;
    }
  };

  // 处理转换
  const handleConvert = async () => {
    if (!selectedFile) {
      return;
    }
    // 根据格式传递配置
    const config = outputFormat === "gif" ? gifConfig : undefined;
    await convertVideo(selectedFile, outputFormat, config);
  };

  // 处理下载
  const handleDownload = () => {
    if (!outputFile) return;
    const a = document.createElement("a");
    a.href = outputFile.url;
    a.download = outputFile.name;
    a.click();
  };

  // 重置
  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      revokePreviewUrl(previewUrl);
      setPreviewUrl(null);
    }
    setVideoDuration(null);
    clearOutput();
    clearError();
  };

  // 解除文件大小限制
  const handleUnlockSizeLimit = () => {
    setShowUnlockDialog(true);
  };

  const confirmUnlock = () => {
    setMaxFileSize(CONSTS.VIDEO_CONVERTOR.MAX_SIZE_UNLOCKED);
    setShowUnlockDialog(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              请避免使用 32 位浏览器，有可能加载失败甚至崩溃。
              <br />
              浏览器转码处理速度慢（尤其是H.265编码），请耐心等待，大文件建议使用原生应用。
            </Typography>
          </Alert>
          {/* FFmpeg 加载状态 */}
          {isLoading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">正在加载 FFmpeg...</Typography>
              <LinearProgress sx={{ mt: 1 }} />
            </Alert>
          )}

          {/* 错误提示 */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <IconButton color="inherit" size="small" onClick={clearError}>
                  <CloseRounded fontSize="small" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* 文件大小限制设置 */}
            {maxFileSize < CONSTS.VIDEO_CONVERTOR.MAX_SIZE_UNLOCKED && (
              <Alert severity="info" sx={{ mb: 0 }}>
                <Typography variant="body2" gutterBottom>
                  当前文件大小限制: {formatFileSize(maxFileSize)}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleUnlockSizeLimit}
                  startIcon={<WarningRounded />}
                  sx={{ mt: 1 }}
                >
                  解除限制（最大{" "}
                  {formatFileSize(CONSTS.VIDEO_CONVERTOR.MAX_SIZE_UNLOCKED)}）
                </Button>
              </Alert>
            )}

            {/* 文件选择 */}
            <Box>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadRounded />}
                disabled={isLoading || isConverting}
                fullWidth
              >
                选择视频文件
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleFileSelect}
                />
              </Button>

              {selectedFile && (
                <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(selectedFile.size)}
                        {videoDuration && ` • ${videoDuration.toFixed(1)}秒`}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={handleReset}
                      disabled={isConverting}
                    >
                      <DeleteRounded />
                    </IconButton>
                  </Stack>
                </Card>
              )}
            </Box>

            {/* 视频预览 */}
            {selectedFile && previewUrl && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  视频预览
                </Typography>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 640,
                    mx: "auto",
                    bgcolor: "black",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    controls
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* 输出格式选择 */}
            {selectedFile && (
              <>
                <FormControl fullWidth>
                  <InputLabel id="output-format-label">输出格式</InputLabel>
                  <Select
                    labelId="output-format-label"
                    value={outputFormat}
                    label="输出格式"
                    onChange={(e) =>
                      setOutputFormat(e.target.value as OutputFormat)
                    }
                    disabled={isConverting}
                  >
                    <MenuItem value="mp4">MP4 (H.264)</MenuItem>
                    <MenuItem value="mov">MOV (H.264)</MenuItem>
                    <MenuItem value="mkv">MKV (H.265)</MenuItem>
                    <MenuItem value="gif">GIF (动图)</MenuItem>
                  </Select>
                </FormControl>

                {/* GIF 配置面板 */}
                {outputFormat === "gif" && (
                  <GifConfigPanel
                    config={gifConfig}
                    onChange={setGifConfig}
                    videoDuration={videoDuration || undefined}
                  />
                )}

                {/* 转换按钮 */}
                {!isConverting ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<PlayCircleOutlineRounded />}
                    onClick={handleConvert}
                    disabled={!selectedFile || isLoading || isConverting}
                    fullWidth
                  >
                    开始转换
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="large"
                      startIcon={<CloseRounded />}
                      onClick={cancelConversion}
                      fullWidth
                    >
                      取消转换
                    </Button>
                  </Stack>
                )}
              </>
            )}

            {/* 转换进度 */}
            {isConverting && progress && (
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">转换进度</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {progress.speed}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress.ratio * 100}
                />
              </Box>
            )}

            {/* 输出结果 */}
            {outputFile && (
              <>
                <Divider />
                <Alert severity="success" sx={{ mb: 0 }}>
                  <Typography variant="body2" gutterBottom>
                    转换完成！
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                    <Chip
                      label={outputFile.name}
                      size="small"
                      color="success"
                    />
                  </Stack>
                </Alert>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadRounded />}
                    onClick={handleDownload}
                    fullWidth
                  >
                    下载转换后的视频
                  </Button>
                  <Button variant="outlined" onClick={handleReset}>
                    重新转换
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* 解除限制确认对话框 */}
      <Dialog
        open={showUnlockDialog}
        onClose={() => setShowUnlockDialog(false)}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningRounded color="warning" />
            <span>解除文件大小限制</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            您即将解除文件大小限制，最大可处理{" "}
            {formatFileSize(CONSTS.VIDEO_CONVERTOR.MAX_SIZE_UNLOCKED)} 的文件。
            <br />
            <br />
            • 处理大文件将会消耗大量内存和时间
            <br />
            • 可能导致浏览器卡顿或崩溃
            <br />
            • 请确认设备硬件配置较好
            <br />
            <br />
            确定要继续吗？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUnlockDialog(false)}>取消</Button>
          <Button onClick={confirmUnlock} color="warning" variant="contained">
            确认解除限制
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoConvertor;
