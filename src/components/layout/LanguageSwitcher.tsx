import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "@/i18n";
import { cn } from "@/lib/cn";
import { CheckIcon, GlobeIcon } from "@/components/ui";

/** Header language dropdown: shows the current language's native name; closes on outside click / Esc */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentCode = i18n.resolvedLanguage ?? i18n.language;
  const current =
    supportedLanguages.find((l) => l.code === currentCode) ??
    supportedLanguages[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.language")}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm text-text-secondary transition-colors cursor-pointer hover:bg-surface-hover hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <GlobeIcon size={16} />
        <span>{current.label}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("common.language")}
          className="animate-fade-in-up absolute right-0 top-full z-50 mt-2 w-36 rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          {supportedLanguages.map((lang) => {
            const active = lang.code === currentCode;
            return (
              <li key={lang.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-sm transition-colors cursor-pointer hover:bg-surface-hover",
                    active ? "text-primary" : "text-text-secondary",
                  )}
                >
                  {lang.label}
                  {active && <CheckIcon size={14} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
