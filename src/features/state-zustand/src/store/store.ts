import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
  // demo state
  count: number;

  // actions
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 })),
      decrement: () => set((s) => ({ count: s.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: "app-store", // localStorage key
      // default storage is localStorage in the browser
    }
  )
);