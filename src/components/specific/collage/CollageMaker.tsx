import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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
    async (format: CollageOutputFormat) => {
      const blob = await exportImage(format, autoCells);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `collage-${Date.now()}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [exportImage, autoCells],
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

  return (
    <Stack spacing={3} alignItems="stretch">
      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    图片
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最多选择 16 张，拖动缩略图可以调整顺序。
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" component="label">
                    选择图片
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
              </Stack>

              <Box sx={{ mt: 2 }}>
                {images.length === 0 ? (
                  <Box
                    sx={{
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: { xs: 2.5, sm: 3 },
                      textAlign: "center",
                      bgcolor: "action.hover",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      还没有图片
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      选择后会在这里显示缩略图
                    </Typography>
                  </Box>
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
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                画布与布局
              </Typography>
              <Stack spacing={3} sx={{ mt: 2.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    布局与尺寸
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 12 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="collage-layout-label">布局</InputLabel>
                        <Select
                          labelId="collage-layout-label"
                          label="布局"
                          value={layoutId}
                          onChange={handleLayoutChange}
                        >
                          {layouts.map((layout) => {
                            const capacity =
                              layout.maxCells ?? layout.cells.length;
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
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
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
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
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
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    填充与间隔
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
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
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="间隔颜色"
                        type="color"
                        value={gapColor}
                        onChange={(event) => setGapColor(event.target.value)}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 1,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                >
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        checked={showLines}
                        onChange={(event) => setShowLines(event.target.checked)}
                      />
                    }
                    label="添加描边"
                  />
                  <Typography variant="caption" color="text.secondary">
                    为每张图片绘制边框
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5} alignItems="center">
            <Box sx={{ width: "100%" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                预览
              </Typography>
              <Typography variant="body2" color="text.secondary">
                选择图片后，这里会显示最终拼图效果。
              </Typography>
            </Box>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: previewSize.width,
                  position: "relative",
                  aspectRatio: `${previewSize.width} / ${previewSize.height}`,
                }}
              >
                <Box
                  component="canvas"
                  ref={canvasRef}
                  sx={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                />
                {images.length === 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      backgroundImage: (theme) => {
                        const square = alpha(
                          theme.palette.text.primary,
                          theme.palette.mode === "light" ? 0.05 : 0.1,
                        );
                        return `linear-gradient(45deg, ${square} 25%, transparent 25%), linear-gradient(-45deg, ${square} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${square} 75%), linear-gradient(-45deg, transparent 75%, ${square} 75%)`;
                      },
                      backgroundSize: "24px 24px",
                      backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0",
                      pointerEvents: "none",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      暂无预览
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="center"
              sx={{ width: "100%" }}
            >
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
                inputProps={{ step: 0.05, min: 0.5, max: 1 }}
                sx={{ width: { xs: "100%", sm: 160 } }}
              />
              <Stack direction="row" spacing={2} justifyContent="center">
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
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CollageMaker;
