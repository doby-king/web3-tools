export interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  symbol: string;
  /** Whether this is a testnet */
  testnet?: boolean;
}

/** Special id used when the user provides a custom RPC URL */
export const CUSTOM_NETWORK_ID = "custom";

export const NETWORKS: Network[] = [
  // ── Mainnets ──────────────────────────────────────────────
  {
    id: "ethereum",
    name: "Ethereum",
    chainId: 1,
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
    symbol: "ETH",
  },
  {
    id: "bsc",
    name: "BNB Smart Chain",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed1.binance.org",
    explorerUrl: "https://bscscan.com",
    symbol: "BNB",
  },
  {
    id: "polygon",
    name: "Polygon",
    chainId: 137,
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    symbol: "POL",
  },
  {
    id: "arbitrum",
    name: "Arbitrum One",
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    symbol: "ETH",
  },
  {
    id: "optimism",
    name: "Optimism",
    chainId: 10,
    rpcUrl: "https://mainnet.optimism.io",
    explorerUrl: "https://optimistic.etherscan.io",
    symbol: "ETH",
  },
  {
    id: "base",
    name: "Base",
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    symbol: "ETH",
  },
  {
    id: "cronos",
    name: "Cronos",
    chainId: 25,
    rpcUrl: "https://evm.cronos.org",
    explorerUrl: "https://cronoscan.com",
    symbol: "CRO",
  },
  {
    id: "avalanche",
    name: "Avalanche C-Chain",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerUrl: "https://snowtrace.io",
    symbol: "AVAX",
  },
  {
    id: "fantom",
    name: "Fantom Opera",
    chainId: 250,
    rpcUrl: "https://rpc.ftm.tools",
    explorerUrl: "https://ftmscan.com",
    symbol: "FTM",
  },
  {
    id: "zksync",
    name: "zkSync Era",
    chainId: 324,
    rpcUrl: "https://mainnet.era.zksync.io",
    explorerUrl: "https://explorer.zksync.io",
    symbol: "ETH",
  },
  {
    id: "linea",
    name: "Linea",
    chainId: 59144,
    rpcUrl: "https://rpc.linea.build",
    explorerUrl: "https://lineascan.build",
    symbol: "ETH",
  },
  {
    id: "scroll",
    name: "Scroll",
    chainId: 534352,
    rpcUrl: "https://rpc.scroll.io",
    explorerUrl: "https://scrollscan.com",
    symbol: "ETH",
  },
  {
    id: "blast",
    name: "Blast",
    chainId: 81457,
    rpcUrl: "https://rpc.blast.io",
    explorerUrl: "https://blastscan.io",
    symbol: "ETH",
  },
  {
    id: "mantle",
    name: "Mantle",
    chainId: 5000,
    rpcUrl: "https://rpc.mantle.xyz",
    explorerUrl: "https://mantlescan.xyz",
    symbol: "MNT",
  },
  {
    id: "celo",
    name: "Celo",
    chainId: 42220,
    rpcUrl: "https://forno.celo.org",
    explorerUrl: "https://celoscan.io",
    symbol: "CELO",
  },
  {
    id: "gnosis",
    name: "Gnosis",
    chainId: 100,
    rpcUrl: "https://rpc.gnosischain.com",
    explorerUrl: "https://gnosisscan.io",
    symbol: "xDAI",
  },
  {
    id: "moonbeam",
    name: "Moonbeam",
    chainId: 1284,
    rpcUrl: "https://rpc.api.moonbeam.network",
    explorerUrl: "https://moonscan.io",
    symbol: "GLMR",
  },
  {
    id: "kaia",
    name: "Kaia",
    chainId: 8217,
    rpcUrl: "https://public-en.node.kaia.io",
    explorerUrl: "https://kaiascan.io",
    symbol: "KAIA",
  },
  // ── Testnets ──────────────────────────────────────────────
  {
    id: "sepolia",
    name: "Sepolia",
    chainId: 11155111,
    rpcUrl: "https://rpc.sepolia.org",
    explorerUrl: "https://sepolia.etherscan.io",
    symbol: "ETH",
    testnet: true,
  },
  {
    id: "holesky",
    name: "Holesky",
    chainId: 17000,
    rpcUrl: "https://ethereum-holesky-rpc.publicnode.com",
    explorerUrl: "https://holesky.etherscan.io",
    symbol: "ETH",
    testnet: true,
  },
  {
    id: "bsc-testnet",
    name: "BSC Testnet",
    chainId: 97,
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    explorerUrl: "https://testnet.bscscan.com",
    symbol: "tBNB",
    testnet: true,
  },
  {
    id: "polygon-amoy",
    name: "Polygon Amoy",
    chainId: 80002,
    rpcUrl: "https://rpc-amoy.polygon.technology",
    explorerUrl: "https://amoy.polygonscan.com",
    symbol: "POL",
    testnet: true,
  },
  {
    id: "arbitrum-sepolia",
    name: "Arbitrum Sepolia",
    chainId: 421614,
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    explorerUrl: "https://sepolia.arbiscan.io",
    symbol: "ETH",
    testnet: true,
  },
  {
    id: "op-sepolia",
    name: "OP Sepolia",
    chainId: 11155420,
    rpcUrl: "https://sepolia.optimism.io",
    explorerUrl: "https://sepolia-optimism.etherscan.io",
    symbol: "ETH",
    testnet: true,
  },
  {
    id: "base-sepolia",
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
    symbol: "ETH",
    testnet: true,
  },
  {
    id: "cronos-testnet",
    name: "Cronos Testnet",
    chainId: 338,
    rpcUrl: "https://evm-t3.cronos.org",
    explorerUrl: "https://testnet.cronoscan.com",
    symbol: "tCRO",
    testnet: true,
  },
];

export function getNetworkById(id: string): Network | undefined {
  return NETWORKS.find((n) => n.id === id);
}
