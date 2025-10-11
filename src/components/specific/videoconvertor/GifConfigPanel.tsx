import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Stack,
  Alert,
} from "@mui/material";
import { CONSTS } from "../../../config/consts";
import type { GifConfig } from "../../../hooks/useVideoConvertor";

interface GifConfigPanelProps {
  config: GifConfig;
  onChange: (config: GifConfig) => void;
  videoDuration?: number; // 视频时长（秒）
}

const GifConfigPanel: React.FC<GifConfigPanelProps> = ({
  config,
  onChange,
  videoDuration,
}) => {
  const handleFpsChange = (_event: Event, value: number | number[]) => {
    onChange({ ...config, fps: value as number });
  };

  const handleWidthChange = (_event: Event, value: number | number[]) => {
    onChange({ ...config, width: value as number });
  };

  // 计算当前配置下的预估帧数
  const estimatedFrames = videoDuration
    ? Math.ceil(config.fps * videoDuration)
    : null;

  // 计算最大允许的时长
  const maxAllowedDuration = CONSTS.VIDEO_CONVERTOR.MAX_FRAMES / config.fps;

  // 是否会超出帧数限制
  const willExceedFrameLimit =
    estimatedFrames !== null &&
    estimatedFrames > CONSTS.VIDEO_CONVERTOR.MAX_FRAMES;

  // 实际转换时长
  const actualDuration = willExceedFrameLimit
    ? maxAllowedDuration
    : videoDuration;

  React.useEffect(() => {
    // 如果会超出帧数限制，自动设置最大时长
    if (willExceedFrameLimit && actualDuration) {
      onChange({ ...config, maxDuration: actualDuration });
    } else {
      // 清除最大时长限制
      const { maxDuration, ...rest } = config;
      if (maxDuration !== undefined) {
        onChange(rest as GifConfig);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [willExceedFrameLimit, actualDuration]);

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          GIF 转换设置
        </Typography>

        <Stack spacing={3}>
          {/* 帧率设置 */}
          <Box>
            <Typography variant="body2" gutterBottom>
              帧率 (FPS): {config.fps}
            </Typography>
            <Slider
              value={config.fps}
              onChange={handleFpsChange}
              min={1}
              max={CONSTS.VIDEO_CONVERTOR.MAX_FPS}
              step={1}
              marks={[
                { value: 3, label: "3" },
                { value: 10, label: "10" },
                { value: 15, label: "15" },
                { value: 24, label: "24" },
                { value: 30, label: "30" },
              ]}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              较低的帧率可以减小文件大小，但动画会不够流畅
            </Typography>
          </Box>

          {/* 宽度设置 */}
          <Box>
            <Typography variant="body2" gutterBottom>
              宽度 (px): {config.width}
            </Typography>
            <Slider
              value={config.width}
              onChange={handleWidthChange}
              min={240}
              max={CONSTS.VIDEO_CONVERTOR.MAX_WIDTH}
              step={40}
              marks={[
                { value: 360, label: "360" },
                { value: 480, label: "480" },
                { value: 720, label: "720" },
                { value: 1080, label: "1080" },
                { value: 1920, label: "1920" },
              ]}
              valueLabelDisplay="auto"
            />
            <Typography variant="caption" color="text.secondary">
              宽度越小，文件大小越小。高度会按比例自动调整
            </Typography>
          </Box>

          {/* 帧数限制提示 */}
          {estimatedFrames !== null && (
            <Alert
              severity={willExceedFrameLimit ? "warning" : "info"}
              sx={{ mt: 1 }}
            >
              <Typography variant="body2">
                预估帧数: {estimatedFrames.toLocaleString()} 帧
              </Typography>
              {willExceedFrameLimit && (
                <>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    ⚠️ 超出最大帧数限制 (
                    {CONSTS.VIDEO_CONVERTOR.MAX_FRAMES.toLocaleString()} 帧)
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    将只转换前 {maxAllowedDuration.toFixed(1)} 秒的内容
                  </Typography>
                </>
              )}
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default GifConfigPanel;
