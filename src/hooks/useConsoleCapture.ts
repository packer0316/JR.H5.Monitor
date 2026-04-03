import { useEffect } from "react";
import { ConsoleEntry, useConsoleStore } from "../stores/consoleStore";
import { createMonitorId } from "../utils/createMonitorId";

type ConsoleMethod = ConsoleEntry["level"];

const CONSOLE_METHODS: ConsoleMethod[] = ["log", "info", "warn", "error", "debug"];

function serializeConsoleArg(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Error) {
    return value.stack || value.message;
  }

  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }

  return String(value);
}

export function useConsoleCapture(
  targetWindow: Window | null,
  enabled: boolean,
  blockedReason?: string | null,
) {
  const addLog = useConsoleStore((state) => state.addLog);
  const setStatus = useConsoleStore((state) => state.setStatus);

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

    const monitoredWindow = targetWindow as Window & typeof globalThis;
    const originalConsole = monitoredWindow.console;
    const restoreMap = new Map<ConsoleMethod, (...args: unknown[]) => void>();

    CONSOLE_METHODS.forEach((method) => {
      const originalMethod = originalConsole[method].bind(originalConsole);
      restoreMap.set(method, originalMethod);

      originalConsole[method] = (...args: unknown[]) => {
        addLog({
          id: createMonitorId(),
          level: method,
          message: args.map(serializeConsoleArg).join(" "),
          timestamp: Date.now(),
          source: "iframe",
        });
        originalMethod(...args);
      };
    });

    setStatus({ state: "live", message: "已攔截 iframe console 輸出" });

    return () => {
      restoreMap.forEach((originalMethod, method) => {
        originalConsole[method] = originalMethod;
      });
    };
  }, [addLog, blockedReason, enabled, setStatus, targetWindow]);
}
