import { Button, Card, Col, List, Progress, Row, Space, Statistic, Tag, Typography } from "antd";
import { LineChart } from "../charts/LineChart";
import { useConsoleStore } from "../../stores/consoleStore";
import { useGameStore } from "../../stores/gameStore";
import { useMemoryStore } from "../../stores/memoryStore";
import { usePerformanceStore } from "../../stores/performanceStore";

function renderStatusTag(state: "idle" | "live" | "blocked" | "unsupported") {
  const colorMap = {
    idle: "default",
    live: "success",
    blocked: "warning",
    unsupported: "error",
  } as const;

  const labelMap = {
    idle: "Idle",
    live: "Live",
    blocked: "Blocked",
    unsupported: "Unsupported",
  } as const;

  return <Tag color={colorMap[state]}>{labelMap[state]}</Tag>;
}

export function OverviewPanel() {
  const isRunning = useGameStore((state) => state.isRunning);
  const runningUrl = useGameStore((state) => state.runningUrl);
  const thresholds = useMemoryStore((state) => state.thresholds);
  const memoryStatus = useMemoryStore((state) => state.status);
  const latestMemorySample = useMemoryStore((state) => state.latestSample);
  const memorySamples = useMemoryStore((state) => state.samples);
  const minFps = usePerformanceStore((state) => state.minFps);
  const currentFps = usePerformanceStore((state) => state.currentFps);
  const fpsStatus = usePerformanceStore((state) => state.status);
  const fpsSamples = usePerformanceStore((state) => state.samples);
  const logs = useConsoleStore((state) => state.logs);
  const consoleStatus = useConsoleStore((state) => state.status);
  const clearLogs = useConsoleStore((state) => state.clearLogs);

  const memoryPercent =
    latestMemorySample && latestMemorySample.limitMB > 0
      ? Math.min((latestMemorySample.usedMB / latestMemorySample.limitMB) * 100, 100)
      : 0;

  const latestLogs = logs.slice(0, 12);

  return (
    <Card className="border-slate-800 bg-slate-900/80">
      <div className="mb-4">
        <Typography.Title level={4} className="!mb-1 !text-slate-100">
          測試摘要
        </Typography.Title>
        <Typography.Paragraph className="!mb-0 !text-slate-400">
          Phase 2 已串接即時記憶體採樣、Console 攔截與 FPS 追蹤；停止測試後會保留最後一輪資料供人工檢視。
        </Typography.Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Statistic title="Session 狀態" value={isRunning ? "Running" : "Idle"} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Statistic
            title="當前記憶體"
            value={latestMemorySample ? latestMemorySample.usedMB : 0}
            precision={1}
            suffix="MB"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Statistic title="當前 FPS" value={currentFps ?? 0} precision={1} suffix="fps" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Statistic title="Console 緩存" value={logs.length} suffix="筆" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} xl={12}>
          <Card className="h-full border-slate-800 bg-slate-950/60" styles={{ body: { padding: 16 } }}>
            <div className="mb-4 flex items-center justify-between">
              <Space>
                <Typography.Title level={5} className="!m-0 !text-slate-100">
                  Memory Monitor
                </Typography.Title>
                {renderStatusTag(memoryStatus.state)}
              </Space>
              <Typography.Text className="!text-slate-400">
                警告 {thresholds.warningMB} / 危險 {thresholds.criticalMB} MB
              </Typography.Text>
            </div>

            <Typography.Paragraph className="!mb-3 !text-slate-400">
              {memoryStatus.message}
            </Typography.Paragraph>

            <Progress
              percent={Number(memoryPercent.toFixed(1))}
              strokeColor={memoryPercent >= 90 ? "#ef4444" : memoryPercent >= 70 ? "#f59e0b" : "#22c55e"}
              trailColor="#1e293b"
              format={() =>
                latestMemorySample
                  ? `${latestMemorySample.usedMB.toFixed(1)} / ${latestMemorySample.limitMB.toFixed(1)} MB`
                  : "--"
              }
            />

            <div className="mt-4">
              <LineChart
                color="#22c55e"
                data={memorySamples.map((sample) => ({
                  timestamp: sample.timestamp,
                  value: sample.usedMB,
                }))}
                emptyText="尚未收到記憶體採樣資料"
                thresholds={[
                  { value: thresholds.warningMB, label: "Warning", color: "#f59e0b" },
                  { value: thresholds.criticalMB, label: "Critical", color: "#ef4444" },
                ]}
                yAxisFormatter={(value) => `${value.toFixed(0)} MB`}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className="h-full border-slate-800 bg-slate-950/60" styles={{ body: { padding: 16 } }}>
            <div className="mb-4 flex items-center justify-between">
              <Space>
                <Typography.Title level={5} className="!m-0 !text-slate-100">
                  FPS Tracker
                </Typography.Title>
                {renderStatusTag(fpsStatus.state)}
              </Space>
              <Typography.Text className="!text-slate-400">目標下限 {minFps} fps</Typography.Text>
            </div>

            <Typography.Paragraph className="!mb-3 !text-slate-400">
              {fpsStatus.message}
            </Typography.Paragraph>

            <LineChart
              color="#38bdf8"
              data={fpsSamples.map((sample) => ({
                timestamp: sample.timestamp,
                value: sample.fps,
              }))}
              emptyText="尚未收到 FPS 追蹤資料"
              thresholds={[{ value: minFps, label: "Min FPS", color: "#f59e0b" }]}
              yAxisFormatter={(value) => `${value.toFixed(0)} fps`}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mt-4 border-slate-800 bg-slate-950/60" styles={{ body: { padding: 16 } }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Space>
            <Typography.Title level={5} className="!m-0 !text-slate-100">
              Console Capture
            </Typography.Title>
            {renderStatusTag(consoleStatus.state)}
          </Space>
          <Button size="small" onClick={clearLogs}>
            清空日誌
          </Button>
        </div>

        <Typography.Paragraph className="!mb-4 !text-slate-400">
          {consoleStatus.message}
        </Typography.Paragraph>

        <div className="mb-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-4">
          <Typography.Text className="!text-slate-300">
            目前載入網址：{runningUrl || "尚未開始測試"}
          </Typography.Text>
        </div>

        <List
          locale={{ emptyText: <span className="text-slate-400">尚無 console 訊息</span> }}
          dataSource={latestLogs}
          renderItem={(item) => (
            <List.Item className="!border-b !border-slate-800/80 !px-0">
              <div className="w-full">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Tag color={item.level === "error" ? "error" : item.level === "warn" ? "warning" : "blue"}>
                    {item.level.toUpperCase()}
                  </Tag>
                  <Tag color={item.source === "system" ? "default" : "processing"}>{item.source}</Tag>
                  <Typography.Text className="!text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Typography.Text>
                </div>
                <Typography.Paragraph className="!mb-0 !whitespace-pre-wrap !font-mono !text-slate-200">
                  {item.message}
                </Typography.Paragraph>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </Card>
  );
}
