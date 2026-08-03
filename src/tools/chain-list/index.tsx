import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Callout } from "@/components/ui";
import { useThemeStore } from "@/stores/themeStore";

const EMBED_PREFIX = "/chainlist-embed";

export default function ChainListTool() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);

  // Persist theme for subsequent in-iframe navigations (no ?theme= on those URLs)
  useEffect(() => {
    document.cookie = `cl-embed-theme=${theme}; path=${EMBED_PREFIX}; SameSite=Lax; Max-Age=31536000`;
  }, [theme]);

  const embedSrc = useMemo(
    () => `${EMBED_PREFIX}/?theme=${theme}`,
    [theme],
  );

  return (
    <div className="flex h-full flex-col px-4 py-4 sm:px-6">
      <header className="animate-fade-in-up shrink-0">
        <h1 className="font-display text-2xl font-bold text-text">
          {t("tools.chainList.name")}
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          {t("tools.chainList.subtitle")}
        </p>
        <div className="mt-3">
          <Callout variant="info">{t("tools.chainList.embedNotice")}</Callout>
        </div>
      </header>

      <div className="animate-fade-in-up mt-3 min-h-[300px] flex-1 overflow-hidden rounded-xl border border-border bg-surface">
        <iframe
          key={theme}
          src={embedSrc}
          title={t("tools.chainList.name")}
          className="h-full w-full border-0"
          style={{ colorScheme: theme }}
          allow="clipboard-read; clipboard-write"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
