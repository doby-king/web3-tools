import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, SpinnerIcon } from "@/components/ui";
import { WalletIcon, WarningIcon } from "@/components/ui/icons";
import type { Eip6963ProviderDetail, WalletState } from "../lib/wallet";

interface WalletButtonProps {
  wallets: Eip6963ProviderDetail[];
  connected: WalletState | null;
  connecting: boolean;
  onConnect: (wallet: Eip6963ProviderDetail) => Promise<void>;
  onDisconnect: () => void;
  /** Chain id of the currently selected network (for mismatch warning) */
  selectedChainId: number | null;
}

export function WalletButton({
  wallets,
  connected,
  connecting,
  onConnect,
  onDisconnect,
  selectedChainId,
}: WalletButtonProps) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);

  const chainMismatch =
    connected && selectedChainId !== null && connected.chainId !== selectedChainId;

  // Connected state: show address + disconnect
  if (connected) {
    return (
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
            <span className="truncate font-mono text-xs text-text">
              {connected.address.slice(0, 6)}...{connected.address.slice(-4)}
            </span>
            <span className="shrink-0 rounded bg-surface-hover px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
              {connected.chainId}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            {t("tools.abiInteractor.wallet.disconnect")}
          </Button>
        </div>
        {chainMismatch && (
          <p className="mt-2.5 flex items-start gap-1.5 text-xs text-warning">
            <WarningIcon size={13} className="mt-0.5 shrink-0" />
            {t("tools.abiInteractor.wallet.wrongChain", {
              selected: selectedChainId ?? "?",
              wallet: connected.chainId,
            })}
          </p>
        )}
      </Card>
    );
  }

  // Wallet picker (multiple wallets discovered)
  if (pickerOpen && wallets.length > 0) {
    return (
      <Card>
        <p className="text-xs font-medium text-text-secondary">
          {t("tools.abiInteractor.wallet.selectWallet")}
        </p>
        <div className="mt-2 space-y-1.5">
          {wallets.map((wallet) => (
            <button
              key={wallet.info.uuid}
              type="button"
              disabled={connecting}
              onClick={async () => {
                await onConnect(wallet);
                setPickerOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              <img
                src={wallet.info.icon}
                alt=""
                className="h-6 w-6 rounded"
              />
              <span className="truncate">{wallet.info.name}</span>
            </button>
          ))}
        </div>
      </Card>
    );
  }

  // Default: connect button
  return (
    <Card>
      {wallets.length === 0 ? (
        <p className="flex items-center gap-2 text-xs text-text-muted">
          <WalletIcon size={16} className="shrink-0" />
          {t("tools.abiInteractor.wallet.noWallets")}
        </p>
      ) : (
        <Button
          onClick={() => (wallets.length === 1 ? onConnect(wallets[0]) : setPickerOpen(true))}
          disabled={connecting}
          className="w-full"
        >
          {connecting ? (
            <>
              <SpinnerIcon size={15} />
              {t("tools.abiInteractor.wallet.connecting")}
            </>
          ) : (
            <>
              <WalletIcon size={15} />
              {t("tools.abiInteractor.wallet.connect")}
            </>
          )}
        </Button>
      )}
    </Card>
  );
}
