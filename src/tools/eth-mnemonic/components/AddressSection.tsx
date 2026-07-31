import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  Callout,
  Card,
  CopyButton,
  QRCodeCard,
} from "@/components/ui";

export function AddressSection({
  address,
  path,
}: {
  address: string;
  path: string;
}) {
  const { t } = useTranslation();
  const [showQR, setShowQR] = useState(false);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-text">
          {t("tools.ethMnemonic.address.title")}
        </h2>
        <Badge variant="primary" className="font-mono">
          {path}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-hover px-3 py-2.5">
        <span className="min-w-0 flex-1 font-mono text-sm break-all text-text">
          {address}
        </span>
        <CopyButton
          text={address}
          label={t("tools.ethMnemonic.address.copy")}
          className="shrink-0"
        />
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => setShowQR((v) => !v)}
        >
          {showQR ? t("common.hideQRCode") : t("common.showQRCode")}
        </Button>
      </div>

      {showQR && (
        <div className="animate-fade-in-up mt-4">
          <QRCodeCard
            value={address}
            title={t("tools.ethMnemonic.address.qrTitle")}
          />
        </div>
      )}

      <Callout variant="success" className="mt-4">
        {t("tools.ethMnemonic.address.walletNote")}
      </Callout>
    </Card>
  );
}
