import { Interface, type FunctionFragment } from "ethers";

export interface ParsedAbi {
  iface: Interface;
  readFunctions: FunctionFragment[];
  writeFunctions: FunctionFragment[];
}

export type AbiParseResult =
  | { ok: true; parsed: ParsedAbi }
  | { ok: false; error: "invalidJson" | "invalidAbi" | "noFunctions" };

/**
 * Parse an ABI JSON string into an ethers Interface and classify functions
 * into read (view/pure) and write (nonpayable/payable) groups.
 */
export function parseAbiJson(raw: string): AbiParseResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "invalidJson" };
  }

  // Support both raw arrays and hardhat-style artifacts with .abi field
  const abiArray = Array.isArray(json)
    ? json
    : typeof json === "object" && json !== null && Array.isArray((json as { abi?: unknown }).abi)
      ? (json as { abi: unknown[] }).abi
      : null;

  if (!abiArray) {
    return { ok: false, error: "invalidAbi" };
  }

  let iface: Interface;
  try {
    iface = new Interface(abiArray);
  } catch {
    return { ok: false, error: "invalidAbi" };
  }

  const functions = Array.from(iface.fragments.filter((f) => f.type === "function")) as FunctionFragment[];
  if (functions.length === 0) {
    return { ok: false, error: "noFunctions" };
  }

  const readFunctions = functions.filter(
    (f) => f.stateMutability === "view" || f.stateMutability === "pure",
  );
  const writeFunctions = functions.filter(
    (f) => f.stateMutability === "nonpayable" || f.stateMutability === "payable",
  );

  return { ok: true, parsed: { iface, readFunctions, writeFunctions } };
}
