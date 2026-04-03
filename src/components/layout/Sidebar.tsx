import { Card, List, Tag, Typography } from "antd";

const menuItems = [
  { title: "儀表板", desc: "測試狀態摘要與快速入口" },
  { title: "記憶體", desc: "即時採樣 JS Heap 與圖表趨勢" },
  { title: "Console", desc: "攔截 iframe console 並集中顯示" },
  { title: "網路", desc: "Phase 3 接上節流與離線模擬" },
  { title: "效能", desc: "即時追蹤 FPS 與低幀率風險" },
  { title: "報告", desc: "Phase 4 匯出 PDF 與摘要結果" },
];

export function Sidebar() {
  return (
    <Card className="h-full border-slate-800 bg-slate-900/80">
      <div className="mb-4 flex items-center justify-between">
        <Typography.Title level={4} className="!m-0 !text-slate-100">
          模組導覽
        </Typography.Title>
        <Tag color="success">Phase 2</Tag>
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
