import { create } from "zustand";

type PerformanceStore = {
  minFps: number;
  setMinFps: (fps: number) => void;
};

export const usePerformanceStore = create<PerformanceStore>((set) => ({
  minFps: 55,
  setMinFps: (minFps) => set({ minFps }),
}));
