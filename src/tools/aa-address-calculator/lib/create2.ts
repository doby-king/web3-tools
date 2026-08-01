import { concat, getCreate2Address, keccak256 } from "ethers";
import type { InitCodeParams, WalletVariant } from "../wallets";

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
  if (variant.implementation) {
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
