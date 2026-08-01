import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, Card, SpinnerIcon } from "@/components/ui";
import { checkDeployed } from "../lib/chain";
import { useAaCalculatorStore } from "../store";
import { getVariantById, getPresetById } from "../wallets";
import type { InitCodeParams } from "../wallets";
import { computeAddress } from "../lib/create2";
import { useMemo } from "react";

interface DeployCheckPanelProps {
  rpcUrl: string | null;
}

export function DeployCheckPanel({ rpcUrl }: DeployCheckPanelProps) {
  const { t } = useTranslation();
  const brandId = useAaCalculatorStore((s) => s.brandId);
  const presetId = useAaCalculatorStore((s) => s.presetId);
  const variantId = useAaCalculatorStore((s) => s.variantId);
  const owner = useAaCalculatorStore((s) => s.owner);
  const owners = useAaCalculatorStore((s) => s.owners);
  const salt = useAaCalculatorStore((s) => s.salt);
  const threshold = useAaCalculatorStore((s) => s.threshold);

  const variant = getVariantById(brandId, variantId);
  const preset =
    presetId !== "custom" ? getPresetById(brandId, presetId) : undefined;

  const params: InitCodeParams = useMemo(() => {
    const base: InitCodeParams = {
      owner: owner.trim() || undefined,
      owners:
        owners.filter((o) => o.trim()).length > 0
          ? owners.filter((o) => o.trim())
          : undefined,
      salt: salt.trim() || undefined,
      threshold,
    };
    if (preset?.fixedParams) {
      return { ...base, ...preset.fixedParams };
    }
    return base;
  }, [owner, owners, salt, threshold, preset]);

  const computedAddress = useMemo(() => {
    if (!variant) return null;
    try {
      return computeAddress(variant, params).address;
    } catch {
      return null;
    }
  }, [variant, params]);

  const {
    data: isDeployed,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["aa-deploy-check", rpcUrl, computedAddress],
    queryFn: () => checkDeployed(rpcUrl!, computedAddress!),
    enabled: !!rpcUrl && !!computedAddress,
    retry: 1,
  });

  if (!computedAddress) return null;

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-text">
        {t("tools.aaAddressCalculator.deployCheck")}
      </h2>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          disabled={!rpcUrl || isLoading || isFetching}
        >
          {isLoading || isFetching ? (
            <SpinnerIcon size={14} className="mr-1.5" />
          ) : null}
          {t("tools.aaAddressCalculator.checkDeploy")}
        </Button>

        {isDeployed !== undefined && !isLoading && (
          <Badge variant={isDeployed ? "success" : "default"}>
            {isDeployed
              ? t("tools.aaAddressCalculator.deployed")
              : t("tools.aaAddressCalculator.notDeployed")}
          </Badge>
        )}
      </div>

      {!rpcUrl && (
        <p className="mt-2 text-xs text-text-muted">
          {t("tools.aaAddressCalculator.noRpc")}
        </p>
      )}
    </Card>
  );
}
