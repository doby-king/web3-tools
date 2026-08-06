import type { ParseKeys } from "i18next";

export const FAUCET_CHECKED_AT = "2026-07-27";

export type FaucetSourceKind = "official" | "provider" | "community";
export type FaucetScope = "single" | "multi";
export type FaucetAssetKind = "native" | "stablecoin" | "link";

export type FaucetEntry = {
  id: string;
  name: string;
  provider: string;
  url: string;
  sourceKind: FaucetSourceKind;
  scope: FaucetScope;
  networks: readonly string[];
  assets: readonly string[];
  assetKinds: readonly FaucetAssetKind[];
  descriptionKey: ParseKeys;
  requirementsKey: ParseKeys;
};

export type FaucetNetworkFilter =
  | "all"
  | "multi"
  | "cronos"
  | "ethereum"
  | "arbitrum"
  | "base"
  | "optimism"
  | "polygon"
  | "bnb"
  | "avalanche"
  | "zksync"
  | "mantle";

export type FaucetAssetFilter = "all" | FaucetAssetKind;

export const FAUCETS: readonly FaucetEntry[] = [
  {
    id: "cronos",
    name: "Cronos Testnet Faucet",
    provider: "Cronos Labs",
    url: "https://faucet.cronos.com/",
    sourceKind: "official",
    scope: "single",
    networks: ["Cronos Testnet"],
    assets: ["TCRO"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.cronos.description",
    requirementsKey: "tools.faucetHub.entries.cronos.requirements",
  },
  {
    id: "circle",
    name: "Circle Testnet Faucet",
    provider: "Circle",
    url: "https://faucet.circle.com/",
    sourceKind: "official",
    scope: "multi",
    networks: [
      "Cronos Testnet",
      "Ethereum Sepolia",
      "Arbitrum Sepolia",
      "Avalanche Fuji",
      "Base Sepolia",
      "Celo Alfajores",
      "Ink Sepolia",
      "Linea Sepolia",
      "Monad Testnet",
      "OP Sepolia",
      "Polygon Amoy",
      "Sonic Testnet",
      "Unichain Sepolia",
      "World Chain Sepolia",
      "zkSync Sepolia",
    ],
    assets: ["USDC", "EURC", "cirBTC"],
    assetKinds: ["stablecoin"],
    descriptionKey: "tools.faucetHub.entries.circle.description",
    requirementsKey: "tools.faucetHub.entries.circle.requirements",
  },
  {
    id: "chainlink",
    name: "Chainlink Faucet",
    provider: "Chainlink",
    url: "https://faucets.chain.link/",
    sourceKind: "official",
    scope: "multi",
    networks: [
      "Ethereum Sepolia",
      "Arbitrum Sepolia",
      "Avalanche Fuji",
      "Base Sepolia",
      "BNB Chain Testnet",
      "Linea Sepolia",
      "OP Sepolia",
      "Polygon Amoy",
      "Scroll Sepolia",
    ],
    assets: ["Testnet gas", "LINK"],
    assetKinds: ["native", "link"],
    descriptionKey: "tools.faucetHub.entries.chainlink.description",
    requirementsKey: "tools.faucetHub.entries.chainlink.requirements",
  },
  {
    id: "alchemy",
    name: "Alchemy Faucet Hub",
    provider: "Alchemy",
    url: "https://www.alchemy.com/faucets",
    sourceKind: "provider",
    scope: "multi",
    networks: [
      "Ethereum Sepolia",
      "Arbitrum Sepolia",
      "Base Sepolia",
      "OP Sepolia",
      "Polygon Amoy",
      "BNB Chain Testnet",
    ],
    assets: ["ETH", "POL", "tBNB", "Testnet gas"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.alchemy.description",
    requirementsKey: "tools.faucetHub.entries.alchemy.requirements",
  },
  {
    id: "quicknode",
    name: "QuickNode Multi-chain Faucet",
    provider: "QuickNode",
    url: "https://faucet.quicknode.com/drip",
    sourceKind: "provider",
    scope: "multi",
    networks: [
      "Ethereum Sepolia",
      "Arbitrum Sepolia",
      "Avalanche Fuji",
      "Base Sepolia",
      "BNB Chain Testnet",
      "OP Sepolia",
      "Polygon Amoy",
    ],
    assets: ["ETH", "AVAX", "POL", "tBNB", "Testnet gas"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.quicknode.description",
    requirementsKey: "tools.faucetHub.entries.quicknode.requirements",
  },
  {
    id: "google-cloud",
    name: "Google Cloud Web3 Faucet",
    provider: "Google Cloud",
    url: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
    sourceKind: "provider",
    scope: "single",
    networks: ["Ethereum Sepolia"],
    assets: ["ETH"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.googleCloud.description",
    requirementsKey: "tools.faucetHub.entries.googleCloud.requirements",
  },
  {
    id: "metamask",
    name: "MetaMask Developer Faucet",
    provider: "MetaMask Developer",
    url: "https://docs.metamask.io/developer-tools/faucet/",
    sourceKind: "provider",
    scope: "multi",
    networks: ["Ethereum Sepolia", "Linea Sepolia"],
    assets: ["ETH", "Testnet gas"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.metamask.description",
    requirementsKey: "tools.faucetHub.entries.metamask.requirements",
  },
  {
    id: "bnb-chain",
    name: "BNB Chain Testnet Faucet",
    provider: "BNB Chain",
    url: "https://www.bnbchain.org/en/testnet-faucet",
    sourceKind: "official",
    scope: "multi",
    networks: ["BNB Smart Chain Testnet", "opBNB Testnet"],
    assets: ["tBNB"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.bnbChain.description",
    requirementsKey: "tools.faucetHub.entries.bnbChain.requirements",
  },
  {
    id: "polygon",
    name: "Polygon Faucet",
    provider: "Polygon",
    url: "https://faucet.polygon.technology/",
    sourceKind: "official",
    scope: "single",
    networks: ["Polygon Amoy"],
    assets: ["POL"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.polygon.description",
    requirementsKey: "tools.faucetHub.entries.polygon.requirements",
  },
  {
    id: "avalanche",
    name: "Avalanche Core Faucet",
    provider: "Avalanche",
    url: "https://core.app/tools/testnet-faucet/?subnet=c&token=c",
    sourceKind: "official",
    scope: "single",
    networks: ["Avalanche Fuji C-Chain"],
    assets: ["AVAX"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.avalanche.description",
    requirementsKey: "tools.faucetHub.entries.avalanche.requirements",
  },
  {
    id: "coinbase-cdp",
    name: "Coinbase CDP Faucet",
    provider: "Coinbase Developer Platform",
    url: "https://portal.cdp.coinbase.com/products/faucet",
    sourceKind: "provider",
    scope: "single",
    networks: ["Base Sepolia"],
    assets: ["ETH", "USDC"],
    assetKinds: ["native", "stablecoin"],
    descriptionKey: "tools.faucetHub.entries.coinbaseCdp.description",
    requirementsKey: "tools.faucetHub.entries.coinbaseCdp.requirements",
  },
  {
    id: "optimism",
    name: "Superchain Faucet",
    provider: "Optimism",
    url: "https://console.optimism.io/faucet",
    sourceKind: "official",
    scope: "multi",
    networks: ["OP Sepolia", "Superchain testnets"],
    assets: ["ETH", "Testnet gas"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.optimism.description",
    requirementsKey: "tools.faucetHub.entries.optimism.requirements",
  },
  {
    id: "zksync",
    name: "zkSync Faucet Portal",
    provider: "zkSync",
    url: "https://portal.zksync.io/faucet",
    sourceKind: "official",
    scope: "single",
    networks: ["zkSync Sepolia"],
    assets: ["ETH", "Testnet gas"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.zksync.description",
    requirementsKey: "tools.faucetHub.entries.zksync.requirements",
  },
  {
    id: "mantle",
    name: "Mantle Faucet",
    provider: "Mantle",
    url: "https://faucet.mantle.xyz/",
    sourceKind: "official",
    scope: "single",
    networks: ["Mantle Sepolia"],
    assets: ["MNT"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.mantle.description",
    requirementsKey: "tools.faucetHub.entries.mantle.requirements",
  },
  {
    id: "sepolia-pow",
    name: "Sepolia PoW Faucet",
    provider: "pk910",
    url: "https://sepolia-faucet.pk910.de/",
    sourceKind: "community",
    scope: "single",
    networks: ["Ethereum Sepolia"],
    assets: ["ETH"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.sepoliaPow.description",
    requirementsKey: "tools.faucetHub.entries.sepoliaPow.requirements",
  },
  {
    id: "chainstack",
    name: "Chainstack Faucet",
    provider: "Chainstack",
    url: "https://faucet.chainstack.com/",
    sourceKind: "provider",
    scope: "multi",
    networks: ["Ethereum Sepolia", "Polygon Amoy", "BNB Chain Testnet"],
    assets: ["ETH", "POL", "tBNB"],
    assetKinds: ["native"],
    descriptionKey: "tools.faucetHub.entries.chainstack.description",
    requirementsKey: "tools.faucetHub.entries.chainstack.requirements",
  },
] as const;

const NETWORK_MATCHERS: Record<
  Exclude<FaucetNetworkFilter, "all" | "multi">,
  string
> = {
  cronos: "cronos",
  ethereum: "ethereum",
  arbitrum: "arbitrum",
  base: "base",
  optimism: "op sepolia",
  polygon: "polygon",
  bnb: "bnb",
  avalanche: "avalanche",
  zksync: "zksync",
  mantle: "mantle",
};

export function filterFaucets(
  faucets: readonly FaucetEntry[],
  filters: {
    query: string;
    network: FaucetNetworkFilter;
    asset: FaucetAssetFilter;
  },
): FaucetEntry[] {
  const query = filters.query.trim().toLowerCase();

  return faucets.filter((faucet) => {
    if (filters.network === "multi" && faucet.scope !== "multi") return false;
    if (filters.network !== "all" && filters.network !== "multi") {
      const matcher = NETWORK_MATCHERS[filters.network];
      if (
        !faucet.networks.some((network) =>
          network.toLowerCase().includes(matcher),
        )
      ) {
        return false;
      }
    }

    if (filters.asset !== "all" && !faucet.assetKinds.includes(filters.asset)) {
      return false;
    }

    if (!query) return true;
    const searchable = [
      faucet.name,
      faucet.provider,
      ...faucet.networks,
      ...faucet.assets,
    ]
      .join(" ")
      .toLowerCase();
    return searchable.includes(query);
  });
}
