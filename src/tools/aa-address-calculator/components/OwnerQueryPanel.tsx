import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { isAddress } from "ethers";
import {
  Button,
  Card,
  CopyButton,
  Input,
  Select,
  SpinnerIcon,
  type SelectOption,
} from "@/components/ui";
import { WALLET_BRANDS, getBrandById, getVariantById } from "../wallets";
import { queryOwners, queryCoinbaseOwners } from "../lib/chain";
import { useAaCalculatorStore } from "../store";
import { useState } from "react";

interface OwnerQueryPanelProps {
  rpcUrl: string | null;
}

export function OwnerQueryPanel({ rpcUrl }: OwnerQueryPanelProps) {
  const { t } = useTranslation();
  const queryAddress = useAaCalculatorStore((s) => s.queryAddress);
  const setQueryAddress = useAaCalculatorStore((s) => s.setQueryAddress);

  const [selectedBrand, setSelectedBrand] = useState("simple");
  const [selectedVariant, setSelectedVariant] = useState("simple-v06");

  const brand = getBrandById(selectedBrand);
  const variant = getVariantById(selectedBrand, selectedVariant);

  const brandOptions: SelectOption[] = WALLET_BRANDS.map((b) => ({
    value: b.id,
    label: t(b.labelKey),
  }));

  const variantOptions: SelectOption[] =
    brand?.variants.map((v) => ({
      value: v.id,
      label: t(v.labelKey),
    })) ?? [];

  const addressValid =
    queryAddress.trim() !== "" && isAddress(queryAddress.trim());
  const isCoinbase = selectedBrand === "coinbase";
  const ownerQuery = variant?.ownerQuery ?? null;
  const canQuery = addressValid && rpcUrl && (ownerQuery || isCoinbase);

  const {
    data: ownerResult,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["aa-owner-query", rpcUrl, queryAddress, selectedVariant],
    queryFn: async () => {
      if (isCoinbase) {
        return queryCoinbaseOwners(rpcUrl!, queryAddress.trim());
      }
      return queryOwners(rpcUrl!, queryAddress.trim(), ownerQuery!);
    },
    enabled: false, // manual trigger only
    retry: 1,
  });

  const handleBrandChange = (id: string) => {
    setSelectedBrand(id);
    const b = getBrandById(id);
    if (b && b.variants.length > 0) {
      setSelectedVariant(b.variants[0].id);
    }
  };

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-text">
        {t("tools.aaAddressCalculator.ownerQuery")}
      </h2>

      <div className="space-y-4">
        {/* AA Address input */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">
            {t("tools.aaAddressCalculator.aaAddress")}
          </label>
          <Input
            value={queryAddress}
            onChange={(e) => setQueryAddress(e.target.value)}
            className="font-mono"
          />
          {queryAddress.trim() !== "" && !addressValid && (
            <p className="mt-1 text-xs text-red-500">
              {t("tools.aaAddressCalculator.invalidAddress")}
            </p>
          )}
        </div>

        {/* Wallet type selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("tools.aaAddressCalculator.brand")}
            </label>
            <Select
              options={brandOptions}
              value={selectedBrand}
              onChange={handleBrandChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("tools.aaAddressCalculator.variant")}
            </label>
            <Select
              options={variantOptions}
              value={selectedVariant}
              onChange={setSelectedVariant}
            />
          </div>
        </div>

        {/* Query button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => refetch()}
          disabled={!canQuery || isLoading}
        >
          {isLoading && <SpinnerIcon size={14} className="mr-1.5" />}
          {t("tools.aaAddressCalculator.queryOwners")}
        </Button>

        {/* Not supported notice */}
        {!ownerQuery && !isCoinbase && (
          <p className="text-xs text-text-muted">
            {t("tools.aaAddressCalculator.ownerQueryNotSupported")}
          </p>
        )}

        {/* Results */}
        {ownerResult && (
          <div className="rounded-lg border border-border bg-surface-hover p-4">
            <p className="mb-2 text-xs font-medium text-text-secondary">
              {t("tools.aaAddressCalculator.owners")} ({ownerResult.method})
            </p>
            <div className="space-y-2">
              {ownerResult.owners.map((addr, i) => (
                <div key={i} className="flex items-center gap-2">
                  <code className="flex-1 break-all font-mono text-xs text-text">
                    {addr}
                  </code>
                  <CopyButton text={addr} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500">
            {t("tools.aaAddressCalculator.queryFailed")}
          </p>
        )}

        {!rpcUrl && (
          <p className="text-xs text-text-muted">
            {t("tools.aaAddressCalculator.noRpc")}
          </p>
        )}
      </div>
    </Card>
  );
}
