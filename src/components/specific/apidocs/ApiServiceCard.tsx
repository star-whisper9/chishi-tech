import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ApiIcon from "@mui/icons-material/Api";

interface ApiServiceCardProps {
  service: string;
  versions: string[];
  endpointCount: number;
  info?: unknown; // 正确解析时应为 Record<string, unknown>
}

const ApiServiceCard: React.FC<ApiServiceCardProps> = ({
  service,
  versions,
  endpointCount,
  info,
}) => {
  const navigate = useNavigate();

  const apiInfo: Record<string, string> | undefined = info as
    | { title?: string; description?: string }
    | undefined;

  // 默认跳转到最新版本（假设版本已排序或取第一个）
  const latestVersion = versions[versions.length - 1] || versions[0];

  const handleClick = () => {
    navigate(`/api/${service}/${latestVersion}`);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardActionArea onClick={handleClick}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ApiIcon color="primary" />
              <Typography variant="h6" component="div">
                {apiInfo?.title || service}
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "pre-line" }}
            >
              {apiInfo?.description || `包含 ${endpointCount} 个接口端点`}
            </Typography>

            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                display="block"
              >
                可用版本
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {versions.map((v) => (
                  <Chip
                    key={v}
                    label={v}
                    size="small"
                    variant={v === latestVersion ? "filled" : "outlined"}
                    color="primary"
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ApiServiceCard;
