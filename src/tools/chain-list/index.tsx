import { useTranslation } from "react-i18next";
import { Callout } from "@/components/ui";

const CHAINLIST_URL = "https://chainlist.org/";

export default function ChainListTool() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col px-4 py-4 sm:px-6">
      {/* Header */}
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

      {/* iframe */}
      <div className="animate-fade-in-up mt-3 min-h-[300px] flex-1 overflow-hidden rounded-xl border border-border">
        <iframe
          src={CHAINLIST_URL}
          title={t("tools.chainList.name")}
          className="h-full w-full"
          allow="clipboard-read; clipboard-write"
          loading="lazy"
        />
      </div>
    </div>
  );
}
