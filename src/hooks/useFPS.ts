import { useEffect } from "react";
import { usePerformanceStore } from "../stores/performanceStore";

export function useFPS(targetWindow: Window | null, enabled: boolean, blockedReason?: string | null) {
  const pushSample = usePerformanceStore((state) => state.pushSample);
  const setStatus = usePerformanceStore((state) => state.setStatus);

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

    if (!targetWindow.requestAnimationFrame) {
      setStatus({
        state: "unsupported",
        message: "此環境不支援 requestAnimationFrame，無法估算 FPS",
      });
      return;
    }

    let rafId = 0;
    let frameCount = 0;
    let bucketStart = 0;

    const loop = (timestamp: number) => {
      if (!bucketStart) {
        bucketStart = timestamp;
      }

      frameCount += 1;
      const elapsed = timestamp - bucketStart;

      if (elapsed >= 1000) {
        const fps = (frameCount * 1000) / elapsed;
        pushSample({
          timestamp: Date.now(),
          fps,
        });
        setStatus({ state: "live", message: "使用 requestAnimationFrame 追蹤 iframe FPS" });
        frameCount = 0;
        bucketStart = timestamp;
      }

      rafId = targetWindow.requestAnimationFrame(loop);
    };

    rafId = targetWindow.requestAnimationFrame(loop);

    return () => {
      targetWindow.cancelAnimationFrame(rafId);
    };
  }, [blockedReason, enabled, pushSample, setStatus, targetWindow]);
}
