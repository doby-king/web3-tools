import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createToolStorage } from "@/lib/storage";
import { CUSTOM_NETWORK_ID, getNetworkById } from "./networks";
import { CUSTOM_ABI_ID, getPresetById } from "./presets";

interface AbiInteractorState {
  /** Built-in network id or 'custom' */
  networkId: string;
  customRpc: string;
  /** Built-in preset id or 'custom' */
  abiPresetId: string;
  customAbi: string;
  contractAddress: string;
  /** Whether persist rehydration has completed */
  _hasHydrated: boolean;
  setNetworkId: (id: string) => void;
  setCustomRpc: (rpc: string) => void;
  setAbiPresetId: (id: string) => void;
  setCustomAbi: (abi: string) => void;
  setContractAddress: (address: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAbiInteractorStore = create<AbiInteractorState>()(
  persist(
    (set) => ({
      networkId: "ethereum",
      customRpc: "",
      abiPresetId: "erc20",
      customAbi: "",
      contractAddress: "",
      _hasHydrated: false,
      setNetworkId: (networkId) => set({ networkId }),
      setCustomRpc: (customRpc) => set({ customRpc }),
      setAbiPresetId: (abiPresetId) => set({ abiPresetId }),
      setCustomAbi: (customAbi) => set({ customAbi }),
      setContractAddress: (contractAddress) => set({ contractAddress }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "state",
      storage: createJSONStorage(() => createToolStorage("abi-interactor")),
      partialize: (state) => ({
        networkId: state.networkId,
        customRpc: state.customRpc,
        abiPresetId: state.abiPresetId,
        customAbi: state.customAbi,
        contractAddress: state.contractAddress,
      }),
      skipHydration: true,
      version: 1,
      // Defensive: persisted data may have been tampered with; normalize to valid values
      migrate: (persistedState) => {
        const s = persistedState as Partial<AbiInteractorState>;
        return {
          networkId:
            typeof s.networkId === "string" &&
            (s.networkId === CUSTOM_NETWORK_ID || getNetworkById(s.networkId))
              ? s.networkId
              : "ethereum",
          customRpc: typeof s.customRpc === "string" ? s.customRpc : "",
          abiPresetId:
            typeof s.abiPresetId === "string" &&
            (s.abiPresetId === CUSTOM_ABI_ID || getPresetById(s.abiPresetId))
              ? s.abiPresetId
              : "erc20",
          customAbi: typeof s.customAbi === "string" ? s.customAbi : "",
          contractAddress:
            typeof s.contractAddress === "string" ? s.contractAddress : "",
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
