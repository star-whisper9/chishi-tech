/// <reference lib="webworker" />

// Dedicated worker for corrupting MP4 bytes within mdat boxes by a given percentage.
// Strategy: For each mdat region, sample count = floor(regionSize * p) unique positions
// using Floyd's algorithm (sampling without replacement), then flip one random bit at each position.

export type WorkerStartMessage = {
  type: "start";
  buffer: ArrayBuffer; // transferable
  percent: number; // 0-1
};

export type WorkerCancelMessage = { type: "cancel" };

export type WorkerMessage = WorkerStartMessage | WorkerCancelMessage;

export type WorkerProgressEvent = { type: "progress"; value: number }; // 0..1
export type WorkerDoneEvent = { type: "done"; buffer: ArrayBuffer };
export type WorkerErrorEvent = { type: "error"; message: string };
export type WorkerCancelledEvent = { type: "cancelled" };

type OutEvent =
  | WorkerProgressEvent
  | WorkerDoneEvent
  | WorkerErrorEvent
  | WorkerCancelledEvent;

let cancelled = false;

function post(e: OutEvent) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(e);
}

// Utilities
class RandomBuffer {
  private pool = new Uint32Array(0);
  private idx = 0;

  // Web Crypto 限制：每次 getRandomValues 最多 65536 字节
  private static readonly BYTES_LIMIT = 65536;
  private static readonly DEFAULT_UINT32_COUNT = RandomBuffer.BYTES_LIMIT / 4; // 16384

  private refill(uint32Count = RandomBuffer.DEFAULT_UINT32_COUNT) {
    if (uint32Count * 4 > RandomBuffer.BYTES_LIMIT) {
      uint32Count = RandomBuffer.DEFAULT_UINT32_COUNT;
    }
    this.pool = new Uint32Array(uint32Count);
    (self as unknown as DedicatedWorkerGlobalScope).crypto.getRandomValues(
      this.pool
    );
    this.idx = 0;
  }

  nextUint32(): number {
    if (this.idx >= this.pool.length) this.refill();
    return this.pool[this.idx++];
  }

  nextByte(): number {
    return this.nextUint32() & 0xff;
  }

  // inclusive [min, max]
  intInRange(min: number, max: number): number {
    const r = this.nextUint32() >>> 0;
    const span = (max - min + 1) >>> 0;
    return min + (r % span);
  }
}

const rnd = new RandomBuffer();

function readUint32BE(view: Uint8Array, off: number): number {
  return (
    (view[off] << 24) |
    (view[off + 1] << 16) |
    (view[off + 2] << 8) |
    view[off + 3]
  );
}

function parseMdatRegions(buf: ArrayBuffer): { start: number; end: number }[] {
  const view = new Uint8Array(buf);
  const regions: { start: number; end: number }[] = [];
  let i = 0;
  const len = view.length;
  while (i + 8 <= len) {
    const size = readUint32BE(view, i);
    const type0 = view[i + 4],
      type1 = view[i + 5],
      type2 = view[i + 6],
      type3 = view[i + 7];
    // 'mdat'
    const isMdat =
      type0 === 0x6d && type1 === 0x64 && type2 === 0x61 && type3 === 0x74;

    if (size === 0) {
      // box extends to EOF
      const payloadStart = i + 8;
      const end = len;
      if (isMdat && payloadStart < end)
        regions.push({ start: payloadStart, end });
      break;
    }

    let boxSize = size >>> 0;
    let largesizeHandled = false;
    if (boxSize === 1) {
      // 64-bit largesize; given our file size cap, fallback to EOF to be safe
      boxSize = len - i;
      largesizeHandled = true;
    }

    const payloadStart = i + 8;
    const end = i + boxSize;
    if (end > len || boxSize < 8) {
      // broken box, stop
      break;
    }

    if (isMdat) {
      if (payloadStart < end) regions.push({ start: payloadStart, end });
    }

    i = end;

    // Safety to avoid infinite loops on malformed boxes
    if (!largesizeHandled && boxSize === 0) break;
  }
  return regions;
}

// 说明：为避免对大文件使用巨大的 Set 占用内存，改为“允许重复采样”的策略：
// 执行 k 次，位置 = uniform[0, n)，直接修改该位置（重复命中时等于多次翻转同一字节的位）。

function flipOneRandomBit(byte: number): number {
  const bit = rnd.intInRange(0, 7);
  return byte ^ (1 << bit);
}

async function corrupt(buffer: ArrayBuffer, percent: number) {
  cancelled = false;
  const view = new Uint8Array(buffer);
  const regions = parseMdatRegions(buffer);
  if (regions.length === 0)
    throw new Error("未找到 mdat 区域，无法进行损坏处理。");

  let totalBytes = 0;
  for (const r of regions) totalBytes += r.end - r.start;
  const totalToModify = Math.max(1, Math.floor(totalBytes * percent));

  // 逐区域处理，按比例分配修改数量
  let modified = 0;
  let processedRegions = 0;
  for (const r of regions) {
    if (cancelled) {
      post({ type: "cancelled" });
      return;
    }
    const rlen = r.end - r.start;
    let k = Math.floor(rlen * percent);
    // 纠偏：把剩余配额在最后一个区补齐
    const remaining = totalToModify - modified;
    const regionsLeft = regions.length - processedRegions;
    if (regionsLeft === 1) k = remaining;
    if (k > rlen) k = rlen;
    if (k <= 0) {
      processedRegions++;
      continue;
    }

    // 修改：允许重复采样，避免大 Set 内存问题
    for (let i = 0; i < k; i++) {
      if (cancelled) {
        post({ type: "cancelled" });
        return;
      }
      const off = r.start + rnd.intInRange(0, rlen - 1);
      view[off] = flipOneRandomBit(view[off]);
      modified++;
      // 进度：按修改数占比上报
      if ((modified & 0x3fff) === 0) {
        post({ type: "progress", value: modified / totalToModify });
        await Promise.resolve(); // yield to event loop
      }
    }
    processedRegions++;
  }

  post({ type: "progress", value: 1 });
  post({ type: "done", buffer });
}

(self as unknown as DedicatedWorkerGlobalScope).onmessage = (
  ev: MessageEvent<WorkerMessage>
) => {
  const msg = ev.data;
  if (msg.type === "cancel") {
    cancelled = true;
    return;
  }
  if (msg.type === "start") {
    corrupt(msg.buffer, msg.percent).catch((e: unknown) => {
      const message = e instanceof Error ? e.message : String(e);
      post({ type: "error", message });
    });
  }
};
