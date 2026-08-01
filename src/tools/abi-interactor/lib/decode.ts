import { toUtf8String } from "ethers";

/**
 * Recursively format an ethers call result into a human-readable string.
 * - BigInt → decimal string
 * - hex bytes/string → attempt UTF-8 decode for readability
 * - arrays / tuples → recursive formatting
 */
export function formatResult(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }

  if (typeof value === "bigint") {
    return value.toString(10);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "string") {
    // Attempt to decode hex data (e.g. bytes32) into a readable UTF-8 string
    if (/^0x[0-9a-fA-F]*$/.test(value) && value.length > 2 && value.length % 2 === 0) {
      try {
        const decoded = toUtf8String(value);
        // Only show decoded form when it yields printable characters
        if (decoded.length > 0 && /^[\x20-\x7E\u00A0-\uFFFF]+$/.test(decoded)) {
          return `${decoded} (${value})`;
        }
      } catch {
        // Not valid UTF-8; fall through to raw hex
      }
    }
    return value;
  }

  if (Array.isArray(value)) {
    const items = value.map((item, i) => `${i}: ${formatResult(item)}`);
    return `[\n${items.join("\n")}\n]`;
  }

  if (typeof value === "object") {
    // ethers Result objects are array-like with named properties
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([key]) => !/^\d+$/.test(key),
    );
    if (entries.length > 0) {
      const lines = entries.map(([key, val]) => `${key}: ${formatResult(val)}`);
      return `{\n${lines.join("\n")}\n}`;
    }
    return String(value);
  }

  return String(value);
}

/**
 * Extract a human-readable error message from an ethers call revert.
 * Attempts to surface the decoded revert reason / custom error signature.
 */
export function formatCallError(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return String(error);
  }

  const err = error as Record<string, unknown>;

  // ethers v6 CallException: decoded revert reason
  if (typeof err.reason === "string" && err.reason.length > 0) {
    return err.reason;
  }

  // Custom error decoded by ethers
  if (typeof err.revert === "object" && err.revert !== null) {
    const revert = err.revert as Record<string, unknown>;
    if (typeof revert.signature === "string") {
      const args = Array.isArray(revert.args)
        ? (revert.args as unknown[]).map((a) => formatResult(a)).join(", ")
        : "";
      return `${revert.signature}(${args})`;
    }
  }

  // Raw revert data
  if (typeof err.data === "string" && err.data.length > 2) {
    try {
      const decoded = toUtf8String(`0x${(err.data as string).slice(138)}`);
      if (/^[\x20-\x7E]+$/.test(decoded)) {
        return decoded;
      }
    } catch {
      // Not decodable
    }
    return `Reverted with data: ${err.data}`;
  }

  if (typeof err.message === "string") {
    return err.message;
  }

  return String(error);
}
