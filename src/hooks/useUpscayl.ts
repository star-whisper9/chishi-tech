import { useState, useCallback, useRef } from "react";
import { CONSTS } from "../config/consts";

export type UpscaylStatus =
  | "idle"
  | "uploading"
  | "queued"
  | "processing"
  | "success"
  | "failure";

export interface UpscaylModel {
  req_name: string; // 请求时使用的字段
  name: string; // 显示名称
  description: string; // 描述
}

export interface UpscaylResponse {
  requestId: string;
  status: "processing" | "queued";
  position: number;
}

export interface QueueStatus {
  requestId: string;
  status: "queued" | "processing" | "success" | "failure" | "unknown";
  position: number | null;
  resultUrl?: string;
  error?: string;
}

export interface UseUpscaylReturn {
  // 状态
  status: UpscaylStatus;
  isLoading: boolean;
  progress: number | null; // 队列位置或进度
  error: string | null;
  apiKey: string;
  models: UpscaylModel[];
  selectedModel: string;
  scale: number;
  selectedFile: File | null;
  previewUrl: string | null;
  resultUrl: string | null;
  requestId: string | null;

  // 方法
  setApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
  setScale: (scale: number) => void;
  fetchModels: () => Promise<void>;
  handleFileSelect: (file: File | null) => void;
  uploadAndUpscale: () => Promise<void>;
  cancelUpscale: () => void;
  clearResult: () => void;
  clearError: () => void;
  downloadResult: () => void;
}

export const useUpscayl = (): UseUpscaylReturn => {
  const [status, setStatus] = useState<UpscaylStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [models, setModels] = useState<UpscaylModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    CONSTS.UPSCAYL.DEFAULT_MODEL
  );
  const [scale, setScale] = useState<number>(CONSTS.UPSCAYL.DEFAULT_SCALE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef<number>(0);

  /**
   * 获取可用模型列表
   */
  const fetchModels = useCallback(async () => {
    if (!apiKey) {
      setError("请先输入 API Key");
      return;
    }

    try {
      const response = await fetch(`${CONSTS.UPSCAYL.API_BASE_URL}/models`, {
        headers: {
          "x-api-key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`获取模型列表失败: ${response.status}`);
      }

      const data = await response.json();

      // 后端返回的是 { models: [...] } 结构
      const modelList: UpscaylModel[] = Array.isArray(data?.models)
        ? data.models
        : [];

      setModels(modelList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取模型列表失败");
      console.error("Failed to fetch models:", err);
    }
  }, [apiKey]);

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback(
    (file: File | null) => {
      // 清理旧预览
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      if (!file) {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        return;
      }

      // 验证文件类型
      const supportedFormats = CONSTS.UPSCAYL
        .SUPPORTED_FORMATS as readonly string[];
      if (!supportedFormats.includes(file.type)) {
        setError(
          `不支持的文件格式。请选择 ${CONSTS.UPSCAYL.SUPPORTED_EXTENSIONS.join(
            ", "
          )} 格式的图片`
        );
        return;
      }

      // 验证文件大小
      if (file.size > CONSTS.UPSCAYL.MAX_FILE_SIZE_BYTES) {
        setError(
          `文件大小超过限制 (${(
            CONSTS.UPSCAYL.MAX_FILE_SIZE_BYTES /
            1024 /
            1024
          ).toFixed(0)} MiB)`
        );
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    },
    [previewUrl]
  );

  /**
   * 轮询队列状态
   */
  const pollQueueStatus = useCallback(
    async (reqId: string) => {
      if (pollCountRef.current >= CONSTS.UPSCAYL.MAX_POLL_COUNT) {
        setError("请求超时，请稍后重试");
        setStatus("failure");
        return;
      }

      pollCountRef.current++;

      try {
        const response = await fetch(
          `${CONSTS.UPSCAYL.API_BASE_URL}/queue/${reqId}`,
          {
            headers: {
              "x-api-key": apiKey,
            },
            signal: abortControllerRef.current?.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`查询状态失败: ${response.status}`);
        }

        const data: QueueStatus = await response.json();

        switch (data.status) {
          case "queued":
            setStatus("queued");
            setProgress(data.position ?? null);
            break;
          case "processing":
            setStatus("processing");
            setProgress(0);
            break;
          case "success":
            setStatus("success");
            setProgress(null);
            // 结果 URL 需要携带 API Key 作为查询参数或通过其他方式获取
            // 由于图片需要鉴权，我们需要先 fetch 获取 blob，然后创建本地 URL
            try {
              const imageResponse = await fetch(
                `${CONSTS.UPSCAYL.API_BASE_URL}/result/${reqId}`,
                {
                  headers: {
                    "x-api-key": apiKey,
                  },
                }
              );
              if (!imageResponse.ok) {
                throw new Error("获取结果失败");
              }
              const blob = await imageResponse.blob();
              const url = URL.createObjectURL(blob);
              setResultUrl(url);
            } catch (err) {
              setError(err instanceof Error ? err.message : "获取结果失败");
              setStatus("failure");
            }
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            return;
          case "failure":
            setStatus("failure");
            setError(data.error || "放大失败");
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            return;
          case "unknown":
            setStatus("failure");
            setError("未知的请求 ID");
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            return;
        }

        // 继续轮询
        if (data.status === "queued" || data.status === "processing") {
          pollIntervalRef.current = setTimeout(
            () => pollQueueStatus(reqId),
            CONSTS.UPSCAYL.POLL_INTERVAL_MS
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.log("Polling cancelled");
          return;
        }
        setError(err instanceof Error ? err.message : "查询状态失败");
        setStatus("failure");
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    },
    [apiKey]
  );

  /**
   * 上传并开始放大
   */
  const uploadAndUpscale = useCallback(async () => {
    if (!apiKey) {
      setError("请输入 API Key");
      return;
    }

    if (!selectedFile) {
      setError("请选择图片文件");
      return;
    }

    // 重置状态
    setError(null);
    setStatus("uploading");
    setProgress(null);
    setResultUrl(null);
    pollCountRef.current = 0;

    // 创建 AbortController
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("model", selectedModel);
      formData.append("scale", scale.toString());

      const response = await fetch(`${CONSTS.UPSCAYL.API_BASE_URL}/upscale`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
        },
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json().catch(() => ({}));
          const retryAfter = data.retryAfterMs
            ? `请在 ${(data.retryAfterMs / 1000).toFixed(0)} 秒后重试`
            : "";
          throw new Error(`请求过于频繁 (429)。${retryAfter}`);
        }
        throw new Error(`上传失败: ${response.status}`);
      }

      const data: UpscaylResponse = await response.json();
      setRequestId(data.requestId);

      // 根据返回状态开始轮询
      if (data.status === "queued") {
        setStatus("queued");
        setProgress(data.position);
      } else if (data.status === "processing") {
        setStatus("processing");
        setProgress(0);
      }

      // 开始轮询队列状态
      pollQueueStatus(data.requestId);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Upload cancelled");
        setStatus("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "上传失败");
      setStatus("failure");
    }
  }, [apiKey, selectedFile, selectedModel, scale, pollQueueStatus]);

  /**
   * 取消放大
   */
  const cancelUpscale = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setStatus("idle");
    setProgress(null);
    setError(null);
  }, []);

  /**
   * 清理结果
   */
  const clearResult = useCallback(() => {
    setStatus("idle");
    setResultUrl(null);
    setRequestId(null);
    setProgress(null);
    setError(null);
  }, []);

  /**
   * 清理错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 下载结果
   */
  const downloadResult = useCallback(() => {
    if (!resultUrl || !requestId) return;

    // 使用 fetch 获取带鉴权的图片
    fetch(`${CONSTS.UPSCAYL.API_BASE_URL}/result/${requestId}`, {
      headers: {
        "x-api-key": apiKey,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("下载失败");
        }
        return response.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `upscaled_${selectedFile?.name || "image.png"}`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "下载失败");
      });
  }, [resultUrl, requestId, apiKey, selectedFile]);

  const isLoading =
    status === "uploading" || status === "queued" || status === "processing";

  return {
    status,
    isLoading,
    progress,
    error,
    apiKey,
    models,
    selectedModel,
    scale,
    selectedFile,
    previewUrl,
    resultUrl,
    requestId,
    setApiKey,
    setSelectedModel,
    setScale,
    fetchModels,
    handleFileSelect,
    uploadAndUpscale,
    cancelUpscale,
    clearResult,
    clearError,
    downloadResult,
  };
};
