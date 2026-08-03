import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Input } from "@/components/ui";
import { UNIT_PRESETS, type UnitPreset } from "../lib/presets";
import { fromBaseUnits, toBaseUnits } from "../lib/convert";

/** One table row with its own independent bidirectional converter */
function PresetRow({ preset }: { preset: UnitPreset }) {
  const { t } = useTranslation();
  const [display, setDisplay] = useState("");
  const [base, setBase] = useState("");

  const handleDisplayChange = (value: string) => {
    setDisplay(value);
    setBase(value === "" ? "" : (toBaseUnits(value, preset.decimals) ?? ""));
  };

  const handleBaseChange = (value: string) => {
    setBase(value);
    setDisplay(
      value === "" ? "" : (fromBaseUnits(value, preset.decimals) ?? ""),
    );
  };

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface-hover/50 transition-colors">
      {/* Asset */}
      <td className="px-4 py-3.5 align-middle">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-text">
            {preset.symbol}
          </span>
          <span className="text-xs text-text-muted">{preset.name}</span>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3.5 align-middle">
        <Badge variant={preset.category === "native" ? "default" : "primary"}>
          {preset.category === "native"
            ? t("tools.unitConverter.categoryNative")
            : t("tools.unitConverter.categoryStablecoin")}
        </Badge>
      </td>

      {/* Decimals */}
      <td className="px-4 py-3.5 align-middle font-mono text-sm text-text-secondary">
        {preset.decimals}
      </td>

      {/* Independent bidirectional converter */}
      <td className="px-4 py-3.5 align-middle">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Input
              value={display}
              onChange={(e) => handleDisplayChange(e.target.value)}
              spellCheck={false}
              placeholder="0.0"
              className="h-8 flex-1 font-mono"
            />
            <span className="w-20 shrink-0 font-mono text-xs text-text-secondary">
              {preset.symbol}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={base}
              onChange={(e) => handleBaseChange(e.target.value)}
              spellCheck={false}
              placeholder="0"
              className="h-8 flex-1 font-mono"
            />
            <span className="w-20 shrink-0 truncate font-mono text-xs text-text-secondary">
              {preset.baseUnit}
            </span>
          </div>
          <p className="font-mono text-[11px] text-text-muted">
            {t("tools.unitConverter.hintConversion", {
              symbol: preset.symbol,
              decimals: preset.decimals,
              baseUnit: preset.baseUnit,
            })}
          </p>
        </div>
      </td>
    </tr>
  );
}

export function PresetPanel() {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-border bg-surface-hover/60">
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t("tools.unitConverter.colAsset")}
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t("tools.unitConverter.colCategory")}
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t("tools.unitConverter.colDecimals")}
            </th>
            <th className="w-[320px] px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {t("tools.unitConverter.colConvert")}
            </th>
          </tr>
        </thead>
        <tbody>
          {UNIT_PRESETS.map((preset) => (
            <PresetRow key={preset.id} preset={preset} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
