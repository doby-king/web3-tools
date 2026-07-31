import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CopyButton,
  QRCodeCard,
  SegmentedControl,
} from "@/components/ui";
import type { WordCount } from "../crypto";
import { WordGrid } from "./WordGrid";

interface MnemonicPanelProps {
  wordCount: WordCount;
  mnemonic: string;
  onWordCountChange: (wordCount: WordCount) => void;
  onRegenerate: () => void;
}

export function MnemonicPanel({
  wordCount,
  mnemonic,
  onWordCountChange,
  onRegenerate,
}: MnemonicPanelProps) {
  const { t } = useTranslation();
  const [showQR, setShowQR] = useState(false);

  const wordCountOptions: Array<{ label: string; value: WordCount }> = [
    { label: t("tools.ethMnemonic.mnemonic.words12"), value: 12 },
    { label: t("tools.ethMnemonic.mnemonic.words24"), value: 24 },
  ];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-text">
          {t("tools.ethMnemonic.mnemonic.title")}
        </h2>
        <div className="flex items-center gap-3">
          <SegmentedControl
            options={wordCountOptions}
            value={wordCount}
            onChange={onWordCountChange}
          />
          <Button variant="primary" size="sm" onClick={onRegenerate}>
            {t("tools.ethMnemonic.mnemonic.regenerate")}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <WordGrid words={mnemonic.split(" ")} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CopyButton
          text={mnemonic}
          label={t("tools.ethMnemonic.mnemonic.copy")}
        />
        <Button variant="ghost" size="sm" onClick={() => setShowQR((v) => !v)}>
          {showQR ? t("common.hideQRCode") : t("common.showQRCode")}
        </Button>
      </div>

      {showQR && (
        <div className="animate-fade-in-up mt-4 flex flex-col items-start gap-2">
          <QRCodeCard
            value={mnemonic}
            title={t("tools.ethMnemonic.mnemonic.qrTitle")}
          />
          <p className="text-xs text-warning">
            {t("tools.ethMnemonic.mnemonic.qrWarning")}
          </p>
        </div>
      )}
    </Card>
  );
}
