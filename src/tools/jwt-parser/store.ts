import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createToolStorage } from "@/lib/storage";

interface JwtParserState {
  token: string;
  keyInput: string;
  _hasHydrated: boolean;
  setToken: (token: string) => void;
  setKeyInput: (keyInput: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useJwtParserStore = create<JwtParserState>()(
  persist(
    (set) => ({
      token: "",
      keyInput: "",
      _hasHydrated: false,
      setToken: (token) => set({ token }),
      setKeyInput: (keyInput) => set({ keyInput }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "state",
      storage: createJSONStorage(() => createToolStorage("jwt-parser")),
      partialize: (state) => ({
        token: state.token,
        keyInput: state.keyInput,
      }),
      skipHydration: true,
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<
          Pick<JwtParserState, "token" | "keyInput">
        >;
        return {
          token: typeof state.token === "string" ? state.token : "",
          keyInput: typeof state.keyInput === "string" ? state.keyInput : "",
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
