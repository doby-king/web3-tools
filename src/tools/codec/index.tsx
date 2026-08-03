import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Callout } from "@/components/ui";
import { CodecActions } from "./components/CodecActions";
import { CodecInputPanel } from "./components/CodecInputPanel";
import { CodecOutputPanel } from "./components/CodecOutputPanel";
import { FormatPicker } from "./components/FormatPicker";
import { decode, encode } from "./logic";
import { useCodecStore } from "./store";

export default function CodecTool() {
  const { t } = useTranslation();
  const format = useCodecStore((s) => s.format);
  const input = useCodecStore((s) => s.input);
  const output = useCodecStore((s) => s.output);
  const errorKey = useCodecStore((s) => s.errorKey);
  const setFormat = useCodecStore((s) => s.setFormat);
  const setInput = useCodecStore((s) => s.setInput);
  const setResult = useCodecStore((s) => s.setResult);
  const setHasHydrated = useCodecStore((s) => s.setHasHydrated);

  useEffect(() => {
    useCodecStore.persist.rehydrate()?.catch(() => {
      setHasHydrated(true);
    });
  }, [setHasHydrated]);

  const handleEncode = () => {
    const result = encode(format, input);
    if (result.ok) {
      setResult({ output: result.text, errorKey: null });
    } else {
      setResult({ output: "", errorKey: result.errorKey });
    }
  };

  const handleDecode = () => {
    const result = decode(format, input);
    if (result.ok) {
      setResult({ output: result.text, errorKey: null });
    } else {
      setResult({ output: "", errorKey: result.errorKey });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold text-text">
          {t("tools.codec.name")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("tools.codec.subtitle")}
        </p>
        <div className="mt-4">
          <Callout variant="info">{t("tools.codec.privacyNotice")}</Callout>
        </div>
      </header>

      <div className="animate-fade-in-up mt-6">
        <FormatPicker value={format} onChange={setFormat} />
      </div>

      <main className="animate-fade-in-up mt-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <CodecInputPanel value={input} onChange={setInput} />
        <CodecActions onEncode={handleEncode} onDecode={handleDecode} />
        <CodecOutputPanel output={output} errorKey={errorKey} />
      </main>
    </div>
  );
}
