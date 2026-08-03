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
  description: string;
  requirements: string;
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

export const FAUCET_NETWORK_OPTIONS: readonly {
  value: FaucetNetworkFilter;
  label: string;
}[] = [
  { value: "all", label: "全部网络" },
  { value: "multi", label: "多链入口" },
  { value: "cronos", label: "Cronos" },
  { value: "ethereum", label: "Ethereum" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "base", label: "Base" },
  { value: "optimism", label: "Optimism" },
  { value: "polygon", label: "Polygon" },
  { value: "bnb", label: "BNB Chain" },
  { value: "avalanche", label: "Avalanche" },
  { value: "zksync", label: "zkSync" },
  { value: "mantle", label: "Mantle" },
] as const;

export const FAUCET_ASSET_OPTIONS: readonly {
  value: FaucetAssetFilter;
  label: string;
}[] = [
  { value: "all", label: "全部资产" },
  { value: "native", label: "原生 Gas" },
  { value: "stablecoin", label: "USDC / 稳定币" },
  { value: "link", label: "LINK" },
] as const;

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
    description: "Cronos EVM 测试网的官方原生 Gas 水龙头。",
    requirements: "填写 EVM 钱包地址；额度和冷却时间以页面为准。",
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
    description: "Circle 官方测试资产入口，适合调试稳定币和跨链资金流。",
    requirements: "填写钱包地址；每个网络和资产都有独立频率限制。",
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
    description: "同时提供多条 EVM 测试网 Gas 和 Chainlink LINK。",
    requirements: "连接钱包；可用网络、领取额度和资格规则动态更新。",
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
    description: "Alchemy 维护的多链水龙头目录，可按目标网络进入专用页面。",
    requirements: "通常需要免费 Alchemy 账号；各网络额度不同。",
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
    description: "覆盖常用 EVM 测试网的基础 Gas 领取入口。",
    requirements: "部分网络可能要求登录或完成社交验证。",
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
    description: "Google Cloud 提供的 Ethereum Sepolia Gas 水龙头。",
    requirements: "填写钱包地址；实行每日领取额度。",
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
    description: "MetaMask 开发者工具提供的 EVM 测试 Gas 入口。",
    requirements: "按照页面要求登录或填写钱包地址。",
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
    description: "BNB Chain 官方 BSC 和 opBNB 测试网 Gas 水龙头。",
    requirements: "填写钱包地址；有领取频率限制。",
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
    description: "Polygon PoS Amoy 测试网的原生 Gas 入口。",
    requirements: "填写钱包地址；页面可能启用 Cloudflare 验证。",
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
    description: "Avalanche Core 官方 Fuji C-Chain 测试 Gas 水龙头。",
    requirements: "填写 C-Chain 地址；额度和验证方式以页面为准。",
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
    description: "Coinbase Developer Platform 的 Base Sepolia 测试资产入口。",
    requirements: "需要登录 CDP；实际可选资产以控制台为准。",
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
    description: "Optimism Console 提供的 OP Sepolia 和 Superchain 测试 Gas 入口。",
    requirements: "连接钱包；支持范围和资格规则由控制台动态维护。",
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
    description: "zkSync Portal 汇总的 zkSync Sepolia 测试 Gas 领取入口。",
    requirements: "连接钱包；Portal 会展示当前可用的领取方式。",
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
    description: "Mantle Sepolia 官方原生 Gas 水龙头。",
    requirements: "填写钱包地址；领取额度和冷却时间以页面为准。",
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
    description: "通过浏览器完成 Proof of Work 获取 Sepolia ETH 的社区入口。",
    requirements: "需要保持页面运行完成 PoW；适合作为账号水龙头的备用方案。",
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
    description: "Chainstack 提供的多链测试 Gas 水龙头。",
    requirements: "需要 Chainstack 账号登录；有网络级领取限额。",
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
      if (!faucet.networks.some((network) => network.toLowerCase().includes(matcher))) {
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
      faucet.description,
      faucet.requirements,
      ...faucet.networks,
      ...faucet.assets,
    ]
      .join(" ")
      .toLowerCase();
    return searchable.includes(query);
  });
}
