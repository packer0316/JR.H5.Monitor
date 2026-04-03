import { create } from "zustand";

type GameStore = {
  gameUrl: string;
  runningUrl: string;
  isRunning: boolean;
  setGameUrl: (url: string) => void;
  startSession: () => void;
  stopSession: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameUrl: "",
  runningUrl: "",
  isRunning: false,
  setGameUrl: (gameUrl) => set({ gameUrl }),
  startSession: () => {
    const nextUrl = get().gameUrl.trim();
    set({
      runningUrl: nextUrl,
      isRunning: Boolean(nextUrl),
    });
  },
  stopSession: () =>
    set({
      isRunning: false,
      runningUrl: "",
    }),
}));
