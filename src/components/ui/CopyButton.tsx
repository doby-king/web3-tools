import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/cn";
import { CheckIcon, CopyIcon } from "./icons";

export interface CopyButtonProps {
  text: string;
  /** Text shown after the icon (optional) */
  label?: string;
  className?: string;
}

type CopyState = "idle" | "copied" | "failed";

export function CopyButton({ text, label, className }: CopyButtonProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<CopyState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    const ok = await copyText(text);
    setState(ok ? "copied" : "failed");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setState("idle"), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={t("common.copy")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium",
        "transition-colors cursor-pointer hover:bg-surface-hover",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        state === "copied" && "text-success border-success/40",
        state === "failed" && "text-danger border-danger/40",
        state === "idle" && "text-text-secondary",
        className,
      )}
    >
      {state === "copied" ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      {state === "copied"
        ? t("common.copied")
        : state === "failed"
          ? t("common.copyFailed")
          : label}
    </button>
  );
}
