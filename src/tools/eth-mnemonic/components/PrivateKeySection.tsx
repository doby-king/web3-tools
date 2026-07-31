import { useTranslation } from "react-i18next";
import { Card, CopyButton, SecretText } from "@/components/ui";

export function PrivateKeySection({ privateKey }: { privateKey: string }) {
  const { t } = useTranslation();

  return (
    <Card>
      <h2 className="font-display text-base font-semibold text-text">
        {t("tools.ethMnemonic.privateKey.title")}
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-hover px-3 py-2.5">
        <SecretText value={privateKey} className="min-w-0 flex-1" />
        <CopyButton
          text={privateKey}
          label={t("tools.ethMnemonic.privateKey.copy")}
          className="shrink-0"
        />
      </div>
      <p className="mt-2 text-xs text-text-muted">
        {t("tools.ethMnemonic.privateKey.note")}
      </p>
    </Card>
  );
}
