import { useState, useCallback, useRef } from "react";
import * as ort from "onnxruntime-web";
import {
  fileToImage,
  imageDataToTensor,
  tensorToImageData,
} from "../utils/imageProcessing";

const SCALE = 4;
const PREPADDING = 10;

const mirrorCoordinate = (coord: number, max: number): number => {
  // Mirror reflection padding to match realesrgan_preproc shader
  const mirrored = Math.abs(coord);
  return max - 1 - Math.abs(mirrored - (max - 1));
};

const dataUrlToImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

ort.env.wasm.wasmPaths =
  "https://cdn.jsdmirror.com/npm/onnxruntime-web@1.23.2/dist/";

export interface LocalModel {
  name: string;
  path: string;
  description: string;
}

export const LOCAL_MODELS: LocalModel[] = [
  {
    name: "RealESRGAN x4 Plus",
    path: "https://www.modelscope.cn/models/starwhisper9/Real-ESRGAN-onnx/resolve/master/RealESRGAN_x4plus.onnx",
    description: "适用于大部分图的放大模型（x4）",
  },
  {
    name: "RealESRGAN x4 Plus Anime 6B",
    path: "https://www.modelscope.cn/models/starwhisper9/Real-ESRGAN-onnx/resolve/master/RealESRGAN_x4plus_anime_6B.onnx",
    description: "适用于动漫插画的小尺寸优化模型（x4）",
  },
];

export const useLocalUpscayl = () => {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [currentModelPath, setCurrentModelPath] = useState<string | null>(null);
  const [executionProvider, setExecutionProvider] = useState<string>("unknown");
  const [durationMs, setDurationMs] = useState<number | null>(null);

  const abortRef = useRef(false);

  const loadModel = useCallback(
    async (modelPath: string) => {
      if (session && currentModelPath === modelPath) {
        return;
      }

      setModelLoading(true);
      setError(null);
      setSession(null);
      setExecutionProvider("unknown");

      try {
        try {
          const sess = await ort.InferenceSession.create(modelPath, {
            executionProviders: ["webgpu"],
          });
          setSession(sess);
          setExecutionProvider("webgpu");
        } catch (e) {
          console.warn("WebGPU failed, falling back to WASM", e);
          const sess = await ort.InferenceSession.create(modelPath, {
            executionProviders: ["wasm"],
          });
          setSession(sess);
          setExecutionProvider("wasm");
        }
        setCurrentModelPath(modelPath);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(`Failed to load model: ${errorMessage}`);
        setSession(null);
        setCurrentModelPath(null);
      } finally {
        setModelLoading(false);
      }
    },
    [session, currentModelPath]
  );

  const runTiledInference = useCallback(
    async (
      session: ort.InferenceSession,
      img: HTMLImageElement,
      tileSize: number,
      onProgress: (progress: number) => void,
      isCanceled: () => boolean
    ): Promise<string | null> => {
      if (isCanceled()) return null;

      const cols = Math.ceil(img.width / tileSize);
      const rows = Math.ceil(img.height / tileSize);
      const totalTiles = cols * rows;

      console.log(`Processing ${rows}x${cols} tiles (${totalTiles} total)`);

      // 最终输出画布
      const outCanvas = document.createElement("canvas");
      outCanvas.width = img.width * SCALE;
      outCanvas.height = img.height * SCALE;
      const outCtx = outCanvas.getContext("2d");
      if (!outCtx) throw new Error("Could not get output canvas context");

      // 创建源图像的 canvas 用于像素读取
      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = img.width;
      srcCanvas.height = img.height;
      const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true });
      if (!srcCtx) throw new Error("Could not get source canvas context");
      srcCtx.drawImage(img, 0, 0);

      // 获取源图像的像素数据
      const srcImageData = srcCtx.getImageData(0, 0, img.width, img.height);
      const srcPixels = srcImageData.data;

      // Alpha 通道输出画布，按 tile 区域无 padding 放大（与 C 端一致）
      const alphaOutCanvas = document.createElement("canvas");
      alphaOutCanvas.width = img.width * SCALE;
      alphaOutCanvas.height = img.height * SCALE;
      const alphaOutCtx = alphaOutCanvas.getContext("2d");
      if (!alphaOutCtx)
        throw new Error("Could not get alpha output canvas context");
      alphaOutCtx.imageSmoothingEnabled = true;
      alphaOutCtx.imageSmoothingQuality = "high";

      // Reuse tile canvases to reduce DOM churn and GC pressure
      const maxTileSize = tileSize + PREPADDING * 2;
      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = maxTileSize;
      tileCanvas.height = maxTileSize;
      const tileCtx = tileCanvas.getContext("2d", { willReadFrequently: true });
      if (!tileCtx) throw new Error("Could not get tile canvas context");

      const outTileCanvas = document.createElement("canvas");
      outTileCanvas.width = maxTileSize * SCALE;
      outTileCanvas.height = maxTileSize * SCALE;
      let outTileCtx = outTileCanvas.getContext("2d");
      if (!outTileCtx) throw new Error("Could not get output tile context");

      let processedTiles = 0;

      for (let yi = 0; yi < rows; yi++) {
        for (let xi = 0; xi < cols; xi++) {
          // 计算当前 tile 的实际区域（不含 padding）
          const tileX = xi * tileSize;
          const tileY = yi * tileSize;
          const tileWidthNoPad = Math.min(tileSize, img.width - tileX);
          const tileHeightNoPad = Math.min(tileSize, img.height - tileY);

          const tileX0 = tileX - PREPADDING;
          const tileY0 = tileY - PREPADDING;
          const tileX1 = Math.min((xi + 1) * tileSize, img.width) + PREPADDING;
          const tileY1 = Math.min((yi + 1) * tileSize, img.height) + PREPADDING;

          const paddedW = tileX1 - tileX0;
          const paddedH = tileY1 - tileY0;

          const tileImageData = tileCtx.createImageData(paddedW, paddedH);
          const tilePixels = tileImageData.data;

          // 使用镜像填充方式填充 tile（包括 padding 区域）
          for (let y = 0; y < paddedH; y++) {
            for (let x = 0; x < paddedW; x++) {
              // 计算在原图中的坐标
              const src_x = tileX0 + x;
              const src_y = tileY0 + y;

              // 使用镜像边界处理
              const clamped_x = mirrorCoordinate(src_x, img.width);
              const clamped_y = mirrorCoordinate(src_y, img.height);

              // 从源图像读取像素
              const src_idx = (clamped_y * img.width + clamped_x) * 4;
              const dst_idx = (y * paddedW + x) * 4;

              tilePixels[dst_idx] = srcPixels[src_idx]; // R
              tilePixels[dst_idx + 1] = srcPixels[src_idx + 1]; // G
              tilePixels[dst_idx + 2] = srcPixels[src_idx + 2]; // B
              tilePixels[dst_idx + 3] = srcPixels[src_idx + 3]; // A
            }
          }

          tileCtx.putImageData(tileImageData, 0, 0);

          const tileForInference = tileCtx.getImageData(0, 0, paddedW, paddedH);
          const tensorData = imageDataToTensor(tileForInference);

          let inputTensor: ort.Tensor | null = null;
          let outputTensor: ort.Tensor | null = null;

          try {
            inputTensor = new ort.Tensor("float32", tensorData, [
              1,
              3,
              paddedH,
              paddedW,
            ]);

            const feeds = { [session.inputNames[0]]: inputTensor };
            const results = await session.run(feeds);
            outputTensor = results[session.outputNames[0]];
            const outputData = outputTensor.data as Float32Array;

            const out_padded_w = paddedW * SCALE;
            const out_padded_h = paddedH * SCALE;

            const outTileImageData = tensorToImageData(
              outputData,
              out_padded_w,
              out_padded_h
            );

            if (
              outTileCanvas.width !== out_padded_w ||
              outTileCanvas.height !== out_padded_h
            ) {
              outTileCanvas.width = out_padded_w;
              outTileCanvas.height = out_padded_h;
              outTileCtx = outTileCanvas.getContext("2d");
              if (!outTileCtx)
                throw new Error("Could not get output tile context");
            }

            outTileCtx.putImageData(outTileImageData, 0, 0);

            // 计算需要裁剪的区域（去除 padding）
            // 只有当 tile 不在边界时才需要裁剪 padding
            const crop_x = PREPADDING * SCALE;
            const crop_y = PREPADDING * SCALE;
            const src_crop_w = tileWidthNoPad * SCALE;
            const src_crop_h = tileHeightNoPad * SCALE;

            const dst_x = tileX * SCALE;
            const dst_y = tileY * SCALE;

            // 绘制到最终输出画布
            outCtx.drawImage(
              outTileCanvas,
              crop_x,
              crop_y,
              src_crop_w,
              src_crop_h, // 源区域（裁剪后）
              dst_x,
              dst_y,
              src_crop_w,
              src_crop_h // 目标区域
            );

            // 同步处理 alpha：不加 padding，直接对 tile 区域做平滑放大
            alphaOutCtx.drawImage(
              srcCanvas,
              tileX,
              tileY,
              tileWidthNoPad,
              tileHeightNoPad,
              dst_x,
              dst_y,
              src_crop_w,
              src_crop_h
            );
          } finally {
            if (inputTensor) inputTensor.dispose();
            if (outputTensor) outputTensor.dispose();
          }

          processedTiles++;
          onProgress((processedTiles / totalTiles) * 100);

          if (isCanceled()) {
            return null;
          }

          // 让出控制权，避免阻塞 UI
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      const alphaData = alphaOutCtx.getImageData(
        0,
        0,
        alphaOutCanvas.width,
        alphaOutCanvas.height
      );
      const outImageData = outCtx.getImageData(
        0,
        0,
        outCanvas.width,
        outCanvas.height
      );
      const alphaPixels = alphaData.data;
      const outPixels = outImageData.data;

      for (let i = 0; i < outPixels.length; i += 4) {
        outPixels[i + 3] = alphaPixels[i + 3];
      }

      outCtx.putImageData(outImageData, 0, 0);

      if (isCanceled()) return null;

      return outCanvas.toDataURL("image/png");
    },
    []
  );

  const computeTileSize = useCallback((img: HTMLImageElement) => {
    const maxDimension = Math.max(img.width, img.height);
    let tileSize = 200;

    if (maxDimension <= 800) {
      tileSize = Math.min(200, maxDimension);
    } else if (maxDimension <= 1500) {
      tileSize = 200;
    } else if (maxDimension <= 2500) {
      tileSize = 128;
    } else if (maxDimension <= 4000) {
      tileSize = 100;
    } else {
      tileSize = 64;
    }

    return tileSize;
  }, []);

  const upscale = useCallback(
    async (file: File, targetScale: number = SCALE) => {
      if (!session) {
        setError("Model not loaded");
        return;
      }

      if (![1, 2, 3, 4, 16].includes(targetScale)) {
        setError("Unsupported target scale. Use 1, 2, 3, 4, or 16.");
        return;
      }

      setProcessing(true);
      setProgress(0);
      setError(null);
      setResultUrl(null);
      setDurationMs(null);
      abortRef.current = false;

      try {
        const img = await fileToImage(file);
        const startTs = performance.now();

        const runPass = async (
          inputImg: HTMLImageElement,
          progressMapper: (p: number) => void
        ) => {
          const tileSize = computeTileSize(inputImg);
          console.log(
            `Image size: ${inputImg.width}x${inputImg.height}, using tile size: ${tileSize}`
          );
          return runTiledInference(
            session,
            inputImg,
            tileSize,
            progressMapper,
            () => abortRef.current
          );
        };

        let url: string | null = null;

        if (targetScale === 16) {
          url = await runPass(img, (p) => setProgress(p * 0.5));
          if (!url) {
            setError("Upscaling cancelled");
            setDurationMs(performance.now() - startTs);
            return;
          }

          const midImg = await dataUrlToImage(url);
          url = await runPass(midImg, (p) => setProgress(50 + p * 0.5));
        } else {
          url = await runPass(img, setProgress);
        }

        if (url) {
          let finalUrl = url;

          if (targetScale !== SCALE && targetScale !== 16) {
            const upscaledImg = await dataUrlToImage(url);
            const ratio = targetScale / SCALE;
            const downCanvas = document.createElement("canvas");
            downCanvas.width = upscaledImg.width * ratio;
            downCanvas.height = upscaledImg.height * ratio;
            const downCtx = downCanvas.getContext("2d");
            if (!downCtx)
              throw new Error("Could not get downscale canvas context");
            downCtx.imageSmoothingEnabled = true;
            downCtx.imageSmoothingQuality = "high";
            downCtx.drawImage(
              upscaledImg,
              0,
              0,
              upscaledImg.width,
              upscaledImg.height,
              0,
              0,
              downCanvas.width,
              downCanvas.height
            );
            finalUrl = downCanvas.toDataURL("image/png");
          }

          setResultUrl(finalUrl);
          setProgress(100);
          setDurationMs(performance.now() - startTs);
        } else {
          setError("Upscaling cancelled");
          setDurationMs(performance.now() - startTs);
        }
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(`Upscaling failed: ${errorMessage}`);
      } finally {
        setProcessing(false);
      }
    },
    [session, runTiledInference, computeTileSize]
  );

  const cancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  const clearResult = useCallback(() => {
    setResultUrl(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    loadModel,
    upscale,
    clearResult,
    cancel,
    modelLoading,
    processing,
    progress,
    error,
    resultUrl,
    durationMs,
    currentModelPath,
    executionProvider,
    availableModels: LOCAL_MODELS,
  };
};
