import { useTranslation } from "react-i18next";
import { Callout, Card } from "@/components/ui";
import { WarningIcon } from "@/components/ui/icons";
import type { VerifyStatus } from "../logic";

export interface JwtInputPanelProps {
  token: string;
  keyInput: string;
  verifyStatus: VerifyStatus;
  onTokenChange: (value: string) => void;
  onKeyChange: (value: string) => void;
}

export function JwtInputPanel({
  token,
  keyInput,
  verifyStatus,
  onTokenChange,
  onKeyChange,
}: JwtInputPanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col gap-4 p-4">
      <div>
        <label
          htmlFor="jwt-token-input"
          className="mb-2 block font-display text-sm font-semibold text-text"
        >
          {t("tools.jwtParser.tokenLabel")}
        </label>
        <textarea
          id="jwt-token-input"
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder={t("tools.jwtParser.tokenPlaceholder")}
          spellCheck={false}
          className="min-h-[120px] w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs leading-5 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary"
        />
      </div>

      <div>
        <label
          htmlFor="jwt-key-input"
          className="mb-2 block font-display text-sm font-semibold text-text"
        >
          {t("tools.jwtParser.keyLabel")}
        </label>
        <p className="mb-2 text-xs text-text-muted">
          {t("tools.jwtParser.keyHint")}
        </p>
        <textarea
          id="jwt-key-input"
          value={keyInput}
          onChange={(e) => onKeyChange(e.target.value)}
          placeholder={t("tools.jwtParser.keyPlaceholder")}
          spellCheck={false}
          className="min-h-[100px] w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs leading-5 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary"
        />
      </div>

      <VerifyStatusBar status={verifyStatus} />
    </Card>
  );
}

function VerifyStatusBar({ status }: { status: VerifyStatus }) {
  const { t } = useTranslation();

  if (status.kind === "idle") {
    return null;
  }

  if (status.kind === "skipped") {
    return (
      <p className="text-xs text-text-muted">
        {t("tools.jwtParser.verifySkipped")}
      </p>
    );
  }

  if (status.kind === "valid") {
    return (
      <Callout variant="success">{t("tools.jwtParser.verifyValid")}</Callout>
    );
  }

  if (status.kind === "unsupportedAlg") {
    return (
      <Callout variant="warning">
        {t("tools.jwtParser.verifyUnsupportedAlg", { alg: status.alg || "—" })}
      </Callout>
    );
  }

  if (status.kind === "keyError") {
    return (
      <Callout variant="warning">
        <span>{t("tools.jwtParser.verifyKeyError")}</span>
        {status.detail ? (
          <span className="mt-1 block font-mono text-xs break-all opacity-80">
            {status.detail}
          </span>
        ) : null}
      </Callout>
    );
  }

  // invalid
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger/8 px-3.5 py-3 text-sm leading-relaxed text-text-secondary"
    >
      <WarningIcon size={16} className="mt-0.5 shrink-0 text-danger" />
      <span>{t("tools.jwtParser.verifyInvalid")}</span>
    </div>
  );
}
