import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Callout } from "@/components/ui";
import { tryDeriveWallet } from "./crypto";
import { useEthMnemonicStore } from "./store";
import { AddressSection } from "./components/AddressSection";
import { MnemonicPanel } from "./components/MnemonicPanel";
import { PrivateKeySection } from "./components/PrivateKeySection";

/** Skeleton shown until hydration completes, preventing flicker and defaults overwriting stored data */
function Skeleton() {
  return (
    <div className="space-y-5" aria-busy>
      <div className="h-56 animate-pulse rounded-xl border border-border bg-surface" />
      <div className="h-32 animate-pulse rounded-xl border border-border bg-surface" />
      <div className="h-40 animate-pulse rounded-xl border border-border bg-surface" />
    </div>
  );
}

export default function EthMnemonicTool() {
  const { t } = useTranslation();
  const wordCount = useEthMnemonicStore((s) => s.wordCount);
  const mnemonic = useEthMnemonicStore((s) => s.mnemonic);
  const hydrated = useEthMnemonicStore((s) => s._hasHydrated);
  const regenerate = useEthMnemonicStore((s) => s.regenerate);
  const setWordCount = useEthMnemonicStore((s) => s.setWordCount);
  const setHasHydrated = useEthMnemonicStore((s) => s.setHasHydrated);

  // skipHydration: true, so trigger rehydrate manually on mount;
  // on failure (e.g. JSON.parse throwing due to corrupted storage) still mark as hydrated
  // so the first-visit logic regenerates instead of showing a permanent skeleton
  useEffect(() => {
    useEthMnemonicStore.persist.rehydrate()?.catch(() => {
      setHasHydrated(true);
    });
  }, [setHasHydrated]);

  // Auto-generate a mnemonic on first visit (no stored data)
  useEffect(() => {
    if (hydrated && !mnemonic) regenerate();
  }, [hydrated, mnemonic, regenerate]);

  const derived = useMemo(
    () => (mnemonic ? tryDeriveWallet(mnemonic) : null),
    [mnemonic],
  );

  // Self-healing: regenerate when the stored mnemonic is invalid (corrupted / tampered);
  // regenerate always yields a valid mnemonic, so this branch cannot re-trigger (no loop risk)
  useEffect(() => {
    if (hydrated && mnemonic && !derived) regenerate();
  }, [hydrated, mnemonic, derived, regenerate]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <header className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold text-text">
          {t("tools.ethMnemonic.name")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("tools.ethMnemonic.subtitle")}
        </p>
        <div className="mt-4 space-y-2.5">
          <Callout variant="info">
            {t("tools.ethMnemonic.privacyNotice")}
          </Callout>
          <Callout variant="warning">
            {t("tools.ethMnemonic.securityWarning")}
          </Callout>
        </div>
      </header>

      <main className="mt-6">
        {hydrated && derived ? (
          <div className="animate-fade-in-up space-y-5">
            <MnemonicPanel
              wordCount={wordCount}
              mnemonic={mnemonic}
              onWordCountChange={setWordCount}
              onRegenerate={regenerate}
            />
            <PrivateKeySection privateKey={derived.privateKey} />
            <AddressSection address={derived.address} path={derived.path} />
          </div>
        ) : (
          <Skeleton />
        )}
      </main>
    </div>
  );
}
