import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONSTS } from "../../config/consts";

// TODO: 增加每关键帧有概率损坏
// TODO: 增加更多格式支持

export type BadVideoStatus =
  | "idle"
  | "processing"
  | "done"
  | "error"
  | "cancelled";

export interface UseBadVideoResult {
  status: BadVideoStatus;
  progress: number; // 0..1
  error: string | null;
  outputUrl: string | null;
  file: File | null;
  percent: number; // 0..1
  setPercent: (v: number) => void;
  selectFile: (file: File | null) => void;
  start: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export default function useBadVideo(): UseBadVideoResult {
  const [status, setStatus] = useState<BadVideoStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [percent, setPercent] = useState<number>(CONSTS.BADVIDEO.MIN_PERCENT);

  const workerRef = useRef<Worker | null>(null);
  const currentBufferRef = useRef<ArrayBuffer | null>(null);

  const busy = status === "processing";

  const clampPercent = useCallback((p: number) => {
    const min = CONSTS.BADVIDEO.MIN_PERCENT;
    const max = CONSTS.BADVIDEO.MAX_PERCENT;
    return Math.min(max, Math.max(min, p));
  }, []);

  const cleanupOutputUrl = useCallback(() => {
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
    }
    setOutputUrl(null);
  }, [outputUrl]);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const cleanupBuffer = useCallback(() => {
    currentBufferRef.current = null; // GC hint
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    cleanupOutputUrl();
    cleanupBuffer();
    terminateWorker();
  }, [cleanupBuffer, cleanupOutputUrl, terminateWorker]);

  const selectFile = useCallback(
    (f: File | null) => {
      // When file changes, reset outputs
      setFile(f);
      setError(null);
      setProgress(0);
      cleanupOutputUrl();
    },
    [cleanupOutputUrl]
  );

  const start = useCallback(async () => {
    if (!file) {
      setError("请先选择 MP4 文件。");
      return;
    }
    if (busy) return;

    if (file.size > CONSTS.BADVIDEO.MAX_FILE_SIZE_BYTES) {
      setError(
        `文件过大，最大允许 ${(
          CONSTS.BADVIDEO.MAX_FILE_SIZE_BYTES /
          (1024 * 1024)
        ).toFixed(0)} MB。`
      );
      return;
    }
    const name = file.name.toLowerCase();
    const isMp4 = file.type === "video/mp4" || name.endsWith(".mp4");
    if (!isMp4) {
      setError("仅支持 MP4 文件。");
      return;
    }

    setStatus("processing");
    setProgress(0);
    setError(null);
    cleanupOutputUrl();

    // Read file into ArrayBuffer and transfer to worker
    const buf = await file.arrayBuffer();
    currentBufferRef.current = buf;

    const worker = new Worker(new URL("./corruptWorker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    type ProgressEvt = { type: "progress"; value: number };
    type DoneEvt = { type: "done"; buffer: ArrayBuffer };
    type ErrorEvt = { type: "error"; message: string };
    type CancelledEvt = { type: "cancelled" };
    type InEvt = ProgressEvt | DoneEvt | ErrorEvt | CancelledEvt;

    worker.onmessage = (e: MessageEvent<InEvt>) => {
      const data = e.data;
      if (data?.type === "progress") {
        setProgress(Math.max(0, Math.min(1, Number(data.value) || 0)));
      } else if (data?.type === "done") {
        // data.buffer is transferred back
        const out = new Blob([data.buffer], { type: "video/mp4" });
        const url = URL.createObjectURL(out);
        setOutputUrl(url);
        setStatus("done");
        setProgress(1);
        cleanupBuffer();
        terminateWorker();
      } else if (data?.type === "error") {
        setError(data.message || "处理失败");
        setStatus("error");
        cleanupBuffer();
        terminateWorker();
      } else if (data?.type === "cancelled") {
        setStatus("cancelled");
        cleanupBuffer();
        terminateWorker();
      }
    };

    worker.onerror = (ev: ErrorEvent) => {
      setError(ev.message ?? "Worker 错误");
      setStatus("error");
      cleanupBuffer();
      terminateWorker();
    };

    worker.postMessage(
      { type: "start", buffer: buf, percent: clampPercent(percent) } as const,
      [buf]
    );
  }, [
    busy,
    clampPercent,
    cleanupOutputUrl,
    file,
    percent,
    terminateWorker,
    cleanupBuffer,
  ]);

  const cancel = useCallback(() => {
    if (workerRef.current) {
      try {
        workerRef.current.postMessage({ type: "cancel" } as const);
      } catch {
        /* ignore */
      }
      // 也可直接终止
      terminateWorker();
      setStatus("cancelled");
      setProgress(0);
      cleanupBuffer();
    }
  }, [terminateWorker, cleanupBuffer]);

  // Cleanup on page unload: terminate worker and drop buffer.
  // 注意：不要在 effect 的 cleanup 中主动调用处理函数，避免 React StrictMode 的
  // 挂载/卸载探测导致状态被意外清理（表现为下载按钮状态回退、进度归零）。
  useEffect(() => {
    const onBeforeUnload = () => {
      // 在页面真正卸载前释放重资源；对象 URL 在页面卸载时由浏览器回收即可。
      terminateWorker();
      cleanupBuffer();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      // 切勿在此处调用 onBeforeUnload()
    };
  }, [terminateWorker, cleanupBuffer]);

  return useMemo(
    () => ({
      status,
      progress,
      error,
      outputUrl,
      file,
      percent,
      setPercent: (v: number) => setPercent(clampPercent(v)),
      selectFile,
      start,
      cancel,
      reset,
    }),
    [
      status,
      progress,
      error,
      outputUrl,
      file,
      percent,
      clampPercent,
      selectFile,
      start,
      cancel,
      reset,
    ]
  );
}
