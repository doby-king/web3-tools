import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Callout } from "@/components/ui";
import { JsonInputPanel } from "./components/JsonInputPanel";
import { JsonPreview } from "./components/JsonPreview";
import { detectInputMode, previewJson } from "./logic";
import { useJsonParserStore } from "./store";

export default function JsonParserTool() {
  const { t } = useTranslation();
  const input = useJsonParserStore((s) => s.input);
  const escapeOn = useJsonParserStore((s) => s.escapeOn);
  const minifyOn = useJsonParserStore((s) => s.minifyOn);
  const setInput = useJsonParserStore((s) => s.setInput);
  const setEscapeOn = useJsonParserStore((s) => s.setEscapeOn);
  const setMinifyOn = useJsonParserStore((s) => s.setMinifyOn);
  const applyDetectedMode = useJsonParserStore((s) => s.applyDetectedMode);
  const setHasHydrated = useJsonParserStore((s) => s.setHasHydrated);

  useEffect(() => {
    useJsonParserStore.persist.rehydrate()?.catch(() => {
      setHasHydrated(true);
    });
  }, [setHasHydrated]);

  // Auto-detect escape / minify from input when the user hasn't manually toggled switches
  useEffect(() => {
    applyDetectedMode(detectInputMode(input));
  }, [input, applyDetectedMode]);

  const result = useMemo(() => previewJson(input), [input]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold text-text">
          {t("tools.jsonParser.name")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("tools.jsonParser.subtitle")}
        </p>
        <div className="mt-4">
          <Callout variant="info">
            {t("tools.jsonParser.privacyNotice")}
          </Callout>
        </div>
      </header>

      <main className="animate-fade-in-up mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <JsonInputPanel
          value={input}
          escapeOn={escapeOn}
          minifyOn={minifyOn}
          onInputChange={setInput}
          onEscapeChange={setEscapeOn}
          onMinifyChange={setMinifyOn}
        />
        <JsonPreview result={result} />
      </main>
    </div>
  );
}
