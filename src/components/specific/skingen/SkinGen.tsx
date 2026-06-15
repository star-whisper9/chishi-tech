import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Link,
  Alert,
} from "@mui/material";
import {
  AutoAwesomeRounded,
  DownloadRounded,
  RefreshRounded,
  HelpOutlineRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import SkinGenHistory from "./SkinGenHistory";
import SkinGenHelp from "./SkinGenHelp";
import SkinViewer3D from "./SkinViewer3D";
import type { SkinGenHistoryItem } from "./SkinGenHistory";
import processedPng from "../../../assets/processed.png";

/* ============================================================
 * 功能已下线 - 以下为固定展示数据
 * ============================================================ */

const FIXED_PROMPT =
  "plana (blue archive), blue archive, white hair, red eyes, ahoge, halo, red halo, mechanical halo, black dress, red tie, white shirt, black skirt, long sleeves, pale skin";

const FIXED_INVITE_CODE = "STARDUST";

const RESULT_IMAGE_URL = processedPng;

const FIXED_CREATED_AT = Math.floor(Date.now() / 1000) - 300;
const FIXED_FINISHED_AT = Math.floor(Date.now() / 1000) - 120;

const FIXED_HISTORY: SkinGenHistoryItem[] = [
  {
    taskId: "demo-task-001",
    prompt: FIXED_PROMPT,
    status: "done",
    createdAt: FIXED_CREATED_AT,
    finishedAt: FIXED_FINISHED_AT,
    imageBase64: null,
  },
];

const formatElapsed = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m} 分 ${s} 秒`;
  return `${m} 分 ${s} 秒`;
};

/* ============================================================
 * 组件
 * ============================================================ */

const SkinGen: React.FC = () => {
  const [openHelp, setOpenHelp] = useState(false);
  const elapsed = Math.max(0, FIXED_FINISHED_AT - FIXED_CREATED_AT);

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      {/* 顶部飘带 - 功能下线提示 */}
      <Box
        sx={{ display: "flex", justifyContent: "center", my: 2, width: "100%" }}
      >
        <Alert
          severity="warning"
          variant="standard"
          icon={<WarningAmberRounded fontSize="inherit" />}
          sx={{
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            px: 3,
            py: 1,
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: 700, letterSpacing: 1 }}
            >
              功能已下线
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              本页留作归档展示，您可参见
              <Link
                href="https://blog.f1a.me/posts/generate-mc-skin-nai/"
                target="_blank"
                color="inherit"
                sx={{ ml: 0.5, fontWeight: 500, textDecoration: "underline" }}
              >
                教学博客
              </Link>
              。
            </Typography>
          </Box>
        </Alert>
      </Box>

      {/* 主体：左右分离布局 */}
      <Stack direction="row" spacing={3} sx={{ alignItems: "flex-start" }}>
        {/* 左侧：历史 */}
        <Box sx={{ width: "40%", flexShrink: 0 }}>
          <SkinGenHistory
            history={FIXED_HISTORY}
            onDelete={() => {}}
            onView={() => {}}
          />
        </Box>

        {/* 右侧：主内容 */}
        <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
          {/* 输入卡片 */}
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6">需要帮助?</Typography>
                  <Tooltip title="查看帮助">
                    <IconButton size="small" onClick={() => setOpenHelp(true)}>
                      <HelpOutlineRounded />
                    </IconButton>
                  </Tooltip>
                </Stack>

                <TextField
                  label="提示词"
                  multiline
                  minRows={2}
                  maxRows={4}
                  value={FIXED_PROMPT}
                  disabled
                />

                <TextField
                  label="邀请码"
                  value={FIXED_INVITE_CODE}
                  disabled
                  size="small"
                />

                <Button
                  variant="contained"
                  startIcon={<AutoAwesomeRounded />}
                  disabled
                  sx={{ flex: 1 }}
                >
                  生成
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* 结果卡片（无覆盖层，保留"运行效果"展示） */}
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6" color="success.main">
                  生成完成
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      fontSize: "0.7em",
                      fontWeight: 400,
                      color: "text.secondary",
                    }}
                  >
                    (耗时 {formatElapsed(elapsed)})
                  </Box>
                </Typography>

                {/* 3D 预览 */}
                <SkinViewer3D skinUrl={RESULT_IMAGE_URL} />

                {/* 像素化缩略图 */}
                <Box
                  sx={{
                    imageRendering: "pixelated",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1,
                    bgcolor: "background.default",
                    mt: 1,
                  }}
                >
                  {RESULT_IMAGE_URL ? (
                    <img
                      src={RESULT_IMAGE_URL}
                      alt="生成的皮肤"
                      style={{
                        width: 128,
                        height: 128,
                        imageRendering: "pixelated",
                        display: "block",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 128,
                        height: 128,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "grey.200",
                      }}
                    >
                      <Typography variant="caption" color="grey.500">
                        无图片
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadRounded />}
                    disabled
                  >
                    下载 PNG
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshRounded />}
                    disabled
                  >
                    重新生成
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <SkinGenHelp open={openHelp} onClose={() => setOpenHelp(false)} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SkinGen;
