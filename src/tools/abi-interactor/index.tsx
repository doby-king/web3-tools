import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isAddress } from "ethers";
import { Callout } from "@/components/ui";
import { parseAbiJson } from "./lib/abi";
import { useEip6963Wallets } from "./lib/wallet";
import { CUSTOM_NETWORK_ID, getNetworkById } from "./networks";
import { CUSTOM_ABI_ID, getPresetById } from "./presets";
import { useAbiInteractorStore } from "./store";
import { AbiPanel } from "./components/AbiPanel";
import { MethodTabs } from "./components/MethodTabs";
import { NetworkPanel } from "./components/NetworkPanel";
import { WalletButton } from "./components/WalletButton";

/** Skeleton shown until hydration completes */
function Skeleton() {
  return (
    <div className="space-y-5" aria-busy>
      <div className="h-40 animate-pulse rounded-xl border border-border bg-surface" />
      <div className="h-64 animate-pulse rounded-xl border border-border bg-surface" />
    </div>
  );
}

export default function AbiInteractorTool() {
  const { t } = useTranslation();
  const hydrated = useAbiInteractorStore((s) => s._hasHydrated);
  const networkId = useAbiInteractorStore((s) => s.networkId);
  const customRpc = useAbiInteractorStore((s) => s.customRpc);
  const abiPresetId = useAbiInteractorStore((s) => s.abiPresetId);
  const customAbi = useAbiInteractorStore((s) => s.customAbi);
  const contractAddress = useAbiInteractorStore((s) => s.contractAddress);
  const setHasHydrated = useAbiInteractorStore((s) => s.setHasHydrated);

  const wallet = useEip6963Wallets();

  // skipHydration: true — trigger rehydrate manually on mount
  useEffect(() => {
    useAbiInteractorStore.persist.rehydrate()?.catch(() => {
      setHasHydrated(true);
    });
  }, [setHasHydrated]);

  // Resolve the active ABI text and parse it
  const abiText = useMemo(() => {
    if (abiPresetId === CUSTOM_ABI_ID) return customAbi;
    const preset = getPresetById(abiPresetId);
    return preset ? JSON.stringify(preset.abi) : "";
  }, [abiPresetId, customAbi]);

  const parseResult = useMemo(() => {
    if (!abiText.trim()) return null;
    return parseAbiJson(abiText);
  }, [abiText]);

  // Resolve RPC URL and explorer for the selected network
  const network = getNetworkById(networkId);
  const rpcUrl =
    networkId === CUSTOM_NETWORK_ID
      ? customRpc.trim() || null
      : (network?.rpcUrl ?? null);
  const explorerUrl = network?.explorerUrl ?? null;
  const selectedChainId = network?.chainId ?? null;

  const addressValid =
    contractAddress.length > 0 && isAddress(contractAddress);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <header className="animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold text-text">
          {t("tools.abiInteractor.name")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("tools.abiInteractor.subtitle")}
        </p>
        <div className="mt-4">
          <Callout variant="info">
            {t("tools.abiInteractor.privacyNotice")}
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
              <NetworkPanel />
              <AbiPanel parseResult={parseResult} />
              <WalletButton
                wallets={wallet.wallets}
                connected={wallet.connected}
                connecting={wallet.connecting}
                onConnect={wallet.connect}
                onDisconnect={wallet.disconnect}
                selectedChainId={selectedChainId}
              />
            </div>

            {/* Right column: parsed methods */}
            <div>
              {parseResult?.ok && addressValid ? (
                <MethodTabs
                  parsed={parseResult.parsed}
                  rpcUrl={rpcUrl}
                  contractAddress={contractAddress}
                  explorerUrl={explorerUrl}
                  wallet={wallet.connected}
                />
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border">
                  <p className="max-w-xs text-center text-sm text-text-muted">
                    {parseResult && !parseResult.ok
                      ? t("tools.abiInteractor.methods.fixAbiFirst")
                      : t("tools.abiInteractor.methods.awaitingSetup")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
