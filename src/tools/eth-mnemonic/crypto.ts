/**
 * Mnemonic generation and wallet derivation (pure functions, no React dependency).
 * Imported via ethers subpaths for tree-shaking, so this code only lands in the
 * tool's lazy-loaded chunk.
 */
import { randomBytes } from "ethers/crypto";
import { defaultPath, HDNodeWallet, Mnemonic } from "ethers/wallet";

export type WordCount = 12 | 24;

export interface DerivedWallet {
  privateKey: string;
  address: string;
  path: string;
}

/** Normalize a word count from any source (e.g. tampered persisted data) to a valid value: only 24 is kept, everything else falls back to 12 */
export function normalizeWordCount(raw: unknown): WordCount {
  return raw === 24 ? 24 : 12;
}

/** Generate a BIP-39 English mnemonic: 12 words = 128-bit entropy, 24 words = 256-bit entropy */
export function generateMnemonic(wordCount: WordCount): string {
  const entropy = randomBytes(normalizeWordCount(wordCount) === 12 ? 16 : 32);
  return Mnemonic.fromEntropy(entropy).phrase;
}

/** Derive the first account via the BIP-44 default path m/44'/60'/0'/0/0, returning the checksummed address and private key */
export function deriveWallet(phrase: string): DerivedWallet {
  const wallet = HDNodeWallet.fromPhrase(phrase);
  return {
    privateKey: wallet.privateKey,
    address: wallet.address,
    path: wallet.path ?? defaultPath,
  };
}

/** Safe version of deriveWallet: returns null instead of throwing when the phrase is invalid (e.g. corrupted stored data) */
export function tryDeriveWallet(phrase: string): DerivedWallet | null {
  try {
    return deriveWallet(phrase);
  } catch {
    return null;
  }
}
