export type MonitorState = "idle" | "live" | "blocked" | "unsupported";

export type MonitorStatus = {
  state: MonitorState;
  message: string;
};

export type MemorySample = {
  timestamp: number;
  usedMB: number;
  totalMB: number;
  limitMB: number;
};

export type FpsSample = {
  timestamp: number;
  fps: number;
};
