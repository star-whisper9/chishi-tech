import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type CollageFitMode = "contain" | "cover" | "center" | "stretch";
export type CollageOutputFormat = "png" | "jpeg";

export interface CollageCell {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CollageLayout {
  id: string;
  name: string;
  cells: CollageCell[];
  getCells?: (count: number) => CollageCell[];
  maxCells?: number;
}

export interface CollageImage {
  id: string;
  file: File;
  url: string;
  source: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  release: () => void;
}

const MAX_IMAGES = 16;
const MAX_OUTPUT_SIZE = 16000;

const LAYOUTS: CollageLayout[] = [
  {
    id: "2x2",
    name: "四宫格",
    cells: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: "3x3",
    name: "九宫格",
    cells: [
      { x: 0, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 0, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 0, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 1 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 2 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
    ],
  },
  {
    id: "row",
    name: "单行",
    cells: [],
    maxCells: MAX_IMAGES,
    getCells: (count) => {
      const total = Math.max(1, Math.min(MAX_IMAGES, count));
      const width = 1 / total;
      return Array.from({ length: total }, (_, index) => ({
        x: index * width,
        y: 0,
        w: width,
        h: 1,
      }));
    },
  },
  {
    id: "column",
    name: "单列",
    cells: [],
    maxCells: MAX_IMAGES,
    getCells: (count) => {
      const total = Math.max(1, Math.min(MAX_IMAGES, count));
      const height = 1 / total;
      return Array.from({ length: total }, (_, index) => ({
        x: 0,
        y: index * height,
        w: 1,
        h: height,
      }));
    },
  },
  {
    id: "2-1-top",
    name: "上二下一",
    cells: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 },
    ],
  },
  {
    id: "1-2-bottom",
    name: "上一下二",
    cells: [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: "1-2-right",
    name: "左一右二",
    cells: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: "2-1-left",
    name: "左二右一",
    cells: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
  },
];

const loadImageElement = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getLayoutCapacity = (layout: CollageLayout) =>
  layout.maxCells ?? layout.cells.length;

export interface UseCollageReturn {
  layouts: CollageLayout[];
  images: CollageImage[];
  layoutId: string;
  setLayoutId: (id: string) => void;
  outputWidth: number;
  outputHeight: number;
  setOutputWidth: (value: number) => void;
  setOutputHeight: (value: number) => void;
  gap: number;
  setGap: (value: number) => void;
  gapColor: string;
  setGapColor: (value: string) => void;
  fitMode: CollageFitMode;
  setFitMode: (value: CollageFitMode) => void;
  showLines: boolean;
  setShowLines: (value: boolean) => void;
  jpegQuality: number;
  setJpegQuality: (value: number) => void;
  addImages: (files: FileList | File[]) => Promise<void>;
  removeImage: (id: string) => void;
  clearImages: () => void;
  moveImage: (sourceId: string, targetId: string) => void;
  renderToCanvas: (
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    cellsOverride?: CollageCell[],
  ) => void;
  exportImage: (
    formatOverride?: CollageOutputFormat,
    cellsOverride?: CollageCell[],
  ) => Promise<Blob>;
}

export function useCollage(): UseCollageReturn {
  const [images, setImages] = useState<CollageImage[]>([]);
  const imagesRef = useRef<CollageImage[]>([]);
  const [layoutId, setLayoutId] = useState<string>(LAYOUTS[0].id);
  const [outputWidth, setOutputWidth] = useState(1080);
  const [outputHeight, setOutputHeight] = useState(1080);
  const [gap, setGap] = useState(12);
  const [gapColor, setGapColor] = useState("#f5f5f5");
  const [fitMode, setFitMode] = useState<CollageFitMode>("contain");
  const [showLines, setShowLines] = useState(false);
  const [jpegQuality, setJpegQuality] = useState(0.92);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => img.release());
    };
  }, []);

  const addImages = useCallback(async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    const capacity = Math.max(0, MAX_IMAGES - imagesRef.current.length);
    const nextFiles = fileList.slice(0, capacity);

    const entries = await Promise.all(
      nextFiles.map(async (file) => {
        const url = URL.createObjectURL(file);
        if ("createImageBitmap" in window) {
          const bitmap = await createImageBitmap(file);
          return {
            id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
            file,
            url,
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            release: () => {
              bitmap.close?.();
              URL.revokeObjectURL(url);
            },
          } satisfies CollageImage;
        }

        const image = await loadImageElement(url);
        return {
          id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
          file,
          url,
          source: image,
          width: image.width,
          height: image.height,
          release: () => {
            URL.revokeObjectURL(url);
          },
        } satisfies CollageImage;
      }),
    );

    if (entries.length > 0) {
      setImages((prev) => [...prev, ...entries]);
    }
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        target.release();
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => img.release());
      return [];
    });
  }, []);

  const moveImage = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setImages((prev) => {
      const fromIndex = prev.findIndex((img) => img.id === sourceId);
      const toIndex = prev.findIndex((img) => img.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const layout = useMemo(
    () => LAYOUTS.find((item) => item.id === layoutId) ?? LAYOUTS[0],
    [layoutId],
  );

  useEffect(() => {
    const capacity = getLayoutCapacity(layout);
    if (images.length > capacity) {
      const next = LAYOUTS.find(
        (item) => images.length <= getLayoutCapacity(item),
      );
      if (next && next.id !== layoutId) {
        setLayoutId(next.id);
      }
    }
  }, [images.length, layout, layoutId]);

  const renderToCanvas = useCallback(
    (
      canvas: HTMLCanvasElement,
      width: number,
      height: number,
      cellsOverride?: CollageCell[],
    ) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = gapColor;
      ctx.fillRect(0, 0, width, height);

      const inset = gap / 2;
      const cells =
        cellsOverride ??
        (layout.getCells ? layout.getCells(images.length) : layout.cells);
      const drawCount = Math.min(cells.length, images.length);

      const drawImage = (
        cell: CollageCell,
        image: CollageImage,
        mode: CollageFitMode,
      ) => {
        const destX = cell.x * width + inset;
        const destY = cell.y * height + inset;
        const destW = cell.w * width - inset * 2;
        const destH = cell.h * height - inset * 2;

        if (destW <= 0 || destH <= 0) {
          return;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(destX, destY, destW, destH);
        ctx.clip();

        const imgW = image.width;
        const imgH = image.height;

        if (mode === "stretch") {
          ctx.drawImage(image.source, destX, destY, destW, destH);
        } else if (mode === "center") {
          const drawW = Math.min(imgW, destW);
          const drawH = Math.min(imgH, destH);
          const srcX = (imgW - drawW) / 2;
          const srcY = (imgH - drawH) / 2;
          const dstX = destX + (destW - drawW) / 2;
          const dstY = destY + (destH - drawH) / 2;
          ctx.drawImage(
            image.source,
            srcX,
            srcY,
            drawW,
            drawH,
            dstX,
            dstY,
            drawW,
            drawH,
          );
        } else {
          const scale =
            mode === "contain"
              ? Math.min(destW / imgW, destH / imgH)
              : Math.max(destW / imgW, destH / imgH);
          const drawW = imgW * scale;
          const drawH = imgH * scale;
          const dstX = destX + (destW - drawW) / 2;
          const dstY = destY + (destH - drawH) / 2;
          ctx.drawImage(image.source, dstX, dstY, drawW, drawH);
        }

        ctx.restore();
      };

      for (let i = 0; i < drawCount; i += 1) {
        drawImage(cells[i], images[i], fitMode);
      }

      if (showLines) {
        ctx.save();
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 2;
        cells.slice(0, drawCount).forEach((cell) => {
          const destX = cell.x * width + inset;
          const destY = cell.y * height + inset;
          const destW = cell.w * width - inset * 2;
          const destH = cell.h * height - inset * 2;
          ctx.strokeRect(destX, destY, destW, destH);
        });
        ctx.restore();
      }
    },
    [gapColor, gap, layout, images, fitMode, showLines],
  );

  const exportImage = useCallback(
    async (
      formatOverride?: CollageOutputFormat,
      cellsOverride?: CollageCell[],
    ) => {
      const format = formatOverride ?? "png";
      const canvas = document.createElement("canvas");
      canvas.width = clamp(outputWidth, 64, MAX_OUTPUT_SIZE);
      canvas.height = clamp(outputHeight, 64, MAX_OUTPUT_SIZE);
      renderToCanvas(canvas, canvas.width, canvas.height, cellsOverride);

      const blob = await new Promise<Blob>((resolve, reject) => {
        const mime = format === "jpeg" ? "image/jpeg" : "image/png";
        const quality = format === "jpeg" ? jpegQuality : undefined;
        canvas.toBlob(
          (result) => {
            if (!result) {
              reject(new Error("Failed to export image"));
              return;
            }
            resolve(result);
          },
          mime,
          quality,
        );
      });

      return blob;
    },
    [jpegQuality, outputHeight, outputWidth, renderToCanvas],
  );

  return {
    layouts: LAYOUTS,
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
    moveImage,
    renderToCanvas,
    exportImage,
  };
}

export default useCollage;
