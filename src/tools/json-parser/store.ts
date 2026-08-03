import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createToolStorage } from "@/lib/storage";
import { transformJson } from "./logic";

interface JsonParserState {
  input: string;
  escapeOn: boolean;
  minifyOn: boolean;
  /** When true, auto-detect will not overwrite switch values */
  userTouchedSwitches: boolean;
  _hasHydrated: boolean;
  setInput: (input: string) => void;
  setEscapeOn: (escapeOn: boolean) => void;
  setMinifyOn: (minifyOn: boolean) => void;
  /** Apply auto-detected switch values (no-op if user has manually toggled) */
  applyDetectedMode: (mode: { escaped: boolean; minified: boolean }) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useJsonParserStore = create<JsonParserState>()(
  persist(
    (set, get) => ({
      input: "",
      escapeOn: false,
      minifyOn: false,
      userTouchedSwitches: false,
      _hasHydrated: false,
      setInput: (input) => {
        if (!input.trim()) {
          set({
            input,
            userTouchedSwitches: false,
            escapeOn: false,
            minifyOn: false,
          });
          return;
        }
        set({ input });
      },
      setEscapeOn: (escapeOn) => {
        const { input, escapeOn: prev, minifyOn } = get();
        set({
          escapeOn,
          userTouchedSwitches: true,
          // The left input box follows the switches: re-render the content
          // under the new representation (no-op when unchanged or unparseable)
          input:
            prev === escapeOn
              ? input
              : transformJson(input, escapeOn, minifyOn),
        });
      },
      setMinifyOn: (minifyOn) => {
        const { input, escapeOn, minifyOn: prev } = get();
        set({
          minifyOn,
          userTouchedSwitches: true,
          input:
            prev === minifyOn
              ? input
              : transformJson(input, escapeOn, minifyOn),
        });
      },
      applyDetectedMode: (mode) => {
        if (get().userTouchedSwitches) return;
        set({ escapeOn: mode.escaped, minifyOn: mode.minified });
      },
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "state",
      storage: createJSONStorage(() => createToolStorage("json-parser")),
      partialize: (state) => ({
        input: state.input,
        escapeOn: state.escapeOn,
        minifyOn: state.minifyOn,
        userTouchedSwitches: state.userTouchedSwitches,
      }),
      skipHydration: true,
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<
          Pick<
            JsonParserState,
            "input" | "escapeOn" | "minifyOn" | "userTouchedSwitches"
          >
        >;
        return {
          input: typeof state.input === "string" ? state.input : "",
          escapeOn: state.escapeOn === true,
          minifyOn: state.minifyOn === true,
          userTouchedSwitches: state.userTouchedSwitches === true,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
