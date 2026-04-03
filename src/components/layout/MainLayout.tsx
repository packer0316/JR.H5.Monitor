import { Col, Row } from "antd";
import { OverviewPanel } from "../dashboard/OverviewPanel";
import { GameIframe } from "../game/GameIframe";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";

export function MainLayout() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-4 text-slate-100 lg:px-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
        <AppHeader />

        <Row gutter={[16, 16]} align="stretch">
          <Col xs={24} xl={5}>
            <Sidebar />
          </Col>
          <Col xs={24} xl={19}>
            <div className="flex h-full flex-col gap-4">
              <GameIframe />
              <OverviewPanel />
            </div>
          </Col>
        </Row>
      </div>
    </main>
  );
}
