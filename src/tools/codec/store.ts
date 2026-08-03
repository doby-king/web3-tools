import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createToolStorage } from "@/lib/storage";
import { isCodecFormatId, type CodecFormatId } from "./logic";

interface CodecState {
  format: CodecFormatId;
  input: string;
  output: string;
  errorKey: string | null;
  _hasHydrated: boolean;
  setFormat: (format: CodecFormatId) => void;
  setInput: (input: string) => void;
  setResult: (result: { output: string; errorKey: string | null }) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useCodecStore = create<CodecState>()(
  persist(
    (set) => ({
      format: "base64",
      input: "",
      output: "",
      errorKey: null,
      _hasHydrated: false,
      setFormat: (format) => set({ format, output: "", errorKey: null }),
      setInput: (input) => set({ input }),
      setResult: ({ output, errorKey }) => set({ output, errorKey }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "state",
      storage: createJSONStorage(() => createToolStorage("codec")),
      partialize: (state) => ({
        format: state.format,
        input: state.input,
        output: state.output,
        errorKey: state.errorKey,
      }),
      skipHydration: true,
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<
          Pick<CodecState, "format" | "input" | "output" | "errorKey">
        >;
        return {
          format: isCodecFormatId(state.format) ? state.format : "base64",
          input: typeof state.input === "string" ? state.input : "",
          output: typeof state.output === "string" ? state.output : "",
          errorKey: typeof state.errorKey === "string" ? state.errorKey : null,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
