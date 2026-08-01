import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createToolStorage } from "@/lib/storage";
import { CUSTOM_NETWORK_ID, getNetworkById } from "@/lib/networks";
import { WALLET_BRANDS, getBrandById, DEFAULT_SALT } from "./wallets";

interface AaCalculatorState {
  /** Built-in network id or 'custom' */
  networkId: string;
  customRpc: string;
  /** Selected wallet brand id */
  brandId: string;
  /** Selected preset id, or 'custom' for manual config */
  presetId: string;
  /** Selected variant id (auto-set by preset or manual choice) */
  variantId: string;
  /** Single owner address input */
  owner: string;
  /** Multiple owners input (for multi-owner wallets) */
  owners: string[];
  /** Salt value (uint256 hex) */
  salt: string;
  /** Safe: threshold */
  threshold: number;
  /** Owner query: target AA address */
  queryAddress: string;
  /** Whether persist rehydration has completed */
  _hasHydrated: boolean;

  setNetworkId: (id: string) => void;
  setCustomRpc: (rpc: string) => void;
  setBrandId: (id: string) => void;
  setPresetId: (id: string) => void;
  setVariantId: (id: string) => void;
  setOwner: (owner: string) => void;
  setOwners: (owners: string[]) => void;
  setSalt: (salt: string) => void;
  setThreshold: (threshold: number) => void;
  setQueryAddress: (address: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

/** Get the default preset id for a brand (first preset or 'custom') */
function defaultPresetForBrand(brandId: string): string {
  const brand = getBrandById(brandId);
  if (brand && brand.presets.length > 0) return brand.presets[0].id;
  return "custom";
}

/** Get the default variant id for a brand (first variant) */
function defaultVariantForBrand(brandId: string): string {
  const brand = getBrandById(brandId);
  if (brand && brand.variants.length > 0) return brand.variants[0].id;
  return "";
}

/** Resolve the variant id from a preset */
function variantForPreset(brandId: string, presetId: string): string {
  const brand = getBrandById(brandId);
  if (!brand) return defaultVariantForBrand(brandId);
  const preset = brand.presets.find((p) => p.id === presetId);
  if (preset) return preset.variantId;
  return defaultVariantForBrand(brandId);
}

const DEFAULT_BRAND = "simple";

export const useAaCalculatorStore = create<AaCalculatorState>()(
  persist(
    (set) => ({
      networkId: "ethereum",
      customRpc: "",
      brandId: DEFAULT_BRAND,
      presetId: defaultPresetForBrand(DEFAULT_BRAND),
      variantId: defaultVariantForBrand(DEFAULT_BRAND),
      owner: "",
      owners: [""],
      salt: DEFAULT_SALT,
      threshold: 1,
      queryAddress: "",
      _hasHydrated: false,

      setNetworkId: (networkId) => set({ networkId }),
      setCustomRpc: (customRpc) => set({ customRpc }),
      setBrandId: (brandId) => {
        const presetId = defaultPresetForBrand(brandId);
        const variantId =
          presetId === "custom"
            ? defaultVariantForBrand(brandId)
            : variantForPreset(brandId, presetId);
        set({ brandId, presetId, variantId });
      },
      setPresetId: (presetId) =>
        set((state) => ({
          presetId,
          variantId:
            presetId === "custom"
              ? defaultVariantForBrand(state.brandId)
              : variantForPreset(state.brandId, presetId),
        })),
      setVariantId: (variantId) => set({ variantId }),
      setOwner: (owner) => set({ owner }),
      setOwners: (owners) => set({ owners }),
      setSalt: (salt) => set({ salt }),
      setThreshold: (threshold) => set({ threshold }),
      setQueryAddress: (queryAddress) => set({ queryAddress }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "state",
      storage: createJSONStorage(() =>
        createToolStorage("aa-address-calculator"),
      ),
      partialize: (state) => ({
        networkId: state.networkId,
        customRpc: state.customRpc,
        brandId: state.brandId,
        presetId: state.presetId,
        variantId: state.variantId,
        owner: state.owner,
        owners: state.owners,
        salt: state.salt,
        threshold: state.threshold,
        queryAddress: state.queryAddress,
      }),
      skipHydration: true,
      version: 1,
      migrate: (persistedState) => {
        const s = persistedState as Partial<AaCalculatorState>;
        const brandId =
          typeof s.brandId === "string" && getBrandById(s.brandId)
            ? s.brandId
            : DEFAULT_BRAND;
        const presetId =
          typeof s.presetId === "string"
            ? s.presetId
            : defaultPresetForBrand(brandId);
        const variantId =
          typeof s.variantId === "string"
            ? s.variantId
            : presetId === "custom"
              ? defaultVariantForBrand(brandId)
              : variantForPreset(brandId, presetId);

        return {
          networkId:
            typeof s.networkId === "string" &&
            (s.networkId === CUSTOM_NETWORK_ID || getNetworkById(s.networkId))
              ? s.networkId
              : "ethereum",
          customRpc: typeof s.customRpc === "string" ? s.customRpc : "",
          brandId,
          presetId,
          variantId,
          owner: typeof s.owner === "string" ? s.owner : "",
          owners: Array.isArray(s.owners) ? s.owners : [""],
          salt: typeof s.salt === "string" ? s.salt : DEFAULT_SALT,
          threshold:
            typeof s.threshold === "number" && s.threshold >= 1
              ? s.threshold
              : 1,
          queryAddress:
            typeof s.queryAddress === "string" ? s.queryAddress : "",
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/** Helper: check if a brand id is valid */
export function isValidBrand(id: string): boolean {
  return WALLET_BRANDS.some((b) => b.id === id);
}
