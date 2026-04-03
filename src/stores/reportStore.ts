import { create } from "zustand";

type ReportStore = {
  lastGeneratedAt: number | null;
  markGenerated: () => void;
};

export const useReportStore = create<ReportStore>((set) => ({
  lastGeneratedAt: null,
  markGenerated: () => set({ lastGeneratedAt: Date.now() }),
}));
