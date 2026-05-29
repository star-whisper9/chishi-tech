import { useState, useCallback, useRef, useEffect } from "react";
import { CONSTS } from "../config/consts";
import { STORAGE_KEYS } from "../config/storageKeys";

export type SkinGenStatus =
  | "idle"
  | "submitting"
  | "queued"
  | "running"
  | "cancelling"
  | "cancelled"
  | "done"
  | "failed";

export interface SkinGenHistoryItem {
  taskId: string;
  prompt: string;
  status: Exclude<SkinGenStatus, "idle" | "submitting" | "cancelling">;
  createdAt: number;
  finishedAt: number | null;
  imageBase64: string | null;
}

export interface GenerateResponse {
  task_id: string;
  status: "queued";
  position: number;
  message: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: "queued" | "running" | "done" | "failed" | "cancelled";
  created_at: number;
  position?: number;
  download_url?: string;
  error?: string;
  expired?: boolean;
}

export interface CancelResponse {
  task_id: string;
  status: "cancelled" | "cancelling";
}

export interface UseSkinGenReturn {
  status: SkinGenStatus;
  isLoading: boolean;
  taskId: string | null;
  position: number | null;
  error: string | null;
  resultUrl: string | null;
  prompt: string;
  inviteCode: string;
  createdAt: number | null;
  finishedAt: number | null;
  history: SkinGenHistoryItem[];

  setPrompt: (v: string) => void;
  setInviteCode: (v: string) => void;
  submit: () => Promise<void>;
  cancel: () => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
  downloadResult: () => void;
  firstPollPending: boolean;
  deleteHistoryItem: (taskId: string) => void;
  loadHistoryTask: (taskId: string) => void;
}

const loadHistory = (): SkinGenHistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SKIN_GEN_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SkinGenHistoryItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const saveHistory = (history: SkinGenHistoryItem[]) => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.SKIN_GEN_HISTORY,
      JSON.stringify(history),
    );
  } catch {
    // localStorage 可能已满，静默失败
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("图片转 Base64 失败"));
    reader.readAsDataURL(blob);
  });
};

export const useSkinGen = (): UseSkinGenReturn => {
  const [status, setStatus] = useState<SkinGenStatus>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [history, setHistory] = useState<SkinGenHistoryItem[]>(loadHistory);
  const [firstPollPending, setFirstPollPending] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);
  const cancellingRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const resetCancelling = useCallback(() => {
    cancellingRef.current = false;
  }, []);

  const addHistoryItem = useCallback((item: SkinGenHistoryItem) => {
    setHistory((prev) => {
      const exists = prev.some((h) => h.taskId === item.taskId);
      const next = exists
        ? prev.map((h) => (h.taskId === item.taskId ? item : h))
        : [item, ...prev];
      const trimmed = next.slice(0, CONSTS.SKIN_GEN.MAX_HISTORY);
      saveHistory(trimmed);
      return trimmed;
    });
  }, []);

  const updateHistoryItem = useCallback(
    (id: string, updates: Partial<SkinGenHistoryItem>) => {
      setHistory((prev) => {
        const next = prev.map((item) =>
          item.taskId === id ? { ...item, ...updates } : item,
        );
        saveHistory(next);
        return next;
      });
    },
    [],
  );

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.taskId !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const poll = useCallback(
    async (id: string) => {
      if (pollCountRef.current >= CONSTS.SKIN_GEN.MAX_POLL_COUNT) {
        setError("轮询超时，请稍后重试");
        setStatus("failed");
        setFinishedAt(Math.floor(Date.now() / 1000));
        resetCancelling();
        updateHistoryItem(id, { status: "failed" });
        return;
      }
      pollCountRef.current++;

      try {
        const resp = await fetch(`${CONSTS.SKIN_GEN.API_BASE_URL}/task/${id}`, {
          signal: abortRef.current?.signal,
          credentials: "include",
        });

        if (!resp.ok) {
          if (resp.status === 404) {
            setError("任务已过期或不存在");
            setStatus("failed");
            setFinishedAt(Math.floor(Date.now() / 1000));
            resetCancelling();
            updateHistoryItem(id, { status: "failed" });
            return;
          }
          throw new Error(`查询状态失败: ${resp.status}`);
        }

        const data: TaskStatusResponse = await resp.json();
        setFirstPollPending(false);
        setCreatedAt(data.created_at);

        switch (data.status) {
          case "queued":
            if (!cancellingRef.current) {
              setStatus("queued");
            }
            setPosition(data.position ?? null);
            updateHistoryItem(id, { status: "queued" });
            break;
          case "running":
            if (!cancellingRef.current) {
              setStatus("running");
            }
            setPosition(null);
            updateHistoryItem(id, { status: "running" });
            break;
          case "done": {
            setStatus("done");
            setPosition(null);
            setFinishedAt(Math.floor(Date.now() / 1000));
            resetCancelling();

            const imgResp = await fetch(
              `${CONSTS.SKIN_GEN.API_BASE_URL}/download/${id}`,
              { signal: abortRef.current?.signal, credentials: "include" },
            );
            if (!imgResp.ok) {
              throw new Error("获取结果失败");
            }
            const blob = await imgResp.blob();
            const url = URL.createObjectURL(blob);
            setResultUrl(url);

            const base64 = await blobToBase64(blob);
            const finishedAt = Math.floor(Date.now() / 1000);
            updateHistoryItem(id, {
              status: "done",
              finishedAt,
              imageBase64: base64,
            });

            return;
          }
          case "failed":
          case "cancelled":
            setStatus("failed");
            setError(data.error || "生成失败");
            setFinishedAt(Math.floor(Date.now() / 1000));
            resetCancelling();
            updateHistoryItem(id, { status: data.status });
            return;
        }

        pollTimerRef.current = setTimeout(
          () => poll(id),
          CONSTS.SKIN_GEN.POLL_INTERVAL_MS,
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "查询状态失败");
        setStatus("failed");
        setFinishedAt(Math.floor(Date.now() / 1000));
        resetCancelling();
        updateHistoryItem(id, { status: "failed" });
      }
    },
    [resetCancelling, updateHistoryItem],
  );

  const submit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (trimmed.length < CONSTS.SKIN_GEN.PROMPT_MIN_LEN) {
      setError("请输入提示词");
      return;
    }
    if (trimmed.length > CONSTS.SKIN_GEN.PROMPT_MAX_LEN) {
      setError(`提示词不能超过 ${CONSTS.SKIN_GEN.PROMPT_MAX_LEN} 个字符`);
      return;
    }

    setError(null);
    setStatus("submitting");
    setPosition(null);
    setResultUrl(null);
    setFinishedAt(null);
    resetCancelling();
    setFirstPollPending(true);
    pollCountRef.current = 0;

    const nowSec = Math.floor(Date.now() / 1000);
    setCreatedAt(nowSec);

    abortRef.current = new AbortController();

    try {
      const body: Record<string, string> = { prompt: trimmed };
      if (inviteCode.trim()) {
        body.invite_code = inviteCode.trim();
      }

      const resp = await fetch(`${CONSTS.SKIN_GEN.API_BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
        credentials: "include",
      });

      if (!resp.ok) {
        if (resp.status === 403) throw new Error("邀请码无效");
        if (resp.status === 429) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(
            (data.detail as string) || "请求过于频繁，请稍后重试",
          );
        }
        if (resp.status === 400) {
          const data = await resp.json().catch(() => ({}));
          throw new Error((data.detail as string) || "请求参数无效");
        }
        throw new Error(`提交失败: ${resp.status}`);
      }

      const data: GenerateResponse = await resp.json();
      setTaskId(data.task_id);
      setStatus("queued");
      setPosition(data.position);

      const newItem: SkinGenHistoryItem = {
        taskId: data.task_id,
        prompt: trimmed,
        status: "queued",
        createdAt: nowSec,
        finishedAt: null,
        imageBase64: null,
      };
      addHistoryItem(newItem);

      poll(data.task_id);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "提交失败");
      setStatus("failed");
    }
  }, [prompt, inviteCode, poll, resetCancelling, addHistoryItem]);

  const requestCancel = useCallback(
    async (id: string) => {
      try {
        const resp = await fetch(`${CONSTS.SKIN_GEN.API_BASE_URL}/task/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!resp.ok) {
          if (resp.status === 400) {
            setError("该任务无法取消");
            return;
          }
          throw new Error(`取消失败: ${resp.status}`);
        }

        const data: CancelResponse = await resp.json();

        if (data.status === "cancelled") {
          stopPolling();
          resetCancelling();
          setStatus("failed");
          setError("用户取消");
          updateHistoryItem(id, { status: "cancelled" });
        } else if (data.status === "cancelling") {
          cancellingRef.current = true;
          stopPolling();
          pollCountRef.current = 0;
          setStatus("cancelling");
          poll(id);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "取消失败");
      }
    },
    [stopPolling, resetCancelling, updateHistoryItem, poll],
  );

  const cancel = useCallback(async () => {
    if (status === "submitting") {
      abortRef.current?.abort();
      abortRef.current = null;
      stopPolling();
      resetCancelling();
      setStatus("idle");
      setPosition(null);
      setError(null);
      setTaskId(null);
      setCreatedAt(null);
      setFinishedAt(null);
      return;
    }

    if ((status === "queued" || status === "running") && taskId) {
      await requestCancel(taskId);
      return;
    }
  }, [status, taskId, stopPolling, resetCancelling, requestCancel]);

  const clearResult = useCallback(() => {
    if (resultUrl && !resultUrl.startsWith("data:")) {
      URL.revokeObjectURL(resultUrl);
    }
    resetCancelling();
    setStatus("idle");
    setResultUrl(null);
    setTaskId(null);
    setPosition(null);
    setError(null);
    setCreatedAt(null);
    setFinishedAt(null);
  }, [resultUrl, resetCancelling]);

  const clearError = useCallback(() => setError(null), []);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `skin_${taskId || Date.now()}.png`;
    a.click();
  }, [resultUrl, taskId]);

  const loadHistoryTask = useCallback(
    (id: string) => {
      const item = history.find((h) => h.taskId === id);
      if (!item) return;

      stopPolling();
      abortRef.current?.abort();
      abortRef.current = null;
      resetCancelling();
      setError(null);
      setFirstPollPending(false);

      if (item.status === "queued" || item.status === "running") {
        setTaskId(item.taskId);
        setStatus(item.status);
        setCreatedAt(item.createdAt);
        setFinishedAt(null);
        setPrompt(item.prompt);
        setResultUrl(null);
        setPosition(null);
        pollCountRef.current = 0;
        abortRef.current = new AbortController();
        poll(item.taskId);
      } else if (item.status === "done") {
        setTaskId(item.taskId);
        setStatus("done");
        setCreatedAt(item.createdAt);
        setFinishedAt(item.finishedAt);
        setPrompt(item.prompt);
        setPosition(null);
        if (item.imageBase64) {
          setResultUrl(item.imageBase64);
        } else {
          setError("图片数据丢失");
          setStatus("failed");
        }
      }
    },
    [history, stopPolling, resetCancelling, poll],
  );

  useEffect(() => {
    const hist = loadHistory();
    const activeItem = hist.find(
      (h) => h.status === "queued" || h.status === "running",
    );

    if (activeItem) {
      setTaskId(activeItem.taskId);
      setStatus(activeItem.status);
      setCreatedAt(activeItem.createdAt);
      setPrompt(activeItem.prompt);
      setResultUrl(null);
      setPosition(null);
      setError(null);
      setFirstPollPending(true);
      pollCountRef.current = 0;
      abortRef.current = new AbortController();
      poll(activeItem.taskId);
    }

    return () => {
      abortRef.current?.abort();
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading =
    status === "submitting" ||
    status === "queued" ||
    status === "running" ||
    status === "cancelling";

  return {
    status,
    isLoading,
    taskId,
    position,
    error,
    resultUrl,
    prompt,
    inviteCode,
    createdAt,
    finishedAt,
    history,
    setPrompt,
    setInviteCode,
    submit,
    cancel,
    clearResult,
    clearError,
    downloadResult,
    firstPollPending,
    deleteHistoryItem,
    loadHistoryTask,
  };
};
