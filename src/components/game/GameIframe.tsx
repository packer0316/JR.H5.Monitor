import { useEffect, useRef, useState } from "react";
import { Alert, Card, Typography } from "antd";
import { useConsoleCapture } from "../../hooks/useConsoleCapture";
import { useFPS } from "../../hooks/useFPS";
import { useMemoryPolling } from "../../hooks/useMemoryPolling";
import { useConsoleStore } from "../../stores/consoleStore";
import { useGameStore } from "../../stores/gameStore";
import { createMonitorId } from "../../utils/createMonitorId";

export function GameIframe() {
  const isRunning = useGameStore((state) => state.isRunning);
  const runningUrl = useGameStore((state) => state.runningUrl);
  const addLog = useConsoleStore((state) => state.addLog);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [targetWindow, setTargetWindow] = useState<Window | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  useMemoryPolling(targetWindow, isRunning, blockedReason);
  useFPS(targetWindow, isRunning, blockedReason);
  useConsoleCapture(targetWindow, isRunning, blockedReason);

  useEffect(() => {
    if (!isRunning) {
      setTargetWindow(null);
      setBlockedReason(null);
    }
  }, [isRunning]);

  const handleIframeLoad = () => {
    const nextWindow = iframeRef.current?.contentWindow;

    if (!nextWindow) {
      setTargetWindow(null);
      setBlockedReason("iframe 尚未建立完成，請稍後再試。");
      return;
    }

    try {
      void nextWindow.document.title;
      setTargetWindow(nextWindow);
      setBlockedReason(null);
      addLog({
        id: createMonitorId(),
        level: "info",
        message: "iframe 已載入，同源監控已啟動。",
        timestamp: Date.now(),
        source: "system",
      });
    } catch {
      const reason = "目前 iframe 為跨域頁面，無法直接攔截 console / memory / FPS。";
      setTargetWindow(null);
      setBlockedReason(reason);
      addLog({
        id: createMonitorId(),
        level: "warn",
        message: reason,
        timestamp: Date.now(),
        source: "system",
      });
    }
  };

  return (
    <Card
      className="h-full border-slate-800 bg-slate-900/80"
      bodyStyle={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div className="mb-4">
        <Typography.Title level={4} className="!mb-1 !text-slate-100">
          遊戲預覽視窗
        </Typography.Title>
        <Typography.Paragraph className="!mb-0 !text-slate-400">
          監控會在 `iframe` 載入後自動掛入；若遊戲與工具同源，會即時接上 Console、Memory 與 FPS 採樣。
        </Typography.Paragraph>
      </div>

      {!isRunning || !runningUrl ? (
        <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
          <div>
            <Typography.Title level={5} className="!mb-2 !text-slate-100">
              尚未載入遊戲
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 !text-slate-400">
              在上方輸入遊戲網址後按下 Start，即可在此顯示 Cocos Creator 網頁遊戲。
            </Typography.Paragraph>
          </div>
        </div>
      ) : (
        <>
          <Alert
            className="mb-4"
            type={blockedReason ? "warning" : "info"}
            showIcon
            message={
              blockedReason ||
              "已啟用同源監控模式，若遊戲內有 console 輸出或效能變化，下面面板會即時更新。"
            }
          />
          <div className="min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-black">
            <iframe
              ref={iframeRef}
              title="AITester Game Sandbox"
              src={runningUrl}
              className="h-[620px] w-full border-0"
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
              onLoad={handleIframeLoad}
            />
          </div>
        </>
      )}
    </Card>
  );
}
