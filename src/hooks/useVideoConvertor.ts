import { useState, useRef, useCallback } from "react";
import { FFFSType, FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { CONSTS } from "../config/consts";
import {
  isWorkerFSSupported,
  getMimeType,
  getFileExtension,
} from "../utils/ffmpegHelper";

export type OutputFormat = "mp4" | "mov" | "mkv" | "gif";

export interface ConversionProgress {
  ratio: number; // 0-1
  time: number; // 已处理的时间（秒）
  speed: string; // 处理速度
}

export interface GifConfig {
  fps: number; // 帧率 (1-30)
  width: number; // 宽度 (最大1920)
  maxDuration?: number; // 最大时长（秒），避免超出帧数限制
}

export interface UseVideoConvertorReturn {
  isLoading: boolean;
  isConverting: boolean;
  progress: ConversionProgress | null;
  error: string | null;
  outputFile: { url: string; name: string } | null;
  previewUrl: string | null;
  supportsWorkerFS: boolean; // 是否支持 WORKERFS
  loadFFmpeg: () => Promise<void>;
  convertVideo: (
    file: File,
    outputFormat: OutputFormat,
    gifConfig?: GifConfig
  ) => Promise<void>;
  cancelConversion: () => void; // 取消转换
  clearOutput: () => void;
  clearError: () => void;
  getPreviewUrl: (file: File) => string;
  revokePreviewUrl: (url: string) => void;
}

export const useVideoConvertor = (): UseVideoConvertorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputFile, setOutputFile] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [supportsWorkerFS, setSupportsWorkerFS] = useState(false);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const isLoadedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 加载 FFmpeg
   */
  const loadFFmpeg = useCallback(async () => {
    if (isLoadedRef.current && ffmpegRef.current) {
      return; // 已经加载过
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseURL = CONSTS.CDN_PACKAGES.FFMPEG;
      const ffmpeg = new FFmpeg();

      // 监听日志
      ffmpeg.on("log", ({ message }) => {
        console.log("[FFmpeg]", message);
      });

      // 监听进度
      ffmpeg.on("progress", ({ progress, time }) => {
        setProgress({
          ratio: progress,
          time,
          speed: `${(progress * 100).toFixed(1)}%`,
        });
      });

      // 加载 FFmpeg 核心
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });

      ffmpegRef.current = ffmpeg;
      isLoadedRef.current = true;
      console.log("FFmpeg 加载成功");

      // FFmpeg 加载完成后，检测 WORKERFS 支持
      console.log("[WORKERFS] 开始检测支持...");
      const workerFSSupported = await isWorkerFSSupported(ffmpeg);
      setSupportsWorkerFS(workerFSSupported);

      if (workerFSSupported) {
        console.log("[WORKERFS] ✅ 支持！将在处理时优先使用 WORKERFS 模式");
      } else {
        console.log("[WORKERFS] ❌ 不支持，将使用 RAM 模式");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "加载 FFmpeg 失败";
      setError(errorMessage);
      console.error("加载 FFmpeg 失败:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 清除输出文件
   */
  const clearOutput = useCallback(() => {
    if (outputFile?.url) {
      URL.revokeObjectURL(outputFile.url);
    }
    setOutputFile(null);
  }, [outputFile]);

  /**
   * 转换视频
   */
  const convertVideo = useCallback(
    async (file: File, outputFormat: OutputFormat, gifConfig?: GifConfig) => {
      if (!ffmpegRef.current || !isLoadedRef.current) {
        setError("FFmpeg 尚未加载，请先加载");
        return;
      }

      // 创建新的 AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsConverting(true);
      setError(null);
      setProgress(null);

      // 清除之前的输出
      if (outputFile?.url) {
        URL.revokeObjectURL(outputFile.url);
      }
      setOutputFile(null);

      // 决定是否使用 WORKERFS：如果支持就使用，无论文件大小
      const useWorkerFS = supportsWorkerFS;

      try {
        const ffmpeg = ffmpegRef.current;
        const inputFileName = "input" + getFileExtension(file.name);
        const outputFileName = `output.${outputFormat}`;

        if (useWorkerFS) {
          // 使用 WORKERFS 模式：挂载文件，无需加载到内存
          console.log("[WORKERFS] 使用 WORKERFS 模式处理大文件...");

          const inputDir = "/input";
          const inputFilePath = `${inputDir}/${file.name}`;

          try {
            // 创建输入目录
            await ffmpeg.createDir(inputDir);

            // 挂载 WORKERFS
            await ffmpeg.mount(FFFSType.WORKERFS, { files: [file] }, inputDir);

            // 执行转换（带 AbortSignal）
            console.log("开始转换...");
            const args = getFFmpegArgs(
              inputFilePath,
              outputFileName,
              outputFormat,
              gifConfig
            );
            await ffmpeg.exec(args, undefined, {
              signal: abortController.signal,
            });

            // 卸载和清理
            await ffmpeg.unmount(inputDir);
            await ffmpeg.deleteDir(inputDir);
          } catch (err) {
            // 如果 WORKERFS 失败，尝试清理
            try {
              await ffmpeg.unmount(inputDir).catch(() => {});
              await ffmpeg.deleteDir(inputDir).catch(() => {});
            } catch {
              // 忽略清理错误
            }
            throw err;
          }
        } else {
          // 使用传统 RAM 模式：将文件写入内存文件系统
          console.log("[RAM] 使用传统 RAM 模式...");

          // 写入输入文件
          console.log("写入输入文件...");
          await ffmpeg.writeFile(inputFileName, await fetchFile(file));

          // 执行转换（带 AbortSignal）
          console.log("开始转换...");
          const args = getFFmpegArgs(
            inputFileName,
            outputFileName,
            outputFormat,
            gifConfig
          );
          await ffmpeg.exec(args, undefined, {
            signal: abortController.signal,
          });

          // 清理输入文件
          await ffmpeg.deleteFile(inputFileName);
        }

        // 读取输出文件（两种模式都写到 MEMFS）
        console.log("读取输出文件...");
        const data = await ffmpeg.readFile(outputFileName);

        // 创建 Blob URL
        const blob = new Blob([data as BlobPart], {
          type: getMimeType(outputFormat),
        });
        const url = URL.createObjectURL(blob);

        // 生成输出文件名
        const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        const outputName = `${originalNameWithoutExt}.${outputFormat}`;

        setOutputFile({ url, name: outputName });
        console.log(`转换成功 (使用 ${useWorkerFS ? "WORKERFS" : "RAM"} 模式)`);

        // 清理输出文件
        await ffmpeg.deleteFile(outputFileName);
      } catch (err) {
        // 检查是否是用户取消
        if (err instanceof DOMException && err.name === "AbortError") {
          console.log("转换已被用户取消");
          setError("转换已取消");
        } else {
          const errorMessage =
            err instanceof Error ? err.message : "视频转换失败";
          setError(errorMessage);
          console.error("视频转换失败:", err);
        }
      } finally {
        setIsConverting(false);
        setProgress(null);
        abortControllerRef.current = null;
      }
    },
    [outputFile, supportsWorkerFS]
  );

  /**
   * 取消转换
   */
  const cancelConversion = useCallback(() => {
    if (abortControllerRef.current && isConverting) {
      console.log("正在取消转换...");
      abortControllerRef.current.abort();
    }
  }, [isConverting]);

  /**
   * 获取视频预览 URL
   */
  const getPreviewUrl = useCallback((file: File): string => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return url;
  }, []);

  /**
   * 释放预览 URL
   */
  const revokePreviewUrl = useCallback(
    (url: string) => {
      URL.revokeObjectURL(url);
      if (previewUrl === url) {
        setPreviewUrl(null);
      }
    },
    [previewUrl]
  );

  /**
   * 清除错误信息
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    isConverting,
    progress,
    error,
    outputFile,
    previewUrl,
    supportsWorkerFS,
    loadFFmpeg,
    convertVideo,
    cancelConversion,
    clearOutput,
    clearError,
    getPreviewUrl,
    revokePreviewUrl,
  };
};

/**
 * 获取 FFmpeg 转换参数
 */
function getFFmpegArgs(
  inputFile: string,
  outputFile: string,
  format: OutputFormat,
  gifConfig?: GifConfig
): string[] {
  // 基础参数
  const baseArgs = ["-i", inputFile];

  // 根据格式添加特定参数
  let codecArgs: string[] = [];

  switch (format) {
    case "mp4":
    case "mov":
      // H.264 编码，AAC 音频
      codecArgs = [
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "23",
        "-c:a",
        "aac",
      ];
      break;
    case "mkv":
      // H.265 编码，AAC 音频
      codecArgs = [
        "-c:v",
        "libx265",
        "-preset",
        "medium",
        "-crf",
        "24",
        "-c:a",
        "aac",
      ];
      break;
    case "gif": {
      // GIF 转换（使用配置或默认值）
      const fps = gifConfig?.fps || CONSTS.VIDEO_CONVERTOR.DEFAULT_WIDTH / 48; // 默认10fps
      const width = gifConfig?.width || CONSTS.VIDEO_CONVERTOR.DEFAULT_WIDTH;

      // 构建滤镜链
      let filters = `fps=${Math.min(fps, CONSTS.VIDEO_CONVERTOR.MAX_FPS)}`;
      filters += `,scale=${Math.min(
        width,
        CONSTS.VIDEO_CONVERTOR.MAX_WIDTH
      )}:-1:flags=lanczos`;

      // 如果设置了最大时长，添加时长限制
      if (gifConfig?.maxDuration) {
        const maxFrames = CONSTS.VIDEO_CONVERTOR.MAX_FRAMES;
        const actualMaxDuration = maxFrames / fps;
        const duration = Math.min(gifConfig.maxDuration, actualMaxDuration);
        codecArgs = ["-t", duration.toString()];
      }

      codecArgs = [...codecArgs, "-vf", filters];
      break;
    }
    default:
      codecArgs = ["-c:v", "copy", "-c:a", "copy"];
  }

  return [...baseArgs, ...codecArgs, outputFile];
}
