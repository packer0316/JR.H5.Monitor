import { Card, List, Tag, Typography } from "antd";

const menuItems = [
  { title: "儀表板", desc: "測試狀態摘要與快速入口" },
  { title: "記憶體", desc: "Phase 2 接上即時採樣與圖表" },
  { title: "Console", desc: "Phase 2 接上錯誤日誌面板" },
  { title: "網路", desc: "Phase 3 接上節流與離線模擬" },
  { title: "效能", desc: "Phase 2 接上 FPS 與 long task" },
  { title: "報告", desc: "Phase 4 匯出 PDF 與摘要結果" },
];

export function Sidebar() {
  return (
    <Card className="h-full border-slate-800 bg-slate-900/80">
      <div className="mb-4 flex items-center justify-between">
        <Typography.Title level={4} className="!m-0 !text-slate-100">
          模組導覽
        </Typography.Title>
        <Tag color="processing">Phase 1</Tag>
      </div>

      <List
        itemLayout="vertical"
        dataSource={menuItems}
        renderItem={(item) => (
          <List.Item className="!border-b !border-slate-800/80">
            <Typography.Text className="!text-slate-100">{item.title}</Typography.Text>
            <Typography.Paragraph className="!mb-0 !mt-1 !text-slate-400">
              {item.desc}
            </Typography.Paragraph>
          </List.Item>
        )}
      />
    </Card>
  );
}
