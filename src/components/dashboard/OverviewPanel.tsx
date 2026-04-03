import { Card, Col, Row, Statistic, Typography } from "antd";
import { useConsoleStore } from "../../stores/consoleStore";
import { useGameStore } from "../../stores/gameStore";
import { useMemoryStore } from "../../stores/memoryStore";
import { useNetworkStore } from "../../stores/networkStore";
import { usePerformanceStore } from "../../stores/performanceStore";

export function OverviewPanel() {
  const isRunning = useGameStore((state) => state.isRunning);
  const runningUrl = useGameStore((state) => state.runningUrl);
  const thresholds = useMemoryStore((state) => state.thresholds);
  const minFps = usePerformanceStore((state) => state.minFps);
  const networkProfile = useNetworkStore((state) => state.profile);
  const logCount = useConsoleStore((state) => state.logs.length);

  return (
    <Card className="border-slate-800 bg-slate-900/80">
      <div className="mb-4">
        <Typography.Title level={4} className="!mb-1 !text-slate-100">
          測試摘要
        </Typography.Title>
        <Typography.Paragraph className="!mb-0 !text-slate-400">
          這裡先顯示 Phase 1 的基礎狀態，後續 Phase 2/3 會串接即時數據。
        </Typography.Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Statistic title="Session 狀態" value={isRunning ? "Running" : "Idle"} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Statistic title="記憶體警告線" value={thresholds.warningMB} suffix="MB" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Statistic title="FPS 下限" value={minFps} suffix="fps" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Statistic title="Console 緩存" value={logCount} suffix="筆" />
        </Col>
      </Row>

      <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-4">
        <Typography.Text className="!text-slate-300">
          目前載入網址：{runningUrl || "尚未開始測試"}
        </Typography.Text>
        <br />
        <Typography.Text className="!text-slate-400">網路設定：{networkProfile}</Typography.Text>
      </div>
    </Card>
  );
}
