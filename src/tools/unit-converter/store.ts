import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createToolStorage } from "@/lib/storage";
import { getNetworkById } from "@/lib/networks";

export type ConverterTab = "preset" | "lookup" | "custom";

const VALID_TABS: ConverterTab[] = ["preset", "lookup", "custom"];
const DEFAULT_NETWORK_ID = "ethereum";

interface UnitConverterState {
  activeTab: ConverterTab;
  networkId: string;
  /** Raw input string of the custom decimals field */
  customDecimals: string;
  /** Whether persist rehydration has completed */
  _hasHydrated: boolean;
  setActiveTab: (tab: ConverterTab) => void;
  setNetworkId: (networkId: string) => void;
  setCustomDecimals: (decimals: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useUnitConverterStore = create<UnitConverterState>()(
  persist(
    (set) => ({
      activeTab: "preset",
      networkId: DEFAULT_NETWORK_ID,
      customDecimals: "18",
      _hasHydrated: false,
      setActiveTab: (activeTab) => set({ activeTab }),
      setNetworkId: (networkId) => set({ networkId }),
      setCustomDecimals: (customDecimals) => set({ customDecimals }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "state",
      storage: createJSONStorage(() => createToolStorage("unit-converter")),
      // Only UI preferences are persisted; entered amounts and lookup results stay ephemeral
      partialize: (state) => ({
        activeTab: state.activeTab,
        networkId: state.networkId,
        customDecimals: state.customDecimals,
      }),
      skipHydration: true,
      version: 1,
      // Defensive against tampered / outdated persisted data
      migrate: (persistedState) => {
        const state = persistedState as Partial<
          Pick<UnitConverterState, "activeTab" | "networkId" | "customDecimals">
        >;
        return {
          activeTab: VALID_TABS.includes(state.activeTab as ConverterTab)
            ? state.activeTab
            : "preset",
          networkId: getNetworkById(state.networkId ?? "")
            ? state.networkId
            : DEFAULT_NETWORK_ID,
          customDecimals: /^\d+$/.test(state.customDecimals ?? "")
            ? state.customDecimals
            : "18",
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/** Guard for restored network ids that no longer exist in the list */
export function resolveNetworkId(networkId: string): string {
  return getNetworkById(networkId) ? networkId : DEFAULT_NETWORK_ID;
}
