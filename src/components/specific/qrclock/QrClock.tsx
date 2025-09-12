import React, { useCallback, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import useQrClock from "../../../hooks/useQrClock";

export interface QrClockProps {
  size?: number; // 二维码尺寸
  level?: "L" | "M" | "Q" | "H"; // 容错等级
  renderLabel?: (formatted: string, timeZone: string) => React.ReactNode;
}

const QrClock: React.FC<QrClockProps> = ({
  size = 240,
  level = "M",
  renderLabel,
}) => {
  const { timeZone, setTimeZone, text, formatted, availableTimeZones } =
    useQrClock();
  const [showText, setShowText] = useState(true);

  const handleChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      setTimeZone(e.target.value as string);
    },
    [setTimeZone]
  );

  return (
    <Card elevation={3} sx={{ maxWidth: size + 64 }}>
      <CardContent>
        <Stack spacing={2} alignItems="center">
          <Box onClick={() => setShowText(!showText)}>
            <QRCodeCanvas value={text} size={size} level={level} />
          </Box>
          <Box width="100%">
            <FormControl fullWidth size="small">
              <InputLabel id="qrclock-timezone-label">时区</InputLabel>
              <Select
                labelId="qrclock-timezone-label"
                label="时区"
                value={timeZone}
                onChange={handleChange}
              >
                {availableTimeZones.map((tz) => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {showText && (
            <Box>
              {renderLabel ? (
                renderLabel(formatted, timeZone)
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {formatted} ({timeZone})
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QrClock;
