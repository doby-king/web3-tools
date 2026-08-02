import { AbiCoder, concat, getCreate2Address, keccak256 } from "ethers";
import type { InitCodeParams, WalletVariant } from "../wallets";

const abiCoder = AbiCoder.defaultAbiCoder();

export interface Create2Result {
  /** The computed counterfactual AA address */
  address: string;
  /** The factory contract address used */
  factory: string;
  /** The salt used for CREATE2 */
  salt: string;
  /** The full initCode (factory bytecode + encoded calldata) */
  initCode: string;
  /** keccak256 hash of the initCode */
  initCodeHash: string;
}

/**
 * Build the Solady LibClone ERC-1967 minimal proxy creation code (95 bytes).
 * Layout: 0x603d3d8160223d3973 ++ implementation(20) ++ 0x6009 ++ runtime(64)
 */
function soladyERC1967CreationCode(implementation: string): string {
  return concat([
    "0x603d3d8160223d3973",
    implementation,
    "0x6009",
    "0x5155f3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076",
    "0xcc3735a920a3ca505d382bbc545af43d6000803e6038573d6000fd5b3d6000f3",
  ]);
}

/**
 * Build the Solady LibClone ERC-1967 beacon proxy creation code with immutable args.
 * Layout: prefix(10) ++ beacon(20) ++ constructorTail(5) ++ runtime(82) ++ args(n)
 * Total: 117 + n bytes
 *
 * Used by Polymarket Deposit Wallet Factory.
 */
export function soladyBeaconProxyWithArgsCreationCode(
  beacon: string,
  args: string,
): string {
  const n = (args.length - 2) / 2; // args byte length
  // Prefix: base 0x6100523d8160233d3973 with n added at byte position 2
  const prefixValue = 0x6100523d8160233d3973n + (BigInt(n) << 56n);
  const prefixHex = prefixValue.toString(16).padStart(20, "0");

  const beaconHex = beacon.slice(2).toLowerCase();
  const constructorTail = "60195155f3";
  const runtime =
    "363d3d373d3d363d602036600436635c60da1b60e01b36527fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50545afa5036515af43d6000803e604d573d6000fd5b3d6000f3";

  return "0x" + prefixHex + beaconHex + constructorTail + runtime + args.slice(2);
}

/**
 * Compute Polymarket deposit wallet address.
 * Algorithm (from Polymarket docs):
 *   walletId = bytes32(signer)
 *   args     = abi.encode(factory, walletId)
 *   salt     = keccak256(args)
 *   initCodeHash = keccak256(beaconProxyCreationCode(beacon, args))
 *   address  = CREATE2(factory, salt, initCodeHash)
 */
export function computePolymarketAddress(
  factory: string,
  beacon: string,
  owner: string,
): { address: string; salt: string; initCodeHash: string } {
  const walletId = "0x" + owner.slice(2).toLowerCase().padStart(64, "0");
  const args = abiCoder.encode(["address", "bytes32"], [factory, walletId]);
  const salt = keccak256(args);
  const creationCode = soladyBeaconProxyWithArgsCreationCode(beacon, args);
  const initCodeHash = keccak256(creationCode);
  const address = getCreate2Address(factory, salt, initCodeHash);
  return { address, salt, initCodeHash };
}

/**
 * Compute the counterfactual address for an ERC-4337 smart account
 * using the CREATE2 formula:
 *   address = keccak256(0xff ++ factory ++ salt ++ keccak256(initCode))[12:]
 *
 * Supports two modes:
 * - Standard: initCodeHash = keccak256(encodeInitCode(params)), salt = params.salt
 * - Solady ERC-1967 proxy (Alchemy v2): initCodeHash = keccak256(proxyCreationCode(impl)),
 *   salt = encodeSalt(params) (combined salt)
 *
 * This is a pure local computation — no network requests.
 */
export function computeAddress(
  variant: WalletVariant,
  params: InitCodeParams,
): Create2Result {
  const initCode = variant.encodeInitCode(params);

  let initCodeHash: string;
  if (variant.getInitCodeHash) {
    // Custom initCodeHash (e.g. beacon proxy with immutable args)
    initCodeHash = variant.getInitCodeHash(params);
  } else if (variant.implementation) {
    // Solady ERC-1967 minimal proxy: hash the proxy creation code
    initCodeHash = keccak256(soladyERC1967CreationCode(variant.implementation));
  } else {
    initCodeHash = keccak256(initCode);
  }

  const salt = variant.encodeSalt
    ? variant.encodeSalt(params)
    : (params.salt ?? params.index ?? "0");

  const address = getCreate2Address(variant.factory, salt, initCodeHash);

  return {
    address,
    factory: variant.factory,
    salt,
    initCode,
    initCodeHash,
  };
}
