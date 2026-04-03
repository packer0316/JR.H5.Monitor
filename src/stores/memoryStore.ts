import { create } from "zustand";
import { MemorySample, MonitorStatus } from "../types/monitor";

type MemoryThresholds = {
  warningMB: number;
  criticalMB: number;
};

type MemoryStore = {
  thresholds: MemoryThresholds;
  samples: MemorySample[];
  latestSample: MemorySample | null;
  status: MonitorStatus;
  setThresholds: (thresholds: Partial<MemoryThresholds>) => void;
  pushSample: (sample: MemorySample) => void;
  setStatus: (status: MonitorStatus) => void;
  reset: () => void;
};

const initialThresholds: MemoryThresholds = {
  warningMB: 400,
  criticalMB: 512,
};

const idleStatus: MonitorStatus = {
  state: "idle",
  message: "等待測試開始",
};

export const useMemoryStore = create<MemoryStore>((set) => ({
  thresholds: initialThresholds,
  samples: [],
  latestSample: null,
  status: idleStatus,
  setThresholds: (thresholds) =>
    set((state) => ({
      thresholds: {
        ...state.thresholds,
        ...thresholds,
      },
    })),
  pushSample: (sample) =>
    set((state) => ({
      latestSample: sample,
      samples: [...state.samples, sample].slice(-120),
    })),
  setStatus: (status) => set({ status }),
  reset: () =>
    set({
      thresholds: initialThresholds,
      samples: [],
      latestSample: null,
      status: idleStatus,
    }),
}));
