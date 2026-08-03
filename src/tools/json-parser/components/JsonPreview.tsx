import { useTranslation } from "react-i18next";
import { Card, CopyButton } from "@/components/ui";
import { WarningIcon } from "@/components/ui/icons";
import type { FormatResult } from "../logic";
import { JsonTreeView } from "./JsonTreeView";

export interface JsonPreviewProps {
  result: FormatResult;
}

export function JsonPreview({ result }: JsonPreviewProps) {
  const { t } = useTranslation();

  const copyText =
    result.ok && !("empty" in result && result.empty) && "text" in result
      ? result.text
      : "";

  return (
    <Card className="flex h-full min-h-0 flex-col p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold text-text">
          {t("tools.jsonParser.previewLabel")}
        </h2>
        {copyText ? (
          <CopyButton
            text={copyText}
            label={t("tools.jsonParser.copyResult")}
          />
        ) : null}
      </div>

      <div className="min-h-[320px] flex-1 overflow-hidden rounded-lg border border-border bg-bg sm:min-h-[420px]">
        {!result.ok ? (
          <div className="flex h-full flex-col gap-2 p-4" role="alert">
            <p className="flex items-center gap-1.5 text-sm font-medium text-danger">
              <WarningIcon size={16} className="shrink-0" />
              {t("tools.jsonParser.errorTitle")}
            </p>
            <p className="font-mono text-xs leading-relaxed text-text-secondary break-all">
              {result.error.message}
            </p>
            {result.error.line != null && result.error.column != null && (
              <p className="text-xs text-danger">
                {t("tools.jsonParser.errorAt", {
                  line: result.error.line,
                  column: result.error.column,
                })}
              </p>
            )}
            {result.error.snippet && (
              <p className="rounded-md border border-danger/20 bg-danger/8 px-2.5 py-2 font-mono text-xs text-text-secondary break-all">
                {t("tools.jsonParser.errorSnippet", {
                  snippet: result.error.snippet,
                })}
              </p>
            )}
          </div>
        ) : "empty" in result && result.empty ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-text-muted">
            {t("tools.jsonParser.empty")}
          </div>
        ) : "text" in result ? (
          <JsonTreeView value={result.value} className="h-full p-2" />
        ) : null}
      </div>
    </Card>
  );
}
