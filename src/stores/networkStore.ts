import { create } from "zustand";

export type NetworkProfile = "wifi" | "4g" | "3g" | "slow-3g" | "offline";

type NetworkStore = {
  profile: NetworkProfile;
  setProfile: (profile: NetworkProfile) => void;
};

export const useNetworkStore = create<NetworkStore>((set) => ({
  profile: "wifi",
  setProfile: (profile) => set({ profile }),
}));
