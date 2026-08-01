import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAddress } from "ethers";
import {
  Button,
  Card,
  CopyButton,
  Input,
  ExternalLinkIcon,
  XIcon,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { getVariantById, getPresetById } from "../wallets";
import type { InitCodeParams } from "../wallets";
import { computeAddress } from "../lib/create2";
import { useAaCalculatorStore } from "../store";

interface AddressCalcPanelProps {
  rpcUrl: string | null;
  explorerUrl: string | null;
}

export function AddressCalcPanel({ explorerUrl }: AddressCalcPanelProps) {
  const { t } = useTranslation();
  const brandId = useAaCalculatorStore((s) => s.brandId);
  const presetId = useAaCalculatorStore((s) => s.presetId);
  const variantId = useAaCalculatorStore((s) => s.variantId);
  const owner = useAaCalculatorStore((s) => s.owner);
  const owners = useAaCalculatorStore((s) => s.owners);
  const salt = useAaCalculatorStore((s) => s.salt);
  const threshold = useAaCalculatorStore((s) => s.threshold);
  const setOwner = useAaCalculatorStore((s) => s.setOwner);
  const setOwners = useAaCalculatorStore((s) => s.setOwners);
  const setSalt = useAaCalculatorStore((s) => s.setSalt);
  const setThreshold = useAaCalculatorStore((s) => s.setThreshold);

  const [showDetails, setShowDetails] = useState(false);

  const variant = getVariantById(brandId, variantId);
  const preset =
    presetId !== "custom" ? getPresetById(brandId, presetId) : undefined;

  // Determine which fields to show based on preset or variant
  const ownerMode = variant?.ownerMode ?? "single";
  const isPresetMode = preset !== undefined;
  const userInputFields = preset?.userInputFields ?? ["owner", "salt"];

  const showOwnerInput =
    ownerMode === "single" &&
    (!isPresetMode || userInputFields.includes("owner"));
  const showOwnersInput =
    (ownerMode === "multi" || ownerMode === "bytes") &&
    (!isPresetMode || userInputFields.includes("owners"));
  const showSaltInput = !isPresetMode || userInputFields.includes("salt");
  const showThreshold = brandId === "safe" && !isPresetMode;

  // Build params for computation
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
    // Merge preset fixed params
    if (preset?.fixedParams) {
      return { ...base, ...preset.fixedParams };
    }
    return base;
  }, [owner, owners, salt, threshold, preset]);

  // Validate inputs
  const ownerValid =
    !showOwnerInput || (owner.trim() !== "" && isAddress(owner.trim()));
  const ownersValid =
    !showOwnersInput ||
    (owners.filter((o) => o.trim()).length > 0 &&
      owners.filter((o) => o.trim()).every((o) => isAddress(o.trim())));
  const canCompute = variant && ownerValid && ownersValid;

  // Compute address
  const result = useMemo(() => {
    if (!canCompute || !variant) return null;
    try {
      return computeAddress(variant, params);
    } catch {
      return null;
    }
  }, [canCompute, variant, params]);

  // Update a single owner in the list
  const updateOwner = (index: number, value: string) => {
    const next = [...owners];
    next[index] = value;
    setOwners(next);
  };

  const addOwner = () => setOwners([...owners, ""]);
  const removeOwner = (index: number) => {
    if (owners.length <= 1) return;
    setOwners(owners.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-text">
        {t("tools.aaAddressCalculator.addressCalc")}
      </h2>

      <div className="space-y-4">
        {/* Single owner input */}
        {showOwnerInput && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("tools.aaAddressCalculator.ownerAddress")}
            </label>
            <Input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder={t("tools.aaAddressCalculator.addressPlaceholder")}
              className="font-mono"
            />
            {owner.trim() !== "" && !ownerValid && (
              <p className="mt-1 text-xs text-red-500">
                {t("tools.aaAddressCalculator.invalidAddress")}
              </p>
            )}
          </div>
        )}

        {/* Multi owner inputs */}
        {showOwnersInput && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("tools.aaAddressCalculator.ownerAddresses")}
            </label>
            <div className="space-y-2">
              {owners.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={o}
                    onChange={(e) => updateOwner(i, e.target.value)}
                    placeholder={t(
                      "tools.aaAddressCalculator.addressPlaceholder",
                    )}
                    className="flex-1 font-mono"
                  />
                  {owners.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOwner(i)}
                      className="shrink-0 text-text-muted"
                      aria-label={t("common.remove")}
                    >
                      <XIcon size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={addOwner}
              className="mt-2"
            >
              {t("tools.aaAddressCalculator.addOwner")}
            </Button>
            {owners.some((o) => o.trim() !== "" && !isAddress(o.trim())) && (
              <p className="mt-1 text-xs text-red-500">
                {t("tools.aaAddressCalculator.invalidAddress")}
              </p>
            )}
          </div>
        )}

        {/* Threshold (Safe) */}
        {showThreshold && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("tools.aaAddressCalculator.threshold")}
            </label>
            <Input
              type="number"
              min={1}
              value={threshold}
              onChange={(e) =>
                setThreshold(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-24"
            />
          </div>
        )}

        {/* Salt input */}
        {showSaltInput && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">
              {t("tools.aaAddressCalculator.salt")}
            </label>
            <Input
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              placeholder={t("tools.aaAddressCalculator.saltPlaceholder")}
              // eslint-disable-next-line i18next/no-literal-string
              inputMode="numeric"
              className="font-mono text-xs"
            />
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-lg border border-border bg-surface-hover p-4">
            <p className="mb-1 text-xs font-medium text-text-secondary">
              {t("tools.aaAddressCalculator.computedAddress")}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all font-mono text-sm font-semibold text-primary">
                {result.address}
              </code>
              <CopyButton text={result.address} />
              {explorerUrl && (
                <a
                  href={`${explorerUrl}/address/${result.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-text-muted transition-colors hover:text-primary"
                  title={t("tools.aaAddressCalculator.viewOnExplorer")}
                >
                  <ExternalLinkIcon size={16} />
                </a>
              )}
            </div>

            {/* Details toggle */}
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="mt-3 text-xs text-text-secondary underline transition-colors hover:text-primary"
            >
              {showDetails
                ? t("tools.aaAddressCalculator.hideDetails")
                : t("tools.aaAddressCalculator.showDetails")}
            </button>

            {showDetails && (
              <div className="mt-3 space-y-3 border-t border-border pt-3">
                <DetailRow
                  label={t("tools.aaAddressCalculator.factory")}
                  value={result.factory}
                />
                <DetailRow
                  label={t("tools.aaAddressCalculator.initCodeHash")}
                  value={result.initCodeHash}
                />
                <DetailRow
                  label={t("tools.aaAddressCalculator.initCode")}
                  value={result.initCode}
                  multiline
                />
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {!result && canCompute === false && variant && (
          <p className="text-sm text-text-muted">
            {t("tools.aaAddressCalculator.enterOwnerPrompt")}
          </p>
        )}
      </div>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-text-muted">{label}</p>
      <div className="flex items-start gap-2">
        <code
          className={cn(
            "flex-1 break-all font-mono text-xs text-text-secondary",
            multiline && "max-h-24 overflow-y-auto whitespace-pre-wrap",
          )}
        >
          {value}
        </code>
        <CopyButton text={value} />
      </div>
    </div>
  );
}
