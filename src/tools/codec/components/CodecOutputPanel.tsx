import { useTranslation } from "react-i18next";
import type { ParseKeys } from "i18next";
import { Card, CopyButton } from "@/components/ui";
import { WarningIcon } from "@/components/ui/icons";

export interface CodecOutputPanelProps {
  output: string;
  errorKey: string | null;
}

export function CodecOutputPanel({ output, errorKey }: CodecOutputPanelProps) {
  const { t } = useTranslation();
  const hasError = Boolean(errorKey);
  const hasOutput = !hasError && output.length > 0;
  const isEmpty = !hasError && !hasOutput;

  return (
    <Card className="flex h-full min-h-0 flex-col p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold text-text">
          {t("tools.codec.outputLabel")}
        </h2>
        {hasOutput ? (
          <CopyButton text={output} label={t("tools.codec.copyResult")} />
        ) : null}
      </div>

      <div className="min-h-[240px] flex-1 overflow-auto rounded-lg border border-border bg-bg sm:min-h-[320px]">
        {hasError && errorKey ? (
          <div className="flex h-full flex-col gap-2 p-4" role="alert">
            <p className="flex items-center gap-1.5 text-sm font-medium text-danger">
              <WarningIcon size={16} className="shrink-0" />
              {t("tools.codec.errorTitle")}
            </p>
            <p className="text-xs leading-relaxed text-text-secondary">
              {t(errorKey as ParseKeys)}
            </p>
          </div>
        ) : isEmpty ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-text-muted">
            {t("tools.codec.empty")}
          </div>
        ) : (
          <pre className="h-full overflow-auto p-3 font-mono text-xs leading-5 whitespace-pre-wrap break-all text-text">
            {output}
          </pre>
        )}
      </div>
    </Card>
  );
}
