import { create } from "zustand";
import { FpsSample, MonitorStatus } from "../types/monitor";

type PerformanceStore = {
  minFps: number;
  currentFps: number | null;
  samples: FpsSample[];
  status: MonitorStatus;
  setMinFps: (fps: number) => void;
  pushSample: (sample: FpsSample) => void;
  setStatus: (status: MonitorStatus) => void;
  reset: () => void;
};

const idleStatus: MonitorStatus = {
  state: "idle",
  message: "等待測試開始",
};

export const usePerformanceStore = create<PerformanceStore>((set) => ({
  minFps: 55,
  currentFps: null,
  samples: [],
  status: idleStatus,
  setMinFps: (minFps) => set({ minFps }),
  pushSample: (sample) =>
    set((state) => ({
      currentFps: sample.fps,
      samples: [...state.samples, sample].slice(-120),
    })),
  setStatus: (status) => set({ status }),
  reset: () =>
    set({
      minFps: 55,
      currentFps: null,
      samples: [],
      status: idleStatus,
    }),
}));
