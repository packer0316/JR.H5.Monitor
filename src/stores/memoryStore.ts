import { create } from "zustand";

type MemoryThresholds = {
  warningMB: number;
  criticalMB: number;
};

type MemoryStore = {
  thresholds: MemoryThresholds;
  setThresholds: (thresholds: Partial<MemoryThresholds>) => void;
};

export const useMemoryStore = create<MemoryStore>((set) => ({
  thresholds: {
    warningMB: 400,
    criticalMB: 512,
  },
  setThresholds: (thresholds) =>
    set((state) => ({
      thresholds: {
        ...state.thresholds,
        ...thresholds,
      },
    })),
}));
