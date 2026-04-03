# 🎮 AITester — Cocos Creator 網頁遊戲品檢測試工具

## 專案概覽

**AITester** 是一款純前端的遊戲品質檢測（QA）工具，專為 Cocos Creator 網頁遊戲設計。它以「虛擬 QA 團隊」的概念運作——每個功能模組扮演一位專職測試員，協同監控、記錄、模擬各種遊戲運行情境。

**核心理念：** 不需後端、不接資料庫、零部署成本，打開瀏覽器即可使用。

---

## 技術選型

| 層面 | 選擇 | 理由 |
|------|------|------|
| **框架** | React 18 + TypeScript | 元件化架構、型別安全、生態豐富 |
| **建置工具** | Vite | 極速 HMR、開箱即用 TS 支援 |
| **UI 元件庫** | Ant Design 5 | 專業儀表板風格、表格/表單完整 |
| **圖表** | ECharts (via echarts-for-react) | 即時折線圖、記憶體瀑布圖、效能最佳 |
| **狀態管理** | Zustand | 輕量、無 boilerplate、適合工具型應用 |
| **資料持久化** | IndexedDB (via Dexie.js) | 純前端本地儲存、支援大量測試記錄 |
| **遊戲載入** | iframe sandbox | 隔離遊戲環境、可控通訊 |
| **樣式** | TailwindCSS + Ant Design tokens | 快速自訂佈局、與 AntD 共存 |
| **匯出報告** | html2canvas + jsPDF | 前端生成 PDF 報告 |

---

## 系統架構

```
┌─────────────────────────────────────────────────────────┐
│                    AITester 主介面                        │
│  ┌──────────┬──────────┬──────────┬──────────────────┐  │
│  │ 控制面板  │ 監控儀表板│ 日誌面板  │   報告面板        │  │
│  └────┬─────┴────┬─────┴────┬─────┴────────┬─────────┘  │
│       │          │          │              │             │
│  ┌────▼──────────▼──────────▼──────────────▼─────────┐  │
│  │              核心引擎 (Core Engine)                  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │  │
│  │  │ Memory  │ │ Console │ │ Network │ │  RAM    │ │  │
│  │  │ Monitor │ │ Capture │ │ Throttle│ │ Limiter │ │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ │  │
│  └───────┼──────────┼──────────┼──────────┼─────────┘  │
│          │          │          │          │             │
│  ┌───────▼──────────▼──────────▼──────────▼─────────┐  │
│  │           iframe Sandbox (遊戲運行環境)             │  │
│  │         Cocos Creator WebGL Game Instance          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 功能模組詳細規格

### 模組 1：記憶體監控器 (Memory Monitor)

**角色：** 效能工程師 — 持續追蹤記憶體使用

| 功能 | 說明 |
|------|------|
| 即時採樣 | 透過 `performance.measureUserAgentSpecificMemory()` 或 `performance.memory` 每秒採樣 |
| 即時圖表 | ECharts 即時折線圖，顯示 usedJSHeapSize / totalJSHeapSize |
| 記憶體洩漏偵測 | 滑動窗口線性回歸，偵測持續上升趨勢 |
| 快照比對 | 手動觸發記憶體快照，前後比對差異 |
| RAM 上限模擬 | 設定虛擬 RAM 天花板，達到時觸發警告/強制 GC 提示 |
| 標記事件 | 可在圖表上標記「切換場景」、「開啟UI」等事件點 |
| 資料匯出 | 匯出 CSV / JSON 原始採樣數據 |

**即時圖表規格：**
- X 軸：時間軸（可縮放、拖曳）
- Y 軸：MB（左軸記憶體，右軸可疊加 FPS）
- 顏色帶：綠色安全區 / 黃色警告區 / 紅色危險區（依使用者設定閾值）
- 標記線：使用者定義的 max / warning 線

---

### 模組 2：Console 日誌擷取器 (Console Capture)

**角色：** QA 記錄員 — 完整捕獲所有 console 輸出

| 功能 | 說明 |
|------|------|
| 攔截層級 | log / info / warn / error / debug 全攔截 |
| 結構化記錄 | 時間戳、層級、訊息、堆疊追蹤、出現次數 |
| 即時篩選 | 依層級、關鍵字、正則即時過濾 |
| 錯誤聚合 | 相同錯誤自動聚合，顯示首次/末次發生時間與次數 |
| 錯誤分類 | 自動分類：JS Runtime / Network / Resource / WebGL / Custom |
| Cocos 專屬偵測 | 辨識 Cocos Creator 常見錯誤模式（資源載入失敗、節點引用遺失等） |
| 匯出 | JSON / CSV 匯出完整日誌 |

**攔截實作：**
```typescript
// 透過 iframe contentWindow 注入
const originalConsole = iframe.contentWindow.console;
['log', 'info', 'warn', 'error', 'debug'].forEach(level => {
  iframe.contentWindow.console[level] = (...args) => {
    captureToStore({ level, args, timestamp: Date.now(), stack: new Error().stack });
    originalConsole[level].apply(originalConsole, args);
  };
});

// 全域錯誤捕獲
iframe.contentWindow.addEventListener('error', captureUncaughtError);
iframe.contentWindow.addEventListener('unhandledrejection', captureUnhandledRejection);
```

---

### 模組 3：網路模擬器 (Network Throttle)

**角色：** 環境模擬師 — 模擬各種網路條件

| 功能 | 說明 |
|------|------|
| 預設配置 | WiFi / 4G / 3G / Slow 3G / 2G / 離線 |
| 自訂配置 | 下載速率(kbps)、上傳速率(kbps)、延遲(ms)、封包遺失率(%) |
| Service Worker 攔截 | 透過 SW 攔截 fetch/XHR 實現延遲與限速 |
| 即時切換 | 運行中即時切換網速配置，不需重載 |
| 離線模擬 | 完全阻斷網路請求，測試離線容錯 |
| 請求日誌 | 記錄所有網路請求的 URL、狀態碼、耗時、大小 |
| 瀑布圖 | 類 DevTools Network 瀑布圖 |

**網速預設值：**
```typescript
const NETWORK_PROFILES = {
  'wifi':     { download: 30000, upload: 15000, latency: 2,    loss: 0 },
  '4g':       { download: 4000,  upload: 3000,  latency: 20,   loss: 0 },
  '3g':       { download: 1600,  upload: 768,   latency: 100,  loss: 0 },
  'slow-3g':  { download: 500,   upload: 250,   latency: 300,  loss: 2 },
  '2g':       { download: 280,   upload: 256,   latency: 800,  loss: 5 },
  'offline':  { download: 0,     upload: 0,     latency: 0,    loss: 100 },
} as const;
```

---

### 模組 4：FPS / 效能監控器 (Performance Monitor)

**角色：** 效能分析師 — 追蹤影格率與渲染效能

| 功能 | 說明 |
|------|------|
| FPS 追蹤 | requestAnimationFrame 計算即時 FPS |
| 掉幀偵測 | 標記低於閾值的影格 |
| 長任務偵測 | PerformanceObserver 監聽 longtask (>50ms) |
| Draw Call 估算 | 透過 WebGL wrapper 估算 draw call 次數 |
| 效能時間線 | 與記憶體圖表同步的效能時間線 |

---

### 模組 5：RAM 上限模擬器 (RAM Limiter)

**角色：** 裝置模擬師 — 模擬低階設備記憶體限制

| 功能 | 說明 |
|------|------|
| 設備預設 | 低階手機(1GB) / 中階(2GB) / 高階(4GB) / 自訂 |
| 記憶體壓力模擬 | 透過分配 ArrayBuffer 佔用記憶體，壓縮遊戲可用空間 |
| 警告觸發 | 達到模擬上限時觸發自訂事件 |
| OOM 模擬 | 模擬記憶體溢出場景 |

**實作原理：**
```typescript
class RAMLimiter {
  private ballast: ArrayBuffer[] = [];
  
  setLimit(targetAvailableMB: number) {
    const currentUsed = performance.memory.usedJSHeapSize / 1024 / 1024;
    const totalAvailable = performance.memory.jsHeapSizeLimit / 1024 / 1024;
    const needToOccupy = totalAvailable - targetAvailableMB - currentUsed;
    
    // 逐步分配 ballast 記憶體塊以壓縮可用空間
    while (this.getAllocatedMB() < needToOccupy) {
      this.ballast.push(new ArrayBuffer(1024 * 1024)); // 1MB chunks
    }
  }
  
  release() {
    this.ballast = [];
  }
}
```

---

### 模組 6：測試報告產生器 (Report Generator)

**角色：** 報告撰寫人 — 彙整所有數據產出品檢報告

| 功能 | 說明 |
|------|------|
| 即時儀表板 | 所有模組的即時摘要看板 |
| PDF 報告 | 一鍵生成含圖表的 PDF 品檢報告 |
| JSON 匯出 | 完整原始數據 JSON 匯出 |
| 歷史比對 | 本地儲存歷次測試結果，支援趨勢比對 |
| 評分系統 | 依使用者設定閾值自動計算品質分數 (0-100) |

**報告結構：**
```
📋 品檢報告
├── 基本資訊（遊戲名稱、版本、測試時間）
├── 總評分 & PASS/FAIL 判定
├── 記憶體分析
│   ├── 峰值 / 均值 / 趨勢圖
│   └── 洩漏風險評估
├── 效能分析
│   ├── FPS 分布圖
│   └── 長任務列表
├── 錯誤摘要
│   ├── 各層級統計
│   └── Top 10 高頻錯誤
├── 網路測試結果
│   └── 各網速下的表現
└── 改善建議（依閾值差距自動產生）
```

---

## 額外建議功能（你可能需要考慮的）

### 🔧 你可能遺漏的重要功能

| 功能 | 理由 |
|------|------|
| **螢幕截圖 / 錄影** | 搭配 `html2canvas` 或 `MediaRecorder API` 記錄 bug 發生瞬間 |
| **操作回放 (Session Replay)** | 記錄使用者輸入事件，可回放重現 bug |
| **自動化腳本** | 簡易腳本系統，自動執行重複測試流程（點擊、等待、驗證） |
| **多分頁並行測試** | SharedWorker 協調多個遊戲實例同時測試 |
| **WebGL 狀態監控** | 攔截 WebGL context 監控 texture 數量/大小、buffer 使用 |
| **音訊監控** | AudioContext 狀態監控，偵測音訊資源洩漏 |
| **觸控 / 手勢模擬** | 模擬手機觸控事件，測試觸控互動 |
| **裝置模擬** | UA 偽裝 + viewport 調整模擬不同裝置 |
| **Cocos 引擎掛鉤** | 注入 `cc.director` / `cc.game` 監聽場景切換、資源載入等事件 |
| **效能預算 (Perf Budget)** | 設定資源大小預算，超出即警告 |

---

## 頁面佈局設計

```
┌─────────────────────────────────────────────────────────────┐
│  🎮 AITester                    [設定 ⚙] [▶ Start] [⏹ Stop] │
├──────────┬──────────────────────────────────────────────────┤
│          │  ┌─────────────────────────────────────────────┐ │
│  側邊欄   │  │                                             │ │
│          │  │          iframe 遊戲視窗                      │ │
│ 📊 儀表板 │  │          (可調整大小)                         │ │
│ 🧠 記憶體 │  │                                             │ │
│ 📋 Console│  └─────────────────────────────────────────────┘ │
│ 🌐 網路   │  ┌─────────────────────────────────────────────┐ │
│ ⚡ 效能   │  │  即時圖表區                                   │ │
│ 📱 裝置   │  │  [記憶體] [FPS] [網路] [Timeline]   可切換     │ │
│ 📝 報告   │  │  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │ │
│ ⚙️ 設定   │  │  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │ │
│          │  └─────────────────────────────────────────────┘ │
│          │  ┌─────────────────────────────────────────────┐ │
│          │  │  Console 日誌面板（可摺疊）                     │ │
│          │  │  [All] [Error] [Warn] [Info]  🔍 Filter      │ │
│          │  │  12:03:01 [ERR] TypeError: cannot read...    │ │
│          │  │  12:03:02 [WRN] Resource loading slow...     │ │
│          │  └─────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 目錄結構

```
AITester/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── public/
│   └── sw.js                      # Service Worker（網路攔截用）
├── src/
│   ├── main.tsx                    # 進入點
│   ├── App.tsx                     # 主佈局
│   ├── stores/                     # Zustand stores
│   │   ├── memoryStore.ts          # 記憶體數據
│   │   ├── consoleStore.ts         # Console 日誌
│   │   ├── networkStore.ts         # 網路狀態
│   │   ├── performanceStore.ts     # 效能數據
│   │   └── reportStore.ts          # 報告狀態
│   ├── engines/                    # 核心引擎
│   │   ├── MemoryMonitor.ts        # 記憶體監控
│   │   ├── ConsoleCapture.ts       # Console 攔截
│   │   ├── NetworkThrottle.ts      # 網路節流
│   │   ├── PerformanceTracker.ts   # 效能追蹤
│   │   └── RAMLimiter.ts           # RAM 模擬
│   ├── components/                 # UI 元件
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── dashboard/
│   │   │   ├── OverviewPanel.tsx
│   │   │   └── ScoreCard.tsx
│   │   ├── memory/
│   │   │   ├── MemoryChart.tsx
│   │   │   └── MemoryStats.tsx
│   │   ├── console/
│   │   │   ├── ConsolePanel.tsx
│   │   │   └── LogEntry.tsx
│   │   ├── network/
│   │   │   ├── NetworkControls.tsx
│   │   │   └── WaterfallChart.tsx
│   │   ├── performance/
│   │   │   ├── FPSChart.tsx
│   │   │   └── LongTaskList.tsx
│   │   ├── report/
│   │   │   ├── ReportView.tsx
│   │   │   └── ReportExporter.tsx
│   │   └── game/
│   │       └── GameIframe.tsx
│   ├── hooks/                      # 自訂 hooks
│   │   ├── useMemoryPolling.ts
│   │   ├── useFPS.ts
│   │   └── useConsoleCapture.ts
│   ├── utils/                      # 工具函式
│   │   ├── linearRegression.ts     # 記憶體洩漏偵測
│   │   ├── formatters.ts
│   │   └── exportHelpers.ts
│   ├── types/                      # TypeScript 型別
│   │   ├── memory.d.ts
│   │   └── console.d.ts
│   └── db/                         # IndexedDB
│       └── dexieDB.ts
└── SPEC.md                         # 本文件
```

---

## 開發計畫（建議階段）

### Phase 1 — 基礎骨架（1-2 天）
- [x] 專案初始化（Vite + React + TS + AntD + Tailwind）
- [x] 主佈局（側邊欄 + 遊戲 iframe + 面板區）
- [x] iframe 載入遊戲 URL
- [x] 基礎狀態管理（Zustand stores）

### Phase 2 — 核心監控（3-4 天）
- [x] Memory Monitor 即時採樣 + ECharts 圖表（已完成，待人工檢驗）
- [x] Console Capture 攔截 + 日誌面板（已完成，待人工檢驗）
- [x] FPS 追蹤 + 圖表（已完成，待人工檢驗）

### Phase 3 — 模擬功能（2-3 天）
- [ ] Network Throttle（Service Worker 方案）
- [ ] RAM Limiter
- [ ] 設備模擬（viewport + UA）

### Phase 4 — 報告 & 收尾（1-2 天）
- [ ] PDF 報告生成
- [ ] 歷史數據比對
- [ ] IndexedDB 持久化
- [ ] UI 打磨

---

## 關鍵技術限制 & 注意事項

| 項目 | 說明 |
|------|------|
| **跨域限制** | 遊戲必須與工具同源，或遊戲端啟用 CORS；否則 iframe 無法存取 contentWindow |
| **performance.memory** | 僅 Chromium 支援，需加 `--enable-precise-memory-info` flag 或使用 `measureUserAgentSpecificMemory()` |
| **Service Worker 限制** | SW 只能攔截同源請求；跨域 CDN 資源需另外處理 |
| **Cross-Origin Isolation** | `measureUserAgentSpecificMemory()` 需要 `Cross-Origin-Opener-Policy` 和 `Cross-Origin-Embedder-Policy` headers |
| **WebGL Context** | 若需監控 WebGL 狀態，需在 context 建立前注入 wrapper |
| **Cocos Creator 版本** | 2.x 與 3.x 的引擎 API 不同，hook 需適配 |
| **記憶體測量精度** | JS heap 不等於 GPU 記憶體，WebGL texture 記憶體需另外估算 |

---

## 如何使用（使用流程）

```
1. 啟動 AITester（npm run dev）
2. 輸入遊戲 URL 或拖入本地遊戲資料夾
3. 設定監控閾值（記憶體上限、FPS 下限等）
4. 點擊 [▶ Start] 開始測試
5. 觀察即時儀表板
6. 操作遊戲，觀察各指標變化
7. 點擊 [⏹ Stop] 停止測試
8. 查看報告 & 匯出 PDF
```

---

## 總結

此工具的核心價值在於：

1. **零門檻** — 純前端、不需安裝任何後端服務
2. **即時視覺化** — 所有數據即時呈現，不需事後分析
3. **Cocos 專屬** — 針對 Cocos Creator 常見問題優化
4. **環境模擬** — 模擬各種網速與裝置記憶體限制
5. **一鍵報告** — 測試結束立即產出專業品檢報告
