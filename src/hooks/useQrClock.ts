import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseQrClockOptions {
  /** 初始时区，IANA TZ，比如 Asia/Shanghai */
  initialTimeZone?: string;
  /** 更新时间间隔（毫秒）默认 1000 */
  interval?: number;
  /** 自定义时间格式函数 */
  format?: (date: Date, timeZone: string) => string;
}

export interface UseQrClockReturn {
  timeZone: string;
  setTimeZone: (tz: string) => void;
  now: Date;
  text: string; // 用于二维码的文本
  formatted: string; // 用户可读的格式化时间
  availableTimeZones: string[];
}

const defaultFormat = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

// 为了避免加载巨大 TZ 列表，这里放一个常用子集，可扩展
const COMMON_TIME_ZONES = [
  "UTC",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Australia/Sydney",
];

export function useQrClock(options: UseQrClockOptions = {}): UseQrClockReturn {
  const {
    initialTimeZone = "Asia/Shanghai",
    interval = 1000,
    format = defaultFormat,
  } = options;
  const [timeZone, setTimeZone] = useState<string>(initialTimeZone);
  const [now, setNow] = useState<Date>(new Date());
  const timerRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    tick();
    timerRef.current = window.setInterval(tick, interval);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interval, tick]);

  const formatted = useMemo(
    () => format(now, timeZone),
    [now, timeZone, format]
  );

  // 二维码内容：包含 ISO 字符串 + 可读时间 + 时区
  const text = useMemo(() => {
    return JSON.stringify({
      iso: now.toISOString(),
      timeZone,
      formatted,
      epoch: now.getTime(),
    });
  }, [now, timeZone, formatted]);

  return {
    timeZone,
    setTimeZone,
    now,
    text,
    formatted,
    availableTimeZones: COMMON_TIME_ZONES,
  };
}

export default useQrClock;
