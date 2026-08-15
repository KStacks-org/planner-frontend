import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppView = "planner" | "generate";

interface UiState {
  view: AppView;
  setView: (v: AppView) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      view: "planner",
      setView: (v) => set({ view: v }),
    }),
    {
      name: "kplanner-ui-state",
    },
  ),
);
