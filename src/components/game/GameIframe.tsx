import { Alert, Card, Typography } from "antd";
import { useGameStore } from "../../stores/gameStore";

export function GameIframe() {
  const isRunning = useGameStore((state) => state.isRunning);
  const runningUrl = useGameStore((state) => state.runningUrl);

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
          Phase 1 先提供基本載入能力，後續監控功能會從這個 `iframe` 掛入。
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
            type="info"
            showIcon
            message="若要在後續 Phase 讀取 console、memory 與 Cocos hook，建議讓工具與遊戲保持同源。"
          />
          <div className="min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-black">
            <iframe
              title="AITester Game Sandbox"
              src={runningUrl}
              className="h-[620px] w-full border-0"
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
            />
          </div>
        </>
      )}
    </Card>
  );
}
