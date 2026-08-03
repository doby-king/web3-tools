import { useTranslation } from "react-i18next";
import { Card, Switch } from "@/components/ui";

export interface JsonInputPanelProps {
  value: string;
  escapeOn: boolean;
  minifyOn: boolean;
  onInputChange: (value: string) => void;
  onEscapeChange: (value: boolean) => void;
  onMinifyChange: (value: boolean) => void;
}

export function JsonInputPanel({
  value,
  escapeOn,
  minifyOn,
  onInputChange,
  onEscapeChange,
  onMinifyChange,
}: JsonInputPanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex h-full min-h-0 flex-col p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold text-text">
          {t("tools.jsonParser.inputLabel")}
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
            <Switch
              checked={escapeOn}
              onChange={onEscapeChange}
              aria-label={t("tools.jsonParser.escape")}
            />
            <span>{t("tools.jsonParser.escape")}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
            <Switch
              checked={minifyOn}
              onChange={onMinifyChange}
              aria-label={t("tools.jsonParser.minify")}
            />
            <span>{t("tools.jsonParser.minify")}</span>
          </label>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={t("tools.jsonParser.inputPlaceholder")}
        spellCheck={false}
        className="min-h-[320px] flex-1 resize-y rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs leading-5 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary sm:min-h-[420px]"
      />
    </Card>
  );
}
