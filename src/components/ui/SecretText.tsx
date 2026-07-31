import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { EyeIcon, EyeOffIcon } from "./icons";

export interface SecretTextProps {
  value: string;
  /** Mask length strategy: 'match' mirrors the original length, or a fixed number of dots */
  maskedLength?: "match" | number;
  className?: string;
}

export function SecretText({
  value,
  maskedLength = "match",
  className,
}: SecretTextProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const mask = "•".repeat(
    maskedLength === "match" ? value.length : maskedLength,
  );

  return (
    <span className={cn("inline-flex items-center gap-2 min-w-0", className)}>
      <span className="font-mono text-sm break-all text-text">
        {visible ? value : mask}
      </span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("common.hideContent") : t("common.showContent")}
        aria-pressed={visible}
        className={cn(
          "shrink-0 rounded-md p-1 text-text-muted transition-colors cursor-pointer",
          "hover:bg-surface-hover hover:text-text",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        )}
      >
        {visible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
      </button>
    </span>
  );
}
