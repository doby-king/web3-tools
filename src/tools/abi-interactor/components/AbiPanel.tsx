import { useTranslation } from "react-i18next";
import { isAddress } from "ethers";
import { Card, Input } from "@/components/ui";
import { WarningIcon, CheckIcon } from "@/components/ui/icons";
import { ABI_PRESETS, CUSTOM_ABI_ID, getPresetById } from "../presets";
import { useAbiInteractorStore } from "../store";
import type { AbiParseResult } from "../lib/abi";

interface AbiPanelProps {
  parseResult: AbiParseResult | null;
}

export function AbiPanel({ parseResult }: AbiPanelProps) {
  const { t } = useTranslation();
  const contractAddress = useAbiInteractorStore((s) => s.contractAddress);
  const abiPresetId = useAbiInteractorStore((s) => s.abiPresetId);
  const customAbi = useAbiInteractorStore((s) => s.customAbi);
  const setContractAddress = useAbiInteractorStore((s) => s.setContractAddress);
  const setAbiPresetId = useAbiInteractorStore((s) => s.setAbiPresetId);
  const setCustomAbi = useAbiInteractorStore((s) => s.setCustomAbi);

  const isCustom = abiPresetId === CUSTOM_ABI_ID;
  const preset = getPresetById(abiPresetId);
  const abiText = isCustom ? customAbi : preset ? JSON.stringify(preset.abi, null, 2) : "";
  const addressInvalid = contractAddress.length > 0 && !isAddress(contractAddress);

  return (
    <Card>
      <h2 className="font-display text-sm font-semibold text-text">
        {t("tools.abiInteractor.contract.title")}
      </h2>

      <div className="mt-3 space-y-4">
        {/* Contract address */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            {t("tools.abiInteractor.contract.addressLabel")}
          </label>
          <Input
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder={t("tools.abiInteractor.contract.addressPlaceholder")}
            className="font-mono text-xs"
          />
          {addressInvalid && (
            <p className="flex items-center gap-1 text-xs text-danger">
              <WarningIcon size={12} />
              {t("tools.abiInteractor.contract.invalidAddress")}
            </p>
          )}
        </div>

        {/* ABI preset selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            {t("tools.abiInteractor.abi.presetLabel")}
          </label>
          <select
            value={abiPresetId}
            onChange={(e) => setAbiPresetId(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none transition-colors focus:border-primary"
          >
            {ABI_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {t(p.labelKey)}
              </option>
            ))}
            <option value={CUSTOM_ABI_ID}>
              {t("tools.abiInteractor.abi.custom")}
            </option>
          </select>
        </div>

        {/* ABI editor */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            {t("tools.abiInteractor.abi.editorLabel")}
          </label>
          <textarea
            value={abiText}
            onChange={(e) => setCustomAbi(e.target.value)}
            readOnly={!isCustom}
            placeholder={t("tools.abiInteractor.abi.placeholder")}
            rows={8}
            className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary read-only:cursor-default read-only:bg-surface-hover read-only:text-text-secondary"
          />
          {/* Parse status feedback (only meaningful for custom ABI) */}
          {isCustom && parseResult && !parseResult.ok && (
            <p className="flex items-center gap-1 text-xs text-danger">
              <WarningIcon size={12} />
              {t(`tools.abiInteractor.abi.errors.${parseResult.error}`)}
            </p>
          )}
          {parseResult?.ok && (
            <p className="flex items-center gap-1 text-xs text-success">
              <CheckIcon size={12} />
              {t("tools.abiInteractor.abi.parsedSummary", {
                read: parseResult.parsed.readFunctions.length,
                write: parseResult.parsed.writeFunctions.length,
              })}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
