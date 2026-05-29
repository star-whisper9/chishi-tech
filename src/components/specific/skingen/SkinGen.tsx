import React, { useEffect, useCallback, useReducer, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Stack,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AutoAwesomeRounded,
  DownloadRounded,
  RefreshRounded,
  HourglassEmptyRounded,
  TimerRounded,
  HelpOutlineRounded,
} from "@mui/icons-material";
import { useSkinGen } from "../../../hooks/useSkinGen";
import { CONSTS } from "../../../config/consts";
import SkinViewer3D from "./SkinViewer3D";
import SkinGenHelp from "./SkinGenHelp";
import SkinGenHistory from "./SkinGenHistory";

const formatWaitTime = (aheadCount: number): string => {
  const totalMs = (aheadCount + 1) * CONSTS.SKIN_GEN.ESTIMATED_GENERATE_MS;
  const minutes = Math.ceil(totalMs / 60000);
  if (minutes < 1) return "不到 1 分钟";
  if (minutes === 1) return "约 1 分钟";
  return `约 ${minutes} 分钟`;
};

const formatElapsed = (seconds: number): string => {
  const sec = Math.floor(seconds);
  if (sec < 60) return `${sec} 秒`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return `${m} 分 ${s} 秒`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h} 时 ${rm} 分 ${s} 秒`;
};

const TimerDisplay: React.FC<{ createdAt: number }> = ({ createdAt }) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    const id = setInterval(forceUpdate, 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = Math.max(0, Math.floor(Date.now() / 1000) - createdAt);

  return (
    <Chip
      icon={<TimerRounded />}
      label={formatElapsed(elapsed)}
      size="small"
      variant="outlined"
    />
  );
};

const SkinGen: React.FC = () => {
  const {
    status,
    isLoading,
    position,
    error,
    resultUrl,
    prompt,
    inviteCode,
    createdAt,
    finishedAt,
    history,
    setPrompt,
    setInviteCode,
    submit,
    cancel,
    clearResult,
    clearError,
    downloadResult,
    firstPollPending,
    deleteHistoryItem,
    loadHistoryTask,
  } = useSkinGen();

  const promptLen = prompt.trim().length;

  const [openHelp, setOpenHelp] = useState(false);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);
  const handleCancel = useCallback(() => {
    cancel();
  }, [cancel]);

  return (
    <Stack
      direction="row"
      spacing={3}
      sx={{ margin: "0 auto", alignItems: "flex-start" }}
    >
      {/* 左侧：历史 */}
      <Box sx={{ width: "40%", flexShrink: 0 }}>
        <SkinGenHistory
          history={history}
          onDelete={deleteHistoryItem}
          onView={loadHistoryTask}
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
                placeholder="例：long silver hair, blue eyes，请使用 tag 语法的提示词，不支持自然语言描述！"
                multiline
                minRows={2}
                maxRows={4}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  clearError();
                }}
                disabled={isLoading}
                error={promptLen > CONSTS.SKIN_GEN.PROMPT_MAX_LEN}
                helperText={
                  promptLen > CONSTS.SKIN_GEN.PROMPT_MAX_LEN
                    ? `提示词过长（${promptLen}/${CONSTS.SKIN_GEN.PROMPT_MAX_LEN}）`
                    : `${promptLen}/${CONSTS.SKIN_GEN.PROMPT_MAX_LEN}`
                }
                slotProps={{
                  htmlInput: {
                    maxLength: CONSTS.SKIN_GEN.PROMPT_MAX_LEN,
                  },
                }}
              />

              <TextField
                label="邀请码"
                placeholder="可选"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                disabled={isLoading}
                size="small"
              />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesomeRounded />}
                  onClick={handleSubmit}
                  disabled={
                    isLoading ||
                    promptLen < CONSTS.SKIN_GEN.PROMPT_MIN_LEN ||
                    promptLen > CONSTS.SKIN_GEN.PROMPT_MAX_LEN
                  }
                  sx={{ flex: 1 }}
                >
                  {status === "submitting" ? "提交中..." : "生成"}
                </Button>

                {status === "submitting" && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleCancel}
                  >
                    取消
                  </Button>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" onClose={clearError}>
            {error}
            {createdAt && (
              <Box
                component="span"
                sx={{ ml: 1, opacity: 0.7, fontSize: "0.85em" }}
              >
                (耗时{" "}
                {formatElapsed(
                  Math.max(0, (finishedAt ?? Math.floor(Date.now() / 1000)) - createdAt),
                )}
                )
              </Box>
            )}
          </Alert>
        )}

        {/* 首次轮询中 */}
        {firstPollPending && (status === "queued" || status === "running") && (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <AutoAwesomeRounded color="primary" sx={{ fontSize: 48 }} />
                <Typography variant="h6">处理中...</Typography>
                <LinearProgress sx={{ width: "100%" }} />
                {createdAt && <TimerDisplay createdAt={createdAt} />}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* 排队状态 */}
        {!firstPollPending && status === "queued" && (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <HourglassEmptyRounded color="primary" sx={{ fontSize: 48 }} />
                <Typography variant="h6">排队中</Typography>
                {position != null &&
                  (() => {
                    const aheadCount = Math.max(0, position - 1);
                    return (
                      <>
                        <Chip
                          label={
                            aheadCount > 0
                              ? `前方还有 ${aheadCount} 人`
                              : "即将开始"
                          }
                          color="primary"
                          variant="outlined"
                        />
                        {aheadCount > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            预计等待 {formatWaitTime(aheadCount)}
                          </Typography>
                        )}
                      </>
                    );
                  })()}
                <LinearProgress sx={{ width: "100%" }} />
                {createdAt && <TimerDisplay createdAt={createdAt} />}
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancel}
                >
                  取消任务
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* 生成中 */}
        {!firstPollPending && status === "running" && (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <AutoAwesomeRounded color="primary" sx={{ fontSize: 48 }} />
                <Typography variant="h6">正在生成...</Typography>
                <Typography variant="body2" color="text.secondary">
                  预计需要 2-3 分钟
                </Typography>
                <LinearProgress sx={{ width: "100%" }} />
                {createdAt && <TimerDisplay createdAt={createdAt} />}
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancel}
                >
                  取消任务
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* 取消中 */}
        {status === "cancelling" && (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <HourglassEmptyRounded color="warning" sx={{ fontSize: 48 }} />
                <Typography variant="h6">正在取消...</Typography>
                <Typography variant="body2" color="text.secondary">
                  已发送取消信号，最多等待 5 秒
                </Typography>
                <LinearProgress color="warning" sx={{ width: "100%" }} />
                {createdAt && <TimerDisplay createdAt={createdAt} />}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* 完成 */}
        {status === "done" && resultUrl && (
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6" color="success.main">
                  生成完成
                  {createdAt && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        fontSize: "0.7em",
                        fontWeight: 400,
                        color: "text.secondary",
                      }}
                    >
                      (耗时{" "}
                      {formatElapsed(
                        Math.max(0, (finishedAt ?? Math.floor(Date.now() / 1000)) - createdAt),
                      )}
                      )
                    </Box>
                  )}
                </Typography>

                <SkinViewer3D skinUrl={resultUrl} />

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
                  <img
                    src={resultUrl}
                    alt="生成的皮肤"
                    style={{
                      width: 128,
                      height: 128,
                      imageRendering: "pixelated",
                      display: "block",
                    }}
                  />
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadRounded />}
                    onClick={downloadResult}
                  >
                    下载 PNG
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshRounded />}
                    onClick={clearResult}
                  >
                    重新生成
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        )}
        <SkinGenHelp open={openHelp} onClose={() => setOpenHelp(false)} />
      </Stack>
    </Stack>
  );
};

export default SkinGen;
