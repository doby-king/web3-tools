import { AbiCoder, Interface, keccak256 } from "ethers";
import type { ParseKeys } from "i18next";

// ─── Types ───────────────────────────────────────────────────────────────────

export type OwnerMode = "single" | "multi" | "bytes";

export interface InitCodeParams {
  /** Single owner address */
  owner?: string;
  /** Multiple owner addresses */
  owners?: string[];
  /** Salt value (uint256 hex string) */
  salt?: string;
  /** Safe: threshold */
  threshold?: number;
  /** Safe: fallback handler address */
  fallbackHandler?: string;
  /** Safe: to address (delegate call target, usually zero) */
  to?: string;
  /** Safe: data for delegate call */
  data?: string;
  /** Safe: payment token */
  paymentToken?: string;
  /** Safe: payment amount */
  payment?: string;
  /** Safe: payment receiver */
  paymentReceiver?: string;
  /** Biconomy: entry point address */
  entryPoint?: string;
  /** Kernel v3: creation data bytes */
  creationData?: string;
  /** Coinbase / Kernel v3: index/nonce */
  index?: string;
  /** Coinbase: owners as raw bytes array */
  ownersBytes?: string[];
}

export interface WalletVariant {
  id: string;
  labelKey: ParseKeys;
  entryPoint?: "v0.6" | "v0.7";
  factory: string;
  ownerMode: OwnerMode;
  /** Encode the initCode for this variant */
  encodeInitCode: (params: InitCodeParams) => string;
  /** Owner query method signature (null = not supported) */
  ownerQuery: string | null;
  /**
   * If set, the factory deploys a Solady ERC-1967 minimal proxy.
   * CREATE2 uses keccak256(proxyCreationCode(implementation)) as initCodeHash
   * instead of keccak256(encodeInitCode(...)).
   */
  implementation?: string;
  /**
   * Custom CREATE2 salt encoder. If omitted, uses params.salt / params.index directly.
   * Alchemy v2 uses keccak256(abi.encode(owner(s), salt)) as the combined salt.
   */
  encodeSalt?: (params: InitCodeParams) => string;
  /**
   * Custom initCodeHash computation. If set, overrides the default logic.
   * Used for beacon proxy with immutable args (Polymarket).
   */
  getInitCodeHash?: (params: InitCodeParams) => string;
}

export interface WalletPreset {
  id: string;
  labelKey: ParseKeys;
  variantId: string;
  /** Fixed params that the user cannot edit */
  fixedParams: Partial<InitCodeParams>;
  /** Fields the user still needs to provide */
  userInputFields: string[];
  /** Optional: restrict to specific chain ids */
  chainIds?: number[];
  /** Optional: description i18n key */
  descriptionKey?: ParseKeys;
}

export interface WalletBrand {
  id: string;
  labelKey: ParseKeys;
  variants: WalletVariant[];
  presets: WalletPreset[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DEFAULT_SALT = "0";

/** Standard Safe fallback handler (CompatibilityFallbackHandler v1.4.1) */
const SAFE_FALLBACK_HANDLER = "0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99";

const abiCoder = AbiCoder.defaultAbiCoder();

// ─── SimpleAccount ───────────────────────────────────────────────────────────

const simpleAccountInterface = new Interface([
  "function createAccount(address owner, uint256 salt)",
]);

function encodeSimpleAccount(params: InitCodeParams): string {
  return simpleAccountInterface.encodeFunctionData("createAccount", [
    params.owner ?? ZERO_ADDRESS,
    params.salt ?? DEFAULT_SALT,
  ]);
}

// ─── Safe ────────────────────────────────────────────────────────────────────

const safeFactoryInterface = new Interface([
  "function createProxyWithNonce(address singleton, bytes initializer, uint256 saltNonce)",
]);

const safeSetupInterface = new Interface([
  "function setup(address[] owners, uint256 threshold, address to, bytes data, address fallbackHandler, address paymentToken, uint256 payment, address paymentReceiver)",
]);

interface SafeVariantConfig {
  id: string;
  labelKey: string;
  factory: string;
  singleton: string;
}

function encodeSafe(config: SafeVariantConfig, params: InitCodeParams): string {
  const owners = params.owners ?? (params.owner ? [params.owner] : []);
  const threshold = params.threshold ?? 1;
  const to = params.to ?? ZERO_ADDRESS;
  const data = params.data ?? "0x";
  const fallbackHandler = params.fallbackHandler ?? SAFE_FALLBACK_HANDLER;
  const paymentToken = params.paymentToken ?? ZERO_ADDRESS;
  const payment = params.payment ?? "0";
  const paymentReceiver = params.paymentReceiver ?? ZERO_ADDRESS;

  const initializer = safeSetupInterface.encodeFunctionData("setup", [
    owners,
    threshold,
    to,
    data,
    fallbackHandler,
    paymentToken,
    payment,
    paymentReceiver,
  ]);

  return safeFactoryInterface.encodeFunctionData("createProxyWithNonce", [
    config.singleton,
    initializer,
    params.salt ?? DEFAULT_SALT,
  ]);
}

// ─── Coinbase Smart Wallet ───────────────────────────────────────────────────

const coinbaseFactoryInterface = new Interface([
  "function createAccount(bytes[] owners, uint256 nonce)",
]);

function encodeCoinbaseSmartWallet(params: InitCodeParams): string {
  let ownersBytes: string[];
  if (params.ownersBytes && params.ownersBytes.length > 0) {
    ownersBytes = params.ownersBytes;
  } else {
    const owners = params.owners ?? (params.owner ? [params.owner] : []);
    ownersBytes = owners.map((addr) => abiCoder.encode(["address"], [addr]));
  }
  return coinbaseFactoryInterface.encodeFunctionData("createAccount", [
    ownersBytes,
    params.index ?? "0",
  ]);
}

// ─── Alchemy LightAccount ────────────────────────────────────────────────────

const lightAccountInterface = new Interface([
  "function createAccount(address owner, uint256 salt)",
]);

const multiOwnerLightAccountInterface = new Interface([
  "function createAccount(address[] owners, uint256 salt)",
]);

function encodeLightAccount(params: InitCodeParams): string {
  return lightAccountInterface.encodeFunctionData("createAccount", [
    params.owner ?? ZERO_ADDRESS,
    params.salt ?? DEFAULT_SALT,
  ]);
}

function encodeMultiOwnerLightAccount(params: InitCodeParams): string {
  const owners = params.owners ?? (params.owner ? [params.owner] : []);
  return multiOwnerLightAccountInterface.encodeFunctionData("createAccount", [
    owners,
    params.salt ?? DEFAULT_SALT,
  ]);
}

/** Alchemy v2 combined salt: keccak256(abi.encode(address owner, uint256 salt)) */
function encodeLightAccountSalt(params: InitCodeParams): string {
  return keccak256(
    abiCoder.encode(
      ["address", "uint256"],
      [params.owner ?? ZERO_ADDRESS, params.salt ?? DEFAULT_SALT],
    ),
  );
}

/** Alchemy v2 combined salt: keccak256(abi.encode(address[] owners, uint256 salt)) */
function encodeMultiOwnerLightAccountSalt(params: InitCodeParams): string {
  const owners = params.owners ?? (params.owner ? [params.owner] : []);
  return keccak256(
    abiCoder.encode(
      ["address[]", "uint256"],
      [owners, params.salt ?? DEFAULT_SALT],
    ),
  );
}

// ─── Polymarket Deposit Wallet ───────────────────────────────────────────────

const POLYMARKET_FACTORY = "0x00000000000Fb5C9ADea0298D729A0CB3823Cc07";
const POLYMARKET_BEACON = "0x7A18EDfe055488A3128f01F563e5B479D92ffc3a";

/** Build Polymarket beacon proxy args: abi.encode(factory, bytes32(owner)) */
function polymarketArgs(params: InitCodeParams): string {
  const walletId =
    "0x" + (params.owner ?? ZERO_ADDRESS).slice(2).toLowerCase().padStart(64, "0");
  return abiCoder.encode(["address", "bytes32"], [POLYMARKET_FACTORY, walletId]);
}

/** Polymarket salt: keccak256(args) */
function encodePolymarketSalt(params: InitCodeParams): string {
  return keccak256(polymarketArgs(params));
}

/** Polymarket initCodeHash: keccak256(beaconProxyCreationCode(beacon, args)) */
function polymarketInitCodeHash(params: InitCodeParams): string {
  const args = polymarketArgs(params);
  const n = (args.length - 2) / 2;
  const prefixValue = 0x6100523d8160233d3973n + (BigInt(n) << 56n);
  const prefixHex = prefixValue.toString(16).padStart(20, "0");
  const beaconHex = POLYMARKET_BEACON.slice(2).toLowerCase();
  const constructorTail = "60195155f3";
  const runtime =
    "363d3d373d3d363d602036600436635c60da1b60e01b36527fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50545afa5036515af43d6000803e604d573d6000fd5b3d6000f3";
  const creationCode =
    "0x" + prefixHex + beaconHex + constructorTail + runtime + args.slice(2);
  return keccak256(creationCode);
}

// ─── Kernel (ZeroDev) ────────────────────────────────────────────────────────

const kernelV2Interface = new Interface([
  "function createAccount(address owner, uint256 salt)",
]);

const kernelV3Interface = new Interface([
  "function createAccount(bytes creationData, uint256 index)",
]);

function encodeKernelV2(params: InitCodeParams): string {
  return kernelV2Interface.encodeFunctionData("createAccount", [
    params.owner ?? ZERO_ADDRESS,
    params.salt ?? DEFAULT_SALT,
  ]);
}

function encodeKernelV3(params: InitCodeParams): string {
  // creationData encodes the validator configuration
  // For standard ECDSA: abi.encode(address validator, address owner)
  const creationData =
    params.creationData ??
    abiCoder.encode(
      ["address", "address"],
      [
        "0x845ADb2C711129d4f3966735eD98a9F09fC4cE57", // standard ECDSA validator
        params.owner ?? ZERO_ADDRESS,
      ],
    );
  return kernelV3Interface.encodeFunctionData("createAccount", [
    creationData,
    params.index ?? "0",
  ]);
}

// ─── Biconomy ────────────────────────────────────────────────────────────────

const EP_V06 = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

const biconomyV2Interface = new Interface([
  "function deployAccount(address _owner, address _entryPoint, uint256 _salt)",
]);

function encodeBiconomyV2(params: InitCodeParams): string {
  return biconomyV2Interface.encodeFunctionData("deployAccount", [
    params.owner ?? ZERO_ADDRESS,
    params.entryPoint ?? EP_V06,
    params.salt ?? DEFAULT_SALT,
  ]);
}

// ─── Brand Definitions ───────────────────────────────────────────────────────

export const WALLET_BRANDS: WalletBrand[] = [
  // 1. SimpleAccount
  {
    id: "simple",
    labelKey: "tools.aaAddressCalculator.brands.simple",
    variants: [
      {
        id: "simple-v06",
        labelKey: "tools.aaAddressCalculator.variants.simpleV06",
        entryPoint: "v0.6",
        factory: "0x9406Cc6185a346906296840746125a0E44976454",
        ownerMode: "single",
        encodeInitCode: encodeSimpleAccount,
        ownerQuery: "function owner() view returns (address)",
      },
      {
        id: "simple-v07",
        labelKey: "tools.aaAddressCalculator.variants.simpleV07",
        entryPoint: "v0.7",
        factory: "0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985",
        ownerMode: "single",
        encodeInitCode: encodeSimpleAccount,
        ownerQuery: "function owner() view returns (address)",
      },
    ],
    presets: [],
  },

  // 2. Safe
  {
    id: "safe",
    labelKey: "tools.aaAddressCalculator.brands.safe",
    variants: [
      {
        id: "safe-v130-l1",
        labelKey: "tools.aaAddressCalculator.variants.safeV130L1",
        entryPoint: "v0.6",
        factory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
        ownerMode: "multi",
        encodeInitCode: (params) =>
          encodeSafe(
            {
              id: "safe-v130-l1",
              labelKey: "",
              factory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
              singleton: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
            },
            params,
          ),
        ownerQuery: "function getOwners() view returns (address[])",
      },
      {
        id: "safe-v130-l2",
        labelKey: "tools.aaAddressCalculator.variants.safeV130L2",
        entryPoint: "v0.6",
        factory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
        ownerMode: "multi",
        encodeInitCode: (params) =>
          encodeSafe(
            {
              id: "safe-v130-l2",
              labelKey: "",
              factory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
              singleton: "0x3E5c63644E683549055b9Be8653de26E0B4CD36E",
            },
            params,
          ),
        ownerQuery: "function getOwners() view returns (address[])",
      },
      {
        id: "safe-v141-l1",
        labelKey: "tools.aaAddressCalculator.variants.safeV141L1",
        entryPoint: "v0.7",
        factory: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
        ownerMode: "multi",
        encodeInitCode: (params) =>
          encodeSafe(
            {
              id: "safe-v141-l1",
              labelKey: "",
              factory: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
              singleton: "0x41675C099F32341bf84BFc5382aF534df5C7461a",
            },
            params,
          ),
        ownerQuery: "function getOwners() view returns (address[])",
      },
      {
        id: "safe-v141-l2",
        labelKey: "tools.aaAddressCalculator.variants.safeV141L2",
        entryPoint: "v0.7",
        factory: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
        ownerMode: "multi",
        encodeInitCode: (params) =>
          encodeSafe(
            {
              id: "safe-v141-l2",
              labelKey: "",
              factory: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
              singleton: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
            },
            params,
          ),
        ownerQuery: "function getOwners() view returns (address[])",
      },
    ],
    presets: [
      {
        id: "standard-safe",
        labelKey: "tools.aaAddressCalculator.presets.standardSafe",
        variantId: "safe-v141-l1",
        fixedParams: {
          threshold: 1,
          fallbackHandler: SAFE_FALLBACK_HANDLER,
          to: ZERO_ADDRESS,
          data: "0x",
          paymentToken: ZERO_ADDRESS,
          payment: "0",
          paymentReceiver: ZERO_ADDRESS,
        },
        userInputFields: ["owners", "salt"],
        descriptionKey: "tools.aaAddressCalculator.presets.standardSafeDesc",
      },
    ],
  },

  // 3. Coinbase Smart Wallet
  {
    id: "coinbase",
    labelKey: "tools.aaAddressCalculator.brands.coinbase",
    variants: [
      {
        id: "coinbase-v1",
        labelKey: "tools.aaAddressCalculator.variants.coinbaseV1",
        entryPoint: "v0.7",
        factory: "0x0BA5ED0c6AA8c49038F819E587E2633c4A9F428a",
        ownerMode: "bytes",
        encodeInitCode: encodeCoinbaseSmartWallet,
        ownerQuery: null, // ownerAt(uint256) requires iterative calls
      },
    ],
    presets: [
      {
        id: "coinbase-standard",
        labelKey: "tools.aaAddressCalculator.presets.coinbaseStandard",
        variantId: "coinbase-v1",
        fixedParams: { index: "0" },
        userInputFields: ["owner"],
        descriptionKey:
          "tools.aaAddressCalculator.presets.coinbaseStandardDesc",
      },
    ],
  },

  // 4. Alchemy LightAccount
  {
    id: "alchemy",
    labelKey: "tools.aaAddressCalculator.brands.alchemy",
    variants: [
      {
        id: "alchemy-la-v110",
        labelKey: "tools.aaAddressCalculator.variants.alchemyLaV110",
        entryPoint: "v0.6",
        factory: "0x00004EC70002a32400f8ae005A26081065620D20",
        ownerMode: "single",
        encodeInitCode: encodeLightAccount,
        ownerQuery: "function owner() view returns (address)",
      },
      {
        id: "alchemy-la-v200",
        labelKey: "tools.aaAddressCalculator.variants.alchemyLaV200",
        entryPoint: "v0.7",
        factory: "0x0000000000400CdFef5E2714E63d8040b700BC24",
        ownerMode: "single",
        encodeInitCode: encodeLightAccount,
        ownerQuery: "function owner() view returns (address)",
        implementation: "0x8E8e658E22B12ada97B402fF0b044D6A325013C7",
        encodeSalt: encodeLightAccountSalt,
      },
      {
        id: "alchemy-mola-v200",
        labelKey: "tools.aaAddressCalculator.variants.alchemyMolaV200",
        entryPoint: "v0.7",
        factory: "0x000000000019d2Ee9F2729A65AfE20bb0020AefC",
        ownerMode: "multi",
        encodeInitCode: encodeMultiOwnerLightAccount,
        ownerQuery: "function owners() view returns (address[])",
        implementation: "0xd2c27F9eE8E4355f71915ffD5568cB3433b6823D",
        encodeSalt: encodeMultiOwnerLightAccountSalt,
      },
    ],
    presets: [
      {
        id: "alchemy-la-standard",
        labelKey: "tools.aaAddressCalculator.presets.alchemyLaStandard",
        variantId: "alchemy-la-v200",
        fixedParams: { salt: DEFAULT_SALT },
        userInputFields: ["owner"],
        descriptionKey:
          "tools.aaAddressCalculator.presets.alchemyLaStandardDesc",
      },
      {
        id: "alchemy-mola-standard",
        labelKey: "tools.aaAddressCalculator.presets.alchemyMolaStandard",
        variantId: "alchemy-mola-v200",
        fixedParams: { salt: DEFAULT_SALT },
        userInputFields: ["owners"],
        descriptionKey:
          "tools.aaAddressCalculator.presets.alchemyMolaStandardDesc",
      },
    ],
  },

  // 5. Kernel (ZeroDev)
  {
    id: "kernel",
    labelKey: "tools.aaAddressCalculator.brands.kernel",
    variants: [
      {
        id: "kernel-v22",
        labelKey: "tools.aaAddressCalculator.variants.kernelV22",
        entryPoint: "v0.6",
        factory: "0x5de4839a76cf55d0c90e2061ef4386d962E15ae3",
        ownerMode: "single",
        encodeInitCode: encodeKernelV2,
        ownerQuery: null,
      },
      {
        id: "kernel-v3-ep06",
        labelKey: "tools.aaAddressCalculator.variants.kernelV3Ep06",
        entryPoint: "v0.6",
        factory: "0xaac5D4240AF87249B3f71BC8E4A2cae074A3E419",
        ownerMode: "single",
        encodeInitCode: encodeKernelV3,
        ownerQuery: null,
      },
      {
        id: "kernel-v3-ep07",
        labelKey: "tools.aaAddressCalculator.variants.kernelV3Ep07",
        entryPoint: "v0.7",
        factory: "0xd703aaE79538628d27099B8c4f621bE4CCd142d5",
        ownerMode: "single",
        encodeInitCode: encodeKernelV3,
        ownerQuery: null,
      },
    ],
    presets: [
      {
        id: "kernel-standard",
        labelKey: "tools.aaAddressCalculator.presets.kernelStandard",
        variantId: "kernel-v3-ep07",
        fixedParams: { index: "0" },
        userInputFields: ["owner"],
        descriptionKey: "tools.aaAddressCalculator.presets.kernelStandardDesc",
      },
    ],
  },

  // 6. Biconomy
  {
    id: "biconomy",
    labelKey: "tools.aaAddressCalculator.brands.biconomy",
    variants: [
      {
        id: "biconomy-v2",
        labelKey: "tools.aaAddressCalculator.variants.biconomyV2",
        entryPoint: "v0.6",
        factory: "0x000000a56Aaca3e9a4C479ea6b6CD0DbcB6634F5",
        ownerMode: "single",
        encodeInitCode: encodeBiconomyV2,
        ownerQuery: null,
      },
    ],
    presets: [
      {
        id: "biconomy-standard",
        labelKey: "tools.aaAddressCalculator.presets.biconomyStandard",
        variantId: "biconomy-v2",
        fixedParams: { entryPoint: EP_V06, salt: DEFAULT_SALT },
        userInputFields: ["owner"],
        descriptionKey:
          "tools.aaAddressCalculator.presets.biconomyStandardDesc",
      },
    ],
  },

  // 7. Polymarket Deposit Wallet
  {
    id: "polymarket",
    labelKey: "tools.aaAddressCalculator.brands.polymarket",
    variants: [
      {
        id: "polymarket-deposit",
        labelKey: "tools.aaAddressCalculator.variants.polymarketDeposit",
        factory: POLYMARKET_FACTORY,
        ownerMode: "single",
        encodeInitCode: () => "0x",
        ownerQuery: "function owner() view returns (address)",
        encodeSalt: encodePolymarketSalt,
        getInitCodeHash: polymarketInitCodeHash,
      },
    ],
    presets: [
      {
        id: "polymarket-standard",
        labelKey: "tools.aaAddressCalculator.presets.polymarket",
        variantId: "polymarket-deposit",
        fixedParams: {},
        userInputFields: ["owner"],
        chainIds: [137],
        descriptionKey: "tools.aaAddressCalculator.presets.polymarketDesc",
      },
    ],
  },
];

// ─── Lookup Helpers ──────────────────────────────────────────────────────────

export function getBrandById(id: string): WalletBrand | undefined {
  return WALLET_BRANDS.find((b) => b.id === id);
}

export function getVariantById(
  brandId: string,
  variantId: string,
): WalletVariant | undefined {
  return getBrandById(brandId)?.variants.find((v) => v.id === variantId);
}

export function getPresetById(
  brandId: string,
  presetId: string,
): WalletPreset | undefined {
  return getBrandById(brandId)?.presets.find((p) => p.id === presetId);
}

export { DEFAULT_SALT, ZERO_ADDRESS, EP_V06 };
