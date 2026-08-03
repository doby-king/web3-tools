/** A fixed asset preset used by the Presets tab (pure local conversion) */
export interface UnitPreset {
  id: string;
  symbol: string;
  name: string;
  category: UnitPresetCategory;
  decimals: number;
  /** Name of the smallest unit (e.g. wei, satoshi) */
  baseUnit: string;
}

export type UnitPresetCategory = "native" | "stablecoin";

export const UNIT_PRESETS: UnitPreset[] = [
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    category: "native",
    decimals: 18,
    baseUnit: "wei",
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    category: "native",
    decimals: 8,
    baseUnit: "satoshi",
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    category: "native",
    decimals: 9,
    baseUnit: "lamports",
  },
  {
    id: "bnb",
    symbol: "BNB",
    name: "BNB Chain",
    category: "native",
    decimals: 18,
    baseUnit: "wei",
  },
  {
    id: "atom",
    symbol: "ATOM",
    name: "Cosmos Hub",
    category: "native",
    decimals: 6,
    baseUnit: "uatom",
  },
  {
    id: "trx",
    symbol: "TRX",
    name: "Tron",
    category: "native",
    decimals: 6,
    baseUnit: "sun",
  },
  {
    id: "doge",
    symbol: "DOGE",
    name: "Dogecoin",
    category: "native",
    decimals: 8,
    baseUnit: "koinu",
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    category: "stablecoin",
    decimals: 6,
    baseUnit: "microUSDC",
  },
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether",
    category: "stablecoin",
    decimals: 6,
    baseUnit: "microUSDT",
  },
  {
    id: "dai",
    symbol: "DAI",
    name: "Dai Stablecoin",
    category: "stablecoin",
    decimals: 18,
    baseUnit: "wei",
  },
];
