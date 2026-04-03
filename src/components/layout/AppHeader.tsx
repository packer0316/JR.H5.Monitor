import { Button, Input, Space, Tag, Typography } from "antd";
import { useConsoleStore } from "../../stores/consoleStore";
import { useGameStore } from "../../stores/gameStore";
import { useMemoryStore } from "../../stores/memoryStore";
import { usePerformanceStore } from "../../stores/performanceStore";
import { createMonitorId } from "../../utils/createMonitorId";

const { Text } = Typography;

export function AppHeader() {
  const gameUrl = useGameStore((state) => state.gameUrl);
  const isRunning = useGameStore((state) => state.isRunning);
  const setGameUrl = useGameStore((state) => state.setGameUrl);
  const startSession = useGameStore((state) => state.startSession);
  const stopSession = useGameStore((state) => state.stopSession);
  const addLog = useConsoleStore((state) => state.addLog);
  const resetConsole = useConsoleStore((state) => state.reset);
  const resetMemory = useMemoryStore((state) => state.reset);
  const resetPerformance = usePerformanceStore((state) => state.reset);

  const canStart = gameUrl.trim().length > 0;

  const handleStart = () => {
    const nextUrl = gameUrl.trim();
    if (!nextUrl) {
      return;
    }

    resetConsole();
    resetMemory();
    resetPerformance();
    addLog({
      id: createMonitorId(),
      level: "info",
      message: `準備載入測試網址：${nextUrl}`,
      timestamp: Date.now(),
      source: "system",
    });
    startSession();
  };

  const handleStop = () => {
    stopSession();
    addLog({
      id: createMonitorId(),
      level: "warn",
      message: "測試已手動停止，監控維持最後一次採樣結果供人工檢驗。",
      timestamp: Date.now(),
      source: "system",
    });
  };

  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-black/20 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Text className="!mb-1 !block !text-xs !uppercase !tracking-[0.3em] !text-slate-400">
          AITester
        </Text>
        <div className="flex items-center gap-3">
          <Typography.Title level={3} className="!m-0 !text-slate-100">
            Cocos Creator QA Dashboard
          </Typography.Title>
          <Tag color={isRunning ? "success" : "default"}>{isRunning ? "Running" : "Idle"}</Tag>
        </div>
      </div>

      <Space.Compact className="w-full lg:max-w-3xl">
        <Input
          size="large"
          placeholder="輸入遊戲網址，例如：http://localhost:7456"
          value={gameUrl}
          onChange={(event) => setGameUrl(event.target.value)}
        />
        <Button type="primary" size="large" disabled={!canStart} onClick={handleStart}>
          Start
        </Button>
        <Button size="large" danger onClick={handleStop}>
          Stop
        </Button>
      </Space.Compact>
    </header>
  );
}
