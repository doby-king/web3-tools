import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createToolStorage } from "@/lib/storage";

interface MarkdownPreviewState {
  input: string;
  /** Whether editor <-> preview scroll positions stay in sync */
  syncOn: boolean;
  /** Whether the sample document has been seeded on first visit */
  seeded: boolean;
  _hasHydrated: boolean;
  setInput: (input: string) => void;
  setSyncOn: (syncOn: boolean) => void;
  /** Fill the sample document once on first visit */
  seed: (sampleDoc: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useMarkdownPreviewStore = create<MarkdownPreviewState>()(
  persist(
    (set) => ({
      input: "",
      syncOn: true,
      seeded: false,
      _hasHydrated: false,
      setInput: (input) => set({ input }),
      setSyncOn: (syncOn) => set({ syncOn }),
      seed: (sampleDoc) => set({ input: sampleDoc, seeded: true }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "state",
      storage: createJSONStorage(() => createToolStorage("markdown-preview")),
      partialize: (state) => ({
        input: state.input,
        syncOn: state.syncOn,
        seeded: state.seeded,
      }),
      skipHydration: true,
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<
          Pick<MarkdownPreviewState, "input" | "syncOn" | "seeded">
        >;
        return {
          input: typeof state.input === "string" ? state.input : "",
          syncOn: state.syncOn !== false,
          seeded: state.seeded === true,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
