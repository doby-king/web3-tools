import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createToolStorage } from "@/lib/storage";
import { generateMnemonic, normalizeWordCount, type WordCount } from "./crypto";

interface EthMnemonicState {
  wordCount: WordCount;
  mnemonic: string;
  /** Whether persist rehydration has completed (body is not rendered until then, preventing defaults from overwriting stored data) */
  _hasHydrated: boolean;
  regenerate: () => void;
  setWordCount: (wordCount: WordCount) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useEthMnemonicStore = create<EthMnemonicState>()(
  persist(
    (set, get) => ({
      wordCount: 12,
      mnemonic: "",
      _hasHydrated: false,
      regenerate: () => {
        set({ mnemonic: generateMnemonic(get().wordCount) });
      },
      setWordCount: (wordCount) => {
        // Defensive: persisted data may have been tampered with into invalid values, so normalize before generating
        const normalized = normalizeWordCount(wordCount);
        set({ wordCount: normalized, mnemonic: generateMnemonic(normalized) });
      },
      setHasHydrated: (hydrated) => {
        set({ _hasHydrated: hydrated });
      },
    }),
    {
      name: "state",
      storage: createJSONStorage(() => createToolStorage("eth-mnemonic")),
      // Only persist the mnemonic and word count; private key / address are derived from the mnemonic, no redundant storage
      partialize: (state) => ({
        wordCount: state.wordCount,
        mnemonic: state.mnemonic,
      }),
      skipHydration: true,
      version: 1,
      // Migration for old / tampered data: normalize wordCount; invalid mnemonics are handled by the page's tryDeriveWallet self-healing path
      migrate: (persistedState) => {
        const state = persistedState as Partial<
          Pick<EthMnemonicState, "wordCount" | "mnemonic">
        >;
        return {
          wordCount: normalizeWordCount(state?.wordCount),
          mnemonic: typeof state?.mnemonic === "string" ? state.mnemonic : "",
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
