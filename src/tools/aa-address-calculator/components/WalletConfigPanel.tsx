import { useTranslation } from "react-i18next";
import {
  Card,
  Select,
  SegmentedControl,
  type SelectOption,
} from "@/components/ui";
import { WALLET_BRANDS, getBrandById, getVariantById } from "../wallets";
import { useAaCalculatorStore } from "../store";

export function WalletConfigPanel() {
  const { t } = useTranslation();
  const brandId = useAaCalculatorStore((s) => s.brandId);
  const presetId = useAaCalculatorStore((s) => s.presetId);
  const variantId = useAaCalculatorStore((s) => s.variantId);
  const setBrandId = useAaCalculatorStore((s) => s.setBrandId);
  const setPresetId = useAaCalculatorStore((s) => s.setPresetId);
  const setVariantId = useAaCalculatorStore((s) => s.setVariantId);

  const brand = getBrandById(brandId);

  const brandOptions: SelectOption[] = WALLET_BRANDS.map((b) => ({
    value: b.id,
    label: t(b.labelKey),
  }));

  // Preset options (including "custom")
  const presetOptions = brand
    ? [
        ...brand.presets.map((p) => ({
          label: t(p.labelKey),
          value: p.id,
        })),
        { label: t("tools.aaAddressCalculator.custom"), value: "custom" },
      ]
    : [];

  // Variant options for custom mode
  const variantOptions: SelectOption[] =
    brand?.variants.map((v) => ({
      value: v.id,
      label: t(v.labelKey),
    })) ?? [];

  const showPresetSelector = brand && brand.presets.length > 0;
  const isCustom = presetId === "custom";
  const showVariantSelector =
    brand && (!showPresetSelector || isCustom) && brand.variants.length > 1;

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-text">
        {t("tools.aaAddressCalculator.walletConfig")}
      </h2>

      <div className="space-y-4">
        {/* Brand selection */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            {t("tools.aaAddressCalculator.brand")}
          </label>
          <Select
            options={brandOptions}
            value={brandId}
            onChange={setBrandId}
          />
        </div>

        {/* Preset selection (if brand has presets) */}
        {showPresetSelector && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("tools.aaAddressCalculator.preset")}
            </label>
            {presetOptions.length <= 4 ? (
              <SegmentedControl
                options={presetOptions}
                value={presetId}
                onChange={setPresetId}
                className="w-full"
              />
            ) : (
              <Select
                options={presetOptions}
                value={presetId}
                onChange={setPresetId}
              />
            )}
          </div>
        )}

        {/* Variant selection (custom mode or no presets) */}
        {showVariantSelector && brand && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("tools.aaAddressCalculator.variant")}
            </label>
            {variantOptions.length <= 3 ? (
              <SegmentedControl
                options={variantOptions.map((v) => ({
                  label: v.label,
                  value: v.value,
                }))}
                value={variantId}
                onChange={setVariantId}
                className="w-full"
              />
            ) : (
              <Select
                options={variantOptions}
                value={variantId}
                onChange={setVariantId}
              />
            )}
          </div>
        )}

        {/* EntryPoint + Factory info */}
        {(() => {
          const v = getVariantById(brandId, variantId);
          if (!v) return null;
          return (
            <div className="rounded-lg border border-border bg-surface-hover px-3 py-2 text-xs text-text-muted">
              <span className="font-medium text-text-secondary">
                {t("tools.aaAddressCalculator.variant")}:
              </span>{" "}
              {t(v.labelKey)}
              {v.entryPoint && (
                <>
                  <span className="mx-1.5 text-border-strong">|</span>
                  <span className="font-medium text-text-secondary">
                    {t("tools.aaAddressCalculator.entryPoint")}:
                  </span>{" "}
                  {v.entryPoint}
                </>
              )}
              <span className="mx-1.5 text-border-strong">|</span>
              <span className="font-medium text-text-secondary">
                {t("tools.aaAddressCalculator.factory")}:
              </span>{" "}
              <span className="font-mono">
                {v.factory.slice(0, 6)}...{v.factory.slice(-4)}
              </span>
            </div>
          );
        })()}
      </div>
    </Card>
  );
}
