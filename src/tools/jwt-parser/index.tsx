import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Callout } from "@/components/ui";
import { JwtClaimsTable } from "./components/JwtClaimsTable";
import { JwtInputPanel } from "./components/JwtInputPanel";
import { JwtRawView } from "./components/JwtRawView";
import { parseJwt, verifyJwt, type VerifyStatus } from "./logic";
import { useJwtParserStore } from "./store";

export default function JwtParserTool() {
  const { t } = useTranslation();
  const token = useJwtParserStore((s) => s.token);
  const keyInput = useJwtParserStore((s) => s.keyInput);
  const setToken = useJwtParserStore((s) => s.setToken);
  const setKeyInput = useJwtParserStore((s) => s.setKeyInput);
  const setHasHydrated = useJwtParserStore((s) => s.setHasHydrated);
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>({
    kind: "idle",
  });

  useEffect(() => {
    useJwtParserStore.persist.rehydrate()?.catch(() => {
      setHasHydrated(true);
    });
  }, [setHasHydrated]);

  const parseResult = useMemo(() => parseJwt(token), [token]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const status = await verifyJwt(token, keyInput, parseResult);
      if (!cancelled) {
        setVerifyStatus(status);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [token, keyInput, parseResult]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold text-text">
          {t("tools.jwtParser.name")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("tools.jwtParser.subtitle")}
        </p>
        <div className="mt-4">
          <Callout variant="info">{t("tools.jwtParser.privacyNotice")}</Callout>
        </div>
      </header>

      <div className="animate-fade-in-up mt-6">
        <JwtInputPanel
          token={token}
          keyInput={keyInput}
          verifyStatus={verifyStatus}
          onTokenChange={setToken}
          onKeyChange={setKeyInput}
        />
      </div>

      <main className="animate-fade-in-up mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <JwtRawView result={parseResult} />
        <JwtClaimsTable result={parseResult} />
      </main>
    </div>
  );
}
