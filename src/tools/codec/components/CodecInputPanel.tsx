import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui";
import { countStats } from "../logic";

export interface CodecInputPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodecInputPanel({ value, onChange }: CodecInputPanelProps) {
  const { t } = useTranslation();
  const stats = useMemo(() => countStats(value), [value]);

  return (
    <Card className="flex h-full min-h-0 flex-col p-4">
      <h2 className="mb-3 font-display text-sm font-semibold text-text">
        {t("tools.codec.inputLabel")}
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("tools.codec.inputPlaceholder")}
        spellCheck={false}
        className="min-h-[240px] flex-1 resize-y rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs leading-5 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary sm:min-h-[320px]"
      />
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2 text-xs text-text-muted">
        <span>{t("tools.codec.statsChars", { count: stats.chars })}</span>
        <span>{t("tools.codec.statsBytes", { count: stats.bytes })}</span>
      </div>
    </Card>
  );
}
