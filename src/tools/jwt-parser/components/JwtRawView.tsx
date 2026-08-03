import { useTranslation } from "react-i18next";
import { Badge, Card, CopyButton } from "@/components/ui";
import { WarningIcon } from "@/components/ui/icons";
import { getTimeValidity, type JwtParseResult } from "../logic";

export interface JwtRawViewProps {
  result: JwtParseResult;
}

export function JwtRawView({ result }: JwtRawViewProps) {
  const { t } = useTranslation();

  const decoded =
    result.ok && !result.empty && "decoded" in result
      ? result.decoded
      : null;
  const copyText = decoded?.rawJson ?? "";
  const timeStatus = decoded
    ? getTimeValidity(decoded.payload)
    : null;

  return (
    <Card className="flex h-full min-h-0 flex-col p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-sm font-semibold text-text">
            {t("tools.jwtParser.rawLabel")}
          </h2>
          {timeStatus ? <TimeValidityBadge status={timeStatus} /> : null}
        </div>
        {copyText ? (
          <CopyButton text={copyText} label={t("tools.jwtParser.copyRaw")} />
        ) : null}
      </div>

      <div className="min-h-[280px] flex-1 overflow-auto rounded-lg border border-border bg-bg sm:min-h-[360px]">
        {!result.ok ? (
          <div className="flex h-full flex-col gap-2 p-4" role="alert">
            <p className="flex items-center gap-1.5 text-sm font-medium text-danger">
              <WarningIcon size={16} className="shrink-0" />
              {t("tools.jwtParser.errorTitle")}
            </p>
            <p className="font-mono text-xs leading-relaxed break-all text-text-secondary">
              {t(`tools.jwtParser.error.${result.error.code}`)}
            </p>
          </div>
        ) : result.empty ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-text-muted">
            {t("tools.jwtParser.empty")}
          </div>
        ) : decoded ? (
          <pre className="h-full overflow-auto p-3 font-mono text-xs leading-5 whitespace-pre-wrap break-all text-text">
            {decoded.rawJson}
          </pre>
        ) : null}
      </div>
    </Card>
  );
}

function TimeValidityBadge({
  status,
}: {
  status: ReturnType<typeof getTimeValidity>;
}) {
  const { t } = useTranslation();

  if (status === "valid") {
    return (
      <Badge variant="success">{t("tools.jwtParser.timeStatusValid")}</Badge>
    );
  }

  if (status === "expired") {
    return (
      <Badge
        variant="default"
        className="border-danger/25 bg-danger/10 text-danger"
      >
        {t("tools.jwtParser.timeStatusExpired")}
      </Badge>
    );
  }

  if (status === "notYet") {
    return (
      <Badge variant="warning">{t("tools.jwtParser.timeStatusNotYet")}</Badge>
    );
  }

  return (
    <Badge variant="default">{t("tools.jwtParser.timeStatusNone")}</Badge>
  );
}
