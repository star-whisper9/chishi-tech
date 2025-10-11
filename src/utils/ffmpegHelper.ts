/**
 * FFmpeg WORKERFS 支持检测和辅助函数
 */

import { FFFSType, type FFmpeg } from "@ffmpeg/ffmpeg";

/**
 * 静态环境检查：检查浏览器是否具备 WORKERFS 的基本要求
 */
function staticCheckWorkerFS(): boolean {
  try {
    // 检查 File API
    if (typeof File === "undefined") {
      console.warn("[WORKERFS] File API 不支持");
      return false;
    }

    // 检查 Worker
    if (typeof Worker === "undefined") {
      console.warn("[WORKERFS] Web Worker 不支持");
      return false;
    }

    // 检查是否在安全上下文中
    // WORKERFS 需要在安全上下文中运行
    if (typeof window !== "undefined" && !window.isSecureContext) {
      console.warn("[WORKERFS] 非安全上下文（需要 HTTPS 或 localhost）");
      return false;
    }

    console.log("[WORKERFS] 静态环境检查通过");
    return true;
  } catch (error) {
    console.error("[WORKERFS] 静态检查失败:", error);
    return false;
  }
}

/**
 * 动态探测：实际尝试挂载 WORKERFS 来确认是否真正可用
 */
async function probeWorkerFS(ffmpeg: FFmpeg): Promise<boolean> {
  const mountPoint = "/.probe-workerfs";
  try {
    // 创建测试目录
    await ffmpeg.createDir(mountPoint);

    // 构造一个极小的临时 File 进行验证
    const testData = new Uint8Array([0x01, 0x02, 0x03]);
    const blob = new Blob([testData], {
      type: "application/octet-stream",
    });
    const testFile = new File([blob], "probe.bin", {
      type: "application/octet-stream",
    });

    // 尝试挂载 WORKERFS
    await ffmpeg.mount(FFFSType.WORKERFS, { files: [testFile] }, mountPoint);

    // 尝试读取文件来验证挂载是否成功
    const data = (await ffmpeg.readFile(
      `${mountPoint}/probe.bin`
    )) as Uint8Array;
    const success = data && data.length === testData.length;

    // 清理
    await ffmpeg.unmount(mountPoint);
    await ffmpeg.deleteDir(mountPoint);

    console.log(`[WORKERFS] 动态探测${success ? "成功" : "失败"}`);
    return success;
  } catch (error) {
    console.warn("[WORKERFS] 动态探测失败:", error);
    // 清理现场，避免残留
    try {
      await ffmpeg.unmount(mountPoint).catch(() => {
        /* ignore */
      });
      await ffmpeg.deleteDir(mountPoint).catch(() => {
        /* ignore */
      });
    } catch {
      /* ignore cleanup errors */
    }
    return false;
  }
}

/**
 * 检测当前环境是否支持 WORKERFS
 * WORKERFS 允许 FFmpeg 直接读取 File 对象，而不需要将整个文件加载到内存中
 *
 * 检测策略：
 * 1. 静态检查：浏览器是否支持 File API、Worker、安全上下文
 * 2. 动态探测：实际尝试挂载 WORKERFS 并读取测试文件
 *
 * @param ffmpeg - 已加载的 FFmpeg 实例
 * @returns Promise<boolean> - 是否支持 WORKERFS
 */
export async function isWorkerFSSupported(ffmpeg: FFmpeg): Promise<boolean> {
  try {
    // 先进行静态检查
    if (!staticCheckWorkerFS()) {
      return false;
    }

    // 再进行动态探测
    return await probeWorkerFS(ffmpeg);
  } catch (error) {
    console.error("[WORKERFS] 支持检测失败:", error);
    return false;
  }
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/);
  return match ? match[0] : "";
}

/**
 * 获取 MIME 类型
 */
export function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    mp4: "video/mp4",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
    gif: "image/gif",
  };
  return mimeTypes[format] || "video/mp4";
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
