import { create } from "zustand";

export type ConsoleEntry = {
  id: string;
  level: "log" | "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: number;
};

type ConsoleStore = {
  logs: ConsoleEntry[];
  addLog: (entry: ConsoleEntry) => void;
  clearLogs: () => void;
};

export const useConsoleStore = create<ConsoleStore>((set) => ({
  logs: [],
  addLog: (entry) => set((state) => ({ logs: [entry, ...state.logs].slice(0, 200) })),
  clearLogs: () => set({ logs: [] }),
}));
