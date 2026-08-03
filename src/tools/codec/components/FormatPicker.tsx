import { useTranslation } from "react-i18next";
import type { ParseKeys } from "i18next";
import { cn } from "@/lib/cn";
import { CODEC_FORMATS, type CodecFormatId } from "../logic";

export interface FormatPickerProps {
  value: CodecFormatId;
  onChange: (format: CodecFormatId) => void;
}

export function FormatPicker({ value, onChange }: FormatPickerProps) {
  const { t } = useTranslation();

  return (
    <div>
      <p className="mb-2 font-display text-sm font-semibold text-text">
        {t("tools.codec.formatLabel")}
      </p>
      <div
        role="radiogroup"
        aria-label={t("tools.codec.formatLabel")}
        className="flex flex-wrap gap-2"
      >
        {CODEC_FORMATS.map((format) => {
          const active = format === value;
          return (
            <button
              key={format}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(format)}
              className={cn(
                "cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary/25 bg-primary/10 text-primary"
                  : "border-border bg-surface text-text-secondary hover:border-border-strong hover:text-text",
              )}
            >
              {t(`tools.codec.formats.${format}` as ParseKeys)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 rounded-lg border border-border bg-surface-hover/40 px-3.5 py-3 text-sm leading-relaxed text-text-secondary">
        <p>
          <span className="font-medium text-text">
            {t("tools.codec.formatEncodeLabel")}
          </span>{" "}
          {t(`tools.codec.formatHints.${value}.encode` as ParseKeys)}
        </p>
        <p className="mt-1.5">
          <span className="font-medium text-text">
            {t("tools.codec.formatResultLabel")}
          </span>{" "}
          {t(`tools.codec.formatHints.${value}.result` as ParseKeys)}
        </p>
      </div>
    </div>
  );
}
