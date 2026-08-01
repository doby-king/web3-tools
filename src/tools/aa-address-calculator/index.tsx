import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Callout, SegmentedControl } from "@/components/ui";
import { CUSTOM_NETWORK_ID, getNetworkById } from "@/lib/networks";
import { useAaCalculatorStore } from "./store";
import { WalletConfigPanel } from "./components/WalletConfigPanel";
import { AddressCalcPanel } from "./components/AddressCalcPanel";
import { DeployCheckPanel } from "./components/DeployCheckPanel";
import { OwnerQueryPanel } from "./components/OwnerQueryPanel";
import { NetworkSelect } from "./components/NetworkSelect";

type Tab = "calc" | "query";

/** Skeleton shown until hydration completes */
function Skeleton() {
  return (
    <div className="space-y-5" aria-busy>
      <div className="h-40 animate-pulse rounded-xl border border-border bg-surface" />
      <div className="h-64 animate-pulse rounded-xl border border-border bg-surface" />
    </div>
  );
}

export default function AaAddressCalculatorTool() {
  const { t } = useTranslation();
  const hydrated = useAaCalculatorStore((s) => s._hasHydrated);
  const networkId = useAaCalculatorStore((s) => s.networkId);
  const customRpc = useAaCalculatorStore((s) => s.customRpc);
  const setHasHydrated = useAaCalculatorStore((s) => s.setHasHydrated);

  const [activeTab, setActiveTab] = useState<Tab>("calc");

  // skipHydration: true — trigger rehydrate manually on mount
  useEffect(() => {
    useAaCalculatorStore.persist.rehydrate()?.catch(() => {
      setHasHydrated(true);
    });
  }, [setHasHydrated]);

  // Resolve RPC URL
  const network = getNetworkById(networkId);
  const rpcUrl =
    networkId === CUSTOM_NETWORK_ID
      ? customRpc.trim() || null
      : (network?.rpcUrl ?? null);
  const explorerUrl = network?.explorerUrl ?? null;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <header className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold text-text">
          {t("tools.aaAddressCalculator.name")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("tools.aaAddressCalculator.subtitle")}
        </p>
        <div className="mt-4">
          <Callout variant="info">
            {t("tools.aaAddressCalculator.privacyNotice")}
          </Callout>
        </div>
      </header>

      <main className="mt-6">
        {!hydrated ? (
          <Skeleton />
        ) : (
          <div className="animate-fade-in-up grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
            {/* Left column: configuration */}
            <div className="space-y-5">
              <NetworkSelect />
              <WalletConfigPanel />
            </div>

            {/* Right column: operations */}
            <div className="space-y-5">
              {/* Tab switcher */}
              <SegmentedControl
                options={[
                  {
                    label: t("tools.aaAddressCalculator.tabCalc"),
                    // eslint-disable-next-line i18next/no-literal-string
                    value: "calc" as const,
                  },
                  {
                    label: t("tools.aaAddressCalculator.tabQuery"),
                    // eslint-disable-next-line i18next/no-literal-string
                    value: "query" as const,
                  },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />

              {activeTab === "calc" ? (
                <>
                  <AddressCalcPanel rpcUrl={rpcUrl} explorerUrl={explorerUrl} />
                  <DeployCheckPanel rpcUrl={rpcUrl} />
                </>
              ) : (
                <OwnerQueryPanel rpcUrl={rpcUrl} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
