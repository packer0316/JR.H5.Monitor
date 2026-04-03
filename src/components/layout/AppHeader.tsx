import { Button, Input, Space, Tag, Typography } from "antd";
import { useGameStore } from "../../stores/gameStore";

const { Text } = Typography;

export function AppHeader() {
  const gameUrl = useGameStore((state) => state.gameUrl);
  const isRunning = useGameStore((state) => state.isRunning);
  const setGameUrl = useGameStore((state) => state.setGameUrl);
  const startSession = useGameStore((state) => state.startSession);
  const stopSession = useGameStore((state) => state.stopSession);

  const canStart = gameUrl.trim().length > 0;

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
        <Button type="primary" size="large" disabled={!canStart} onClick={startSession}>
          Start
        </Button>
        <Button size="large" danger onClick={stopSession}>
          Stop
        </Button>
      </Space.Compact>
    </header>
  );
}
