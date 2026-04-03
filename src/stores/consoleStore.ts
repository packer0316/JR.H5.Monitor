import { create } from "zustand";
import { MonitorStatus } from "../types/monitor";

export type ConsoleEntry = {
  id: string;
  level: "log" | "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: number;
  source: "system" | "iframe";
};

type ConsoleStore = {
  logs: ConsoleEntry[];
  status: MonitorStatus;
  addLog: (entry: ConsoleEntry) => void;
  setStatus: (status: MonitorStatus) => void;
  clearLogs: () => void;
  reset: () => void;
};

const idleStatus: MonitorStatus = {
  state: "idle",
  message: "等待測試開始",
};

export const useConsoleStore = create<ConsoleStore>((set) => ({
  logs: [],
  status: idleStatus,
  addLog: (entry) => set((state) => ({ logs: [entry, ...state.logs].slice(0, 300) })),
  setStatus: (status) => set({ status }),
  clearLogs: () => set((state) => ({ ...state, logs: [] })),
  reset: () => set({ logs: [], status: idleStatus }),
}));
