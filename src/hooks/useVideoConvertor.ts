import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { CONSTS } from "../config/consts";

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
  loadFFmpeg: () => Promise<void>;
  convertVideo: (
    file: File,
    outputFormat: OutputFormat,
    gifConfig?: GifConfig
  ) => Promise<void>;
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

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const isLoadedRef = useRef(false);

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

      setIsConverting(true);
      setError(null);
      setProgress(null);

      // 清除之前的输出
      if (outputFile?.url) {
        URL.revokeObjectURL(outputFile.url);
      }
      setOutputFile(null);

      try {
        const ffmpeg = ffmpegRef.current;
        const inputFileName = "input" + getFileExtension(file.name);
        const outputFileName = `output.${outputFormat}`;

        // 写入输入文件
        console.log("写入输入文件...");
        await ffmpeg.writeFile(inputFileName, await fetchFile(file));

        // 执行转换
        console.log("开始转换...");
        const args = getFFmpegArgs(
          inputFileName,
          outputFileName,
          outputFormat,
          gifConfig
        );
        await ffmpeg.exec(args);

        // 读取输出文件
        console.log("读取输出文件...");
        const data = await ffmpeg.readFile(outputFileName);

        // 创建 Blob URL
        // @ts-expect-error ffmpeg.wasm 类型定义问题，data 实际上是 Uint8Array
        const blob = new Blob([data], { type: getMimeType(outputFormat) });
        const url = URL.createObjectURL(blob);

        // 生成输出文件名
        const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        const outputName = `${originalNameWithoutExt}.${outputFormat}`;

        setOutputFile({ url, name: outputName });
        console.log("转换成功");

        // 清理 FFmpeg 内存中的文件
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "视频转换失败";
        setError(errorMessage);
        console.error("视频转换失败:", err);
      } finally {
        setIsConverting(false);
        setProgress(null);
      }
    },
    [outputFile]
  );

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
    loadFFmpeg,
    convertVideo,
    clearOutput,
    clearError,
    getPreviewUrl,
    revokePreviewUrl,
  };
};

/**
 * 获取文件扩展名
 */
function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/);
  return match ? match[0] : "";
}

/**
 * 获取 MIME 类型
 */
function getMimeType(format: OutputFormat): string {
  const mimeTypes: Record<OutputFormat, string> = {
    mp4: "video/mp4",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
    gif: "image/gif",
  };
  return mimeTypes[format] || "video/mp4";
}

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
