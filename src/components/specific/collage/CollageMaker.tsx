import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import useCollage, {
  type CollageCell,
  type CollageFitMode,
  type CollageOutputFormat,
} from "../../../hooks/useCollage";

const PRESET_SIZES = [
  { label: "1080", width: 1080, height: 1080 },
  { label: "1920x1080", width: 1920, height: 1080 },
  { label: "2048", width: 2048, height: 2048 },
];

const AUTO_MAX_SIZE = 16000;
const EPSILON = 1e-6;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const uniqueSorted = (values: number[]) =>
  values
    .slice()
    .sort((a, b) => a - b)
    .filter((value, index, arr) =>
      index === 0 ? true : Math.abs(value - arr[index - 1]) > EPSILON,
    );

const CollageMaker: React.FC = () => {
  const {
    layouts,
    images,
    layoutId,
    setLayoutId,
    outputWidth,
    outputHeight,
    setOutputWidth,
    setOutputHeight,
    gap,
    setGap,
    gapColor,
    setGapColor,
    fitMode,
    setFitMode,
    showLines,
    setShowLines,
    outputFormat,
    setOutputFormat,
    jpegQuality,
    setJpegQuality,
    addImages,
    removeImage,
    clearImages,
    renderToCanvas,
    exportImage,
    moveImage,
  } = useCollage();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [autoSizeEnabled, setAutoSizeEnabled] = React.useState(false);

  const activeLayout = useMemo(
    () => layouts.find((item) => item.id === layoutId) ?? layouts[0],
    [layouts, layoutId],
  );

  const getLayoutLabel = useCallback(
    (layoutIdValue: string) => {
      const layout = layouts.find((item) => item.id === layoutIdValue);
      if (!layout) return layoutIdValue;
      const capacity = layout.maxCells ?? layout.cells.length;
      const suffix = layout.maxCells ? `<=${capacity}` : `${capacity}`;
      return `${layout.name} (${suffix})`;
    },
    [layouts],
  );

  const computeAutoLayout = useCallback(() => {
    if (!activeLayout) {
      return null;
    }

    if (images.length === 0) {
      return null;
    }

    const cells = activeLayout.getCells
      ? activeLayout.getCells(images.length)
      : activeLayout.cells;
    const drawCount = Math.min(cells.length, images.length);

    if (drawCount === 0) {
      return null;
    }

    const xEdges = uniqueSorted([
      0,
      1,
      ...cells.flatMap((cell) => [cell.x, cell.x + cell.w]),
    ]);
    const yEdges = uniqueSorted([
      0,
      1,
      ...cells.flatMap((cell) => [cell.y, cell.y + cell.h]),
    ]);
    const rowCount = Math.max(0, yEdges.length - 1);
    const colCount = Math.max(0, xEdges.length - 1);

    if (rowCount === 0 || colCount === 0) {
      return null;
    }

    const rowHeights = Array.from({ length: rowCount }, () => 0);
    const colWidths = Array.from({ length: colCount }, () => 0);

    for (let i = 0; i < drawCount; i += 1) {
      const cell = cells[i];
      const image = images[i];
      const rows: number[] = [];
      const cols: number[] = [];

      for (let r = 0; r < rowCount; r += 1) {
        const start = yEdges[r];
        const end = yEdges[r + 1];
        if (cell.y <= start + EPSILON && cell.y + cell.h >= end - EPSILON) {
          rows.push(r);
        }
      }

      for (let c = 0; c < colCount; c += 1) {
        const start = xEdges[c];
        const end = xEdges[c + 1];
        if (cell.x <= start + EPSILON && cell.x + cell.w >= end - EPSILON) {
          cols.push(c);
        }
      }

      const rowSpan = Math.max(1, rows.length);
      const colSpan = Math.max(1, cols.length);
      const targetHeight = (image.height + gap) / rowSpan;
      const targetWidth = (image.width + gap) / colSpan;

      rows.forEach((rowIndex) => {
        rowHeights[rowIndex] = Math.max(rowHeights[rowIndex], targetHeight);
      });
      cols.forEach((colIndex) => {
        colWidths[colIndex] = Math.max(colWidths[colIndex], targetWidth);
      });
    }

    const totalWidth = colWidths.reduce((sum, value) => sum + value, 0);
    const totalHeight = rowHeights.reduce((sum, value) => sum + value, 0);

    if (totalWidth <= 0 || totalHeight <= 0) {
      return null;
    }

    const scale = Math.min(
      1,
      AUTO_MAX_SIZE / totalWidth,
      AUTO_MAX_SIZE / totalHeight,
    );
    if (scale < 1) {
      for (let i = 0; i < rowHeights.length; i += 1) {
        rowHeights[i] *= scale;
      }
      for (let i = 0; i < colWidths.length; i += 1) {
        colWidths[i] *= scale;
      }
    }

    const width = clamp(
      Math.ceil(colWidths.reduce((sum, value) => sum + value, 0)),
      64,
      AUTO_MAX_SIZE,
    );
    const height = clamp(
      Math.ceil(rowHeights.reduce((sum, value) => sum + value, 0)),
      64,
      AUTO_MAX_SIZE,
    );

    const colOffsets = colWidths.reduce<number[]>(
      (acc, value) => {
        acc.push(acc[acc.length - 1] + value);
        return acc;
      },
      [0],
    );
    const rowOffsets = rowHeights.reduce<number[]>(
      (acc, value) => {
        acc.push(acc[acc.length - 1] + value);
        return acc;
      },
      [0],
    );

    const autoCells: CollageCell[] = cells.map((cell) => {
      const cols: number[] = [];
      const rows: number[] = [];

      for (let r = 0; r < rowCount; r += 1) {
        const start = yEdges[r];
        const end = yEdges[r + 1];
        if (cell.y <= start + EPSILON && cell.y + cell.h >= end - EPSILON) {
          rows.push(r);
        }
      }

      for (let c = 0; c < colCount; c += 1) {
        const start = xEdges[c];
        const end = xEdges[c + 1];
        if (cell.x <= start + EPSILON && cell.x + cell.w >= end - EPSILON) {
          cols.push(c);
        }
      }

      const rowStart = rows[0] ?? 0;
      const rowEnd = rows[rows.length - 1] ?? rowStart;
      const colStart = cols[0] ?? 0;
      const colEnd = cols[cols.length - 1] ?? colStart;

      const px = colOffsets[colStart];
      const py = rowOffsets[rowStart];
      const pw = colOffsets[colEnd + 1] - colOffsets[colStart];
      const ph = rowOffsets[rowEnd + 1] - rowOffsets[rowStart];

      return {
        x: px / width,
        y: py / height,
        w: pw / width,
        h: ph / height,
      };
    });

    return { width, height, cells: autoCells };
  }, [activeLayout, images, gap]);

  const autoLayout = useMemo(
    () => (autoSizeEnabled ? computeAutoLayout() : null),
    [autoSizeEnabled, computeAutoLayout],
  );
  const autoCells = autoLayout?.cells;

  useEffect(() => {
    if (!autoSizeEnabled) return;
    if (!autoLayout) return;
    setOutputWidth(autoLayout.width);
    setOutputHeight(autoLayout.height);
  }, [autoSizeEnabled, autoLayout, setOutputHeight, setOutputWidth]);

  const previewSize = useMemo(() => {
    const baseWidth = 560;
    const safeWidth = outputWidth > 0 ? outputWidth : 1;
    const safeHeight = outputHeight > 0 ? outputHeight : 1;
    const ratio = safeHeight / safeWidth;
    return {
      width: baseWidth,
      height: Math.max(280, Math.round(baseWidth * ratio)),
    };
  }, [outputHeight, outputWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = previewSize.width;
    canvas.height = previewSize.height;
    renderToCanvas(canvas, previewSize.width, previewSize.height, autoCells);
  }, [renderToCanvas, previewSize, autoCells]);

  const handleFiles = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) return;
      await addImages(event.target.files);
      event.target.value = "";
    },
    [addImages],
  );

  const handleExport = useCallback(
    async (formatOverride?: CollageOutputFormat) => {
      const blob = await exportImage(formatOverride, autoCells);
      const format = formatOverride ?? outputFormat;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `collage-${Date.now()}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [exportImage, outputFormat, autoCells],
  );

  const handleLayoutChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      setLayoutId(event.target.value);
    },
    [setLayoutId],
  );

  const handleFitModeChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      setFitMode(event.target.value as CollageFitMode);
    },
    [setFitMode],
  );

  const handleFormatChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      setOutputFormat(event.target.value as CollageOutputFormat);
    },
    [setOutputFormat],
  );

  return (
    <Stack spacing={3} alignItems="stretch">
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Button variant="contained" component="label">
                上传图片 (最多 16 张)
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                />
              </Button>
              <Button
                variant="text"
                color="inherit"
                disabled={images.length === 0}
                onClick={clearImages}
              >
                清空
              </Button>
            </Stack>

            <Stack spacing={2}>
              {images.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  还没有图片，先上传几张。
                </Typography>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {images.map((img) => (
                    <Box
                      key={img.id}
                      draggable
                      onDragStart={() => setDraggingId(img.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (!draggingId || draggingId === img.id) return;
                        moveImage(draggingId, img.id);
                        setDraggingId(null);
                      }}
                      sx={{
                        width: 84,
                        height: 84,
                        borderRadius: 1,
                        overflow: "hidden",
                        position: "relative",
                        border: "1px solid",
                        borderColor:
                          draggingId === img.id ? "primary.main" : "divider",
                        boxShadow: draggingId === img.id ? 2 : 0,
                        cursor: "grab",
                      }}
                    >
                      <Box
                        component="img"
                        src={img.url}
                        alt={img.file.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => removeImage(img.id)}
                        sx={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          minWidth: 0,
                          padding: "2px 6px",
                          bgcolor: "rgba(0,0,0,0.55)",
                          color: "#fff",
                          fontSize: 11,
                          lineHeight: 1,
                          "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                        }}
                      >
                        X
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="collage-layout-label">布局</InputLabel>
                <Select
                  labelId="collage-layout-label"
                  label="布局"
                  value={layoutId}
                  onChange={handleLayoutChange}
                >
                  {layouts.map((layout) => {
                    const capacity = layout.maxCells ?? layout.cells.length;
                    const disabled = images.length > capacity;
                    return (
                      <MenuItem
                        key={layout.id}
                        value={layout.id}
                        disabled={disabled}
                      >
                        {getLayoutLabel(layout.id)}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="宽度"
                  type="number"
                  value={outputWidth}
                  disabled={autoSizeEnabled}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setOutputWidth(Number.isFinite(next) ? next : 0);
                  }}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="高度"
                  type="number"
                  value={outputHeight}
                  disabled={autoSizeEnabled}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setOutputHeight(Number.isFinite(next) ? next : 0);
                  }}
                  size="small"
                  fullWidth
                />
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <ToggleButton
                  value="auto-size"
                  selected={autoSizeEnabled}
                  onChange={() => setAutoSizeEnabled((prev) => !prev)}
                  size="small"
                >
                  Auto
                </ToggleButton>
                {PRESET_SIZES.map((preset) => (
                  <Button
                    key={preset.label}
                    size="small"
                    variant="outlined"
                    disabled={autoSizeEnabled}
                    onClick={() => {
                      setOutputWidth(preset.width);
                      setOutputHeight(preset.height);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="collage-fit-label">填充</InputLabel>
                  <Select
                    labelId="collage-fit-label"
                    label="填充"
                    value={fitMode}
                    onChange={handleFitModeChange}
                  >
                    <MenuItem value="contain">Contain</MenuItem>
                    <MenuItem value="cover">Cover</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="stretch">Stretch</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="间隔"
                  type="number"
                  value={gap}
                  onChange={(event) =>
                    setGap(Math.max(0, Number(event.target.value)))
                  }
                  size="small"
                  fullWidth
                />
                <TextField
                  label="间隔颜色"
                  type="color"
                  value={gapColor}
                  onChange={(event) => setGapColor(event.target.value)}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showLines}
                      onChange={(event) => setShowLines(event.target.checked)}
                    />
                  }
                  label="显示线条"
                />
                <FormControl fullWidth size="small">
                  <InputLabel id="collage-format-label">导出格式</InputLabel>
                  <Select
                    labelId="collage-format-label"
                    label="导出格式"
                    value={outputFormat}
                    onChange={handleFormatChange}
                  >
                    <MenuItem value="png">PNG</MenuItem>
                    <MenuItem value="jpeg">JPEG</MenuItem>
                  </Select>
                </FormControl>
                {outputFormat === "jpeg" && (
                  <TextField
                    label="JPEG 质量"
                    type="number"
                    value={jpegQuality}
                    onChange={(event) =>
                      setJpegQuality(
                        Math.min(1, Math.max(0.5, Number(event.target.value))),
                      )
                    }
                    size="small"
                    fullWidth
                    inputProps={{ step: 0.05, min: 0.5, max: 1 }}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                component="canvas"
                ref={canvasRef}
                sx={{
                  width: "100%",
                  maxWidth: previewSize.width,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                }}
              />
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                disabled={images.length === 0}
                onClick={() => handleExport("png")}
              >
                导出 PNG
              </Button>
              <Button
                variant="outlined"
                disabled={images.length === 0}
                onClick={() => handleExport("jpeg")}
              >
                导出 JPEG
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CollageMaker;
