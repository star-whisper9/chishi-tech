import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { DeleteRounded, VisibilityRounded, HistoryRounded } from "@mui/icons-material";
import { type SkinGenHistoryItem } from "../../../hooks/useSkinGen";
import { CONSTS } from "../../../config/consts";

type DisplayStatus =
  | "queued"
  | "running"
  | "done"
  | "expired"
  | "cancelled"
  | "failed";

interface SkinGenHistoryProps {
  history: SkinGenHistoryItem[];
  onDelete: (taskId: string) => void;
  onView: (taskId: string) => void;
}

const getDisplayStatus = (item: SkinGenHistoryItem): DisplayStatus => {
  if (item.status === "done") {
    const expired =
      item.finishedAt !== null &&
      Date.now() / 1000 > item.finishedAt + CONSTS.SKIN_GEN.TTL_SEC;
    return expired ? "expired" : "done";
  }
  return item.status;
};

const statusConfig: Record<
  DisplayStatus,
  {
    label: string;
    color: "default" | "primary" | "success" | "error" | "warning" | "info";
  }
> = {
  queued: { label: "排队中", color: "primary" },
  running: { label: "生成中", color: "info" },
  done: { label: "已完成", color: "success" },
  expired: { label: "已过期", color: "default" },
  cancelled: { label: "已取消", color: "warning" },
  failed: { label: "已失败", color: "error" },
};

const formatTime = (timestampSec: number): string => {
  const d = new Date(timestampSec * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const SkinGenHistory: React.FC<SkinGenHistoryProps> = ({
  history,
  onDelete,
  onView,
}) => {
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => b.createdAt - a.createdAt),
    [history],
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          生成历史
        </Typography>
        {sortedHistory.length === 0 ? (
          <Stack spacing={1} alignItems="center" sx={{ py: 3, color: "text.secondary" }}>
            <HistoryRounded sx={{ fontSize: 40, opacity: 0.4 }} />
            <Typography variant="body2">暂无生成记录</Typography>
          </Stack>
        ) : (
        <Stack spacing={1} divider={<Divider flexItem />}>
          {sortedHistory.map((item) => {
            const displayStatus = getDisplayStatus(item);
            const config = statusConfig[displayStatus];
            const canView =
              item.status === "queued" ||
              item.status === "running" ||
              (item.status === "done" && item.imageBase64 !== null);

            return (
              <Box key={item.taskId}>
                {/* 上行 */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(item.createdAt)}
                  </Typography>
                  <Chip
                    label={config.label}
                    color={config.color}
                    size="small"
                    variant="filled"
                  />
                </Stack>
                {/* 下行 */}
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  spacing={1}
                  sx={{ mt: 0.5 }}
                >
                  <Typography
                    variant="body2"
                    sx={{ flex: 1, wordBreak: "break-word" }}
                  >
                    {item.prompt}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(item.taskId)}
                      title="删除记录"
                    >
                      <DeleteRounded fontSize="small" />
                    </IconButton>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityRounded fontSize="small" />}
                      disabled={!canView}
                      onClick={() => onView(item.taskId)}
                    >
                      查看
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default SkinGenHistory;
