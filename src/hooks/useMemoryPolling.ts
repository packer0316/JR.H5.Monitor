import { useEffect } from "react";
import { useMemoryStore } from "../stores/memoryStore";

type MemoryLikePerformance = Performance & {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
};

export function useMemoryPolling(
  targetWindow: Window | null,
  enabled: boolean,
  blockedReason?: string | null,
) {
  const pushSample = useMemoryStore((state) => state.pushSample);
  const setStatus = useMemoryStore((state) => state.setStatus);

  useEffect(() => {
    if (!enabled) {
      setStatus({ state: "idle", message: "等待測試開始" });
      return;
    }

    if (!targetWindow) {
      setStatus({
        state: blockedReason ? "blocked" : "idle",
        message: blockedReason || "等待 iframe 完成載入",
      });
      return;
    }

    const readMemory = () => {
      const performanceWithMemory = targetWindow.performance as MemoryLikePerformance;
      const memory = performanceWithMemory.memory;

      if (!memory) {
        setStatus({
          state: "unsupported",
          message: "此環境未開啟 performance.memory，無法讀取 JS Heap",
        });
        return;
      }

      pushSample({
        timestamp: Date.now(),
        usedMB: memory.usedJSHeapSize / 1024 / 1024,
        totalMB: memory.totalJSHeapSize / 1024 / 1024,
        limitMB: memory.jsHeapSizeLimit / 1024 / 1024,
      });
      setStatus({ state: "live", message: "每秒採樣 iframe JS Heap 使用量" });
    };

    readMemory();
    const timerId = window.setInterval(readMemory, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [blockedReason, enabled, pushSample, setStatus, targetWindow]);
}
