import { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

/** EIP-6963 provider detail announced by wallets */
export interface Eip6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  };
}

export interface WalletState {
  address: string;
  chainId: number;
  provider: Eip6963ProviderDetail["provider"];
}

interface UseEip6963WalletsReturn {
  /** Discovered wallet providers (EIP-6963 multi-wallet) */
  wallets: Eip6963ProviderDetail[];
  /** Currently connected wallet state, null when disconnected */
  connected: WalletState | null;
  connecting: boolean;
  connect: (wallet: Eip6963ProviderDetail) => Promise<void>;
  disconnect: () => void;
}

/**
 * Lightweight EIP-6963 multi-wallet discovery + connection hook.
 * No external wallet library needed — listens for provider announcements
 * and manages connection lifecycle (accounts / chainChanged events).
 */
export function useEip6963Wallets(): UseEip6963WalletsReturn {
  const [wallets, setWallets] = useState<Eip6963ProviderDetail[]>([]);
  const [connected, setConnected] = useState<WalletState | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Discover wallets via EIP-6963
  useEffect(() => {
    const announced: Eip6963ProviderDetail[] = [];

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
      if (detail?.info && detail?.provider) {
        // Deduplicate by uuid (wallets may re-announce)
        if (!announced.some((w) => w.info.uuid === detail.info.uuid)) {
          announced.push(detail);
          setWallets([...announced]);
        }
      }
    };

    window.addEventListener("eip6963:announceProvider", handler);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handler);
    };
  }, []);

  const disconnect = useCallback(() => {
    setConnected(null);
  }, []);

  const connect = useCallback(async (wallet: Eip6963ProviderDetail) => {
    setConnecting(true);
    try {
      const accounts = (await wallet.provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      const chainIdHex = (await wallet.provider.request({
        method: "eth_chainId",
      })) as string;

      const address = accounts[0] ?? "";
      const chainId = parseInt(chainIdHex, 16);
      setConnected({ address, chainId, provider: wallet.provider });

      // Track account / chain changes while connected
      const onAccountsChanged = (...args: unknown[]) => {
        const newAccounts = args[0] as string[] | undefined;
        if (!newAccounts || newAccounts.length === 0) {
          setConnected(null);
        } else {
          setConnected((prev) =>
            prev ? { ...prev, address: newAccounts[0] } : prev,
          );
        }
      };

      const onChainChanged = (...args: unknown[]) => {
        const newChainHex = args[0] as string;
        setConnected((prev) =>
          prev ? { ...prev, chainId: parseInt(newChainHex, 16) } : prev,
        );
      };

      wallet.provider.on?.("accountsChanged", onAccountsChanged);
      wallet.provider.on?.("chainChanged", onChainChanged);
    } finally {
      setConnecting(false);
    }
  }, []);

  return { wallets, connected, connecting, connect, disconnect };
}

/** Wrap an EIP-1193 provider into an ethers BrowserProvider for signing */
export function toBrowserProvider(provider: Eip6963ProviderDetail["provider"]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new BrowserProvider(provider as any);
}
