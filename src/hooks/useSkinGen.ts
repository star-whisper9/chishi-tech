import { useState, useCallback, useRef, useEffect } from "react";
import { CONSTS } from "../config/consts";
import { STORAGE_KEYS } from "../config/storageKeys";

export type SkinGenStatus =
  | "idle"
  | "submitting"
  | "queued"
  | "running"
  | "cancelling"
  | "done"
  | "failed";

export interface GenerateResponse {
  task_id: string;
  status: "queued";
  position: number;
  message: string;
}

export interface TaskStatus {
  task_id: string;
  status: "queued" | "running" | "done" | "failed" | "cancelled";
  created_at: number;
  position?: number;
  download_url?: string;
  error?: string;
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

  setPrompt: (v: string) => void;
  setInviteCode: (v: string) => void;
  submit: () => Promise<void>;
  cancel: () => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
  downloadResult: () => void;
  firstPollPending: boolean;
}

export const useSkinGen = (): UseSkinGenReturn => {
  const [status, setStatus] = useState<SkinGenStatus>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);
  const cancellingRef = useRef(false);
  const [firstPollPending, setFirstPollPending] = useState(false);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const clearTaskStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.SKIN_GEN_TASK_ID);
  }, []);

  const resetCancelling = useCallback(() => {
    cancellingRef.current = false;
  }, []);

  const poll = useCallback(
    async (id: string) => {
      if (pollCountRef.current >= CONSTS.SKIN_GEN.MAX_POLL_COUNT) {
        setError("轮询超时，请稍后重试");
        setStatus("failed");
        resetCancelling();
        clearTaskStorage();
        return;
      }
      pollCountRef.current++;

      try {
        const resp = await fetch(
          `${CONSTS.SKIN_GEN.API_BASE_URL}/task/${id}`,
          { signal: abortRef.current?.signal, credentials: "include" },
        );

        if (!resp.ok) {
          if (resp.status === 404) {
            setError("任务已过期或不存在");
            setStatus("failed");
            resetCancelling();
            clearTaskStorage();
            return;
          }
          throw new Error(`查询状态失败: ${resp.status}`);
        }

        const data: TaskStatus = await resp.json();
        setFirstPollPending(false);
        setCreatedAt(data.created_at);
        localStorage.setItem(STORAGE_KEYS.SKIN_GEN_CREATED_AT, String(data.created_at));

        switch (data.status) {
          case "queued":
            if (!cancellingRef.current) {
              setStatus("queued");
            }
            setPosition(data.position ?? null);
            break;
          case "running":
            if (!cancellingRef.current) {
              setStatus("running");
            }
            setPosition(null);
            break;
          case "done": {
            setStatus("done");
            setPosition(null);
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
            clearTaskStorage();
            return;
          }
          case "failed":
          case "cancelled":
            setStatus("failed");
            setError(data.error || "生成失败");
            resetCancelling();
            clearTaskStorage();
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
        resetCancelling();
      }
    },
    [clearTaskStorage, resetCancelling],
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
    resetCancelling();
    setFirstPollPending(true);
    pollCountRef.current = 0;

    const nowSec = Math.floor(Date.now() / 1000);
    setCreatedAt(nowSec);
    localStorage.setItem(STORAGE_KEYS.SKIN_GEN_CREATED_AT, String(nowSec));

    abortRef.current = new AbortController();

    try {
      const body: Record<string, string> = { prompt: trimmed };
      if (inviteCode.trim()) {
        body.invite_code = inviteCode.trim();
      }

      const resp = await fetch(
        `${CONSTS.SKIN_GEN.API_BASE_URL}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
          credentials: "include",
        },
      );

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
          throw new Error(
            (data.detail as string) || "请求参数无效",
          );
        }
        throw new Error(`提交失败: ${resp.status}`);
      }

      const data: GenerateResponse = await resp.json();
      setTaskId(data.task_id);
      setStatus("queued");
      setPosition(data.position);
      localStorage.setItem(STORAGE_KEYS.SKIN_GEN_TASK_ID, data.task_id);

      poll(data.task_id);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "提交失败");
      setStatus("failed");
    }
  }, [prompt, inviteCode, poll, resetCancelling]);

  const requestCancel = useCallback(async (id: string) => {
    try {
      const resp = await fetch(
        `${CONSTS.SKIN_GEN.API_BASE_URL}/task/${id}`,
        { method: "DELETE", credentials: "include" },
      );

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
        clearTaskStorage();
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
  }, [stopPolling, clearTaskStorage, resetCancelling, poll]);

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
      clearTaskStorage();
      localStorage.removeItem(STORAGE_KEYS.SKIN_GEN_CREATED_AT);
      return;
    }

    if ((status === "queued" || status === "running") && taskId) {
      await requestCancel(taskId);
      return;
    }
  }, [status, taskId, stopPolling, clearTaskStorage, resetCancelling, requestCancel]);

  const clearResult = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resetCancelling();
    setStatus("idle");
    setResultUrl(null);
    setTaskId(null);
    setPosition(null);
    setError(null);
    setCreatedAt(null);
    localStorage.removeItem(STORAGE_KEYS.SKIN_GEN_CREATED_AT);
  }, [resultUrl, resetCancelling]);

  const clearError = useCallback(() => setError(null), []);

  const downloadResult = useCallback(() => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `skin_${taskId || Date.now()}.png`;
    a.click();
  }, [resultUrl, taskId]);

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.SKIN_GEN_TASK_ID);
    if (!savedId) return;

    const savedCreatedAt = localStorage.getItem(STORAGE_KEYS.SKIN_GEN_CREATED_AT);
    if (savedCreatedAt) {
      setCreatedAt(Number(savedCreatedAt));
    }

    setTaskId(savedId);
    setStatus("queued");
    pollCountRef.current = 0;
    abortRef.current = new AbortController();

    poll(savedId);

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
    setPrompt,
    setInviteCode,
    submit,
    cancel,
    clearResult,
    clearError,
    downloadResult,
    firstPollPending,
    createdAt,
  };
};
