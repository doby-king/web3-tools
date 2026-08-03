import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui";
import { isValidDecimals, MAX_DECIMALS } from "../lib/convert";
import { useUnitConverterStore } from "../store";
import { AmountPair } from "./AmountPair";

export function CustomPanel() {
  const { t } = useTranslation();
  const customDecimals = useUnitConverterStore((s) => s.customDecimals);
  const setCustomDecimals = useUnitConverterStore((s) => s.setCustomDecimals);

  const valid = isValidDecimals(customDecimals);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-4">
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">
          {t("tools.unitConverter.decimalsLabel")}
        </label>
        <div className="flex items-center gap-3">
          <Input
            value={customDecimals}
            onChange={(e) => setCustomDecimals(e.target.value)}
            placeholder={t("tools.unitConverter.decimalsPlaceholder")}
            spellCheck={false}
            className={
              !valid
                ? "w-40 border-danger font-mono focus:border-danger focus:ring-danger/25"
                : "w-40 font-mono"
            }
          />
          <span className="text-xs text-text-muted">
            {t("tools.unitConverter.decimalsRange", { max: MAX_DECIMALS })}
          </span>
        </div>
        {!valid && (
          <p className="mt-2 text-xs text-danger">
            {t("tools.unitConverter.errInvalidDecimals")}
          </p>
        )}
      </div>

      {valid && (
        <div className="animate-fade-in-up rounded-xl border border-border bg-surface p-4">
          <AmountPair
            decimals={Number(customDecimals)}
            topLabel={t("tools.unitConverter.customAmountLabel")}
            bottomLabel={t("tools.unitConverter.baseUnitRaw")}
          />
        </div>
      )}
    </div>
  );
}
