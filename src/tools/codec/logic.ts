import {
  base32,
  base58,
  base64,
  base64url,
  base64urlnopad,
  hex,
} from "@scure/base";

export const CODEC_FORMATS = [
  "base64",
  "base64url",
  "base58",
  "base32",
  "hex",
  "utf8",
  "ascii",
  "url",
  "binary",
  "html",
  "unicode",
] as const;

export type CodecFormatId = (typeof CODEC_FORMATS)[number];

export function isCodecFormatId(value: unknown): value is CodecFormatId {
  return (
    typeof value === "string" &&
    (CODEC_FORMATS as readonly string[]).includes(value)
  );
}

export interface InputStats {
  chars: number;
  bytes: number;
}

export type CodecResult =
  { ok: true; text: string } | { ok: false; errorKey: string };

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function countStats(input: string): InputStats {
  return {
    chars: [...input].length,
    bytes: textEncoder.encode(input).byteLength,
  };
}

function toBytes(input: string): Uint8Array {
  return textEncoder.encode(input);
}

function fromBytes(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}

function normalizeHex(input: string): string {
  return input.replace(/\s+/g, "").replace(/^0x/i, "");
}

function encodeHexBytes(bytes: Uint8Array): string {
  return hex.encode(bytes);
}

/** Hex bytes separated by spaces, e.g. "68 65 6c 6c 6f" */
function encodeSpacedHexBytes(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(" ");
}

/** Decimal ASCII/byte codes separated by spaces, e.g. "97 98 99 101 102" */
function encodeDecimalBytes(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => String(b)).join(" ");
}

function decodeDecimalBytes(input: string): Uint8Array {
  const trimmed = input.trim();
  if (!trimmed) return new Uint8Array();
  const parts = trimmed.split(/\s+/);
  const out = new Uint8Array(parts.length);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    if (!/^\d+$/.test(part)) {
      throw new Error("invalid");
    }
    const value = Number.parseInt(part, 10);
    if (!Number.isFinite(value) || value < 0 || value > 255) {
      throw new Error("invalid");
    }
    out[i] = value;
  }
  return out;
}

function decodeHexToBytes(input: string): Uint8Array {
  const cleaned = normalizeHex(input);
  if (cleaned.length === 0) return new Uint8Array();
  if (cleaned.length % 2 !== 0) {
    throw new Error("odd");
  }
  if (!/^[0-9a-fA-F]*$/.test(cleaned)) {
    throw new Error("invalid");
  }
  return hex.decode(cleaned.toLowerCase());
}

function decodeBase64Url(input: string): Uint8Array {
  const trimmed = input.trim();
  try {
    return base64url.decode(trimmed);
  } catch {
    return base64urlnopad.decode(trimmed);
  }
}

function encodeHtml(input: string): string {
  return Array.from(input)
    .map((ch) => {
      const code = ch.codePointAt(0)!;
      switch (ch) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          if (code < 32 || code > 126) {
            return `&#${code};`;
          }
          return ch;
      }
    })
    .join("");
}

function decodeHtml(input: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: "\u00A0",
  };

  return input.replace(
    /&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g,
    (match, entity: string) => {
      if (entity.startsWith("#x") || entity.startsWith("#X")) {
        const code = Number.parseInt(entity.slice(2), 16);
        if (!Number.isFinite(code)) return match;
        return String.fromCodePoint(code);
      }
      if (entity.startsWith("#")) {
        const code = Number.parseInt(entity.slice(1), 10);
        if (!Number.isFinite(code)) return match;
        return String.fromCodePoint(code);
      }
      return named[entity] ?? match;
    },
  );
}

function encodeUnicode(input: string): string {
  return Array.from(input)
    .map((ch) => {
      const code = ch.codePointAt(0)!;
      if (code <= 0xffff) {
        return `\\u${code.toString(16).padStart(4, "0")}`;
      }
      return `\\u{${code.toString(16)}}`;
    })
    .join("");
}

function decodeUnicode(input: string): string {
  const pattern =
    /\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{8})/g;
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input)) !== null) {
    result += input.slice(lastIndex, match.index);
    const hexPart = match[1] ?? match[2] ?? match[3];
    const code = Number.parseInt(hexPart!, 16);
    if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) {
      throw new Error("invalid");
    }
    result += String.fromCodePoint(code);
    lastIndex = pattern.lastIndex;
  }
  result += input.slice(lastIndex);
  return result;
}

function encodeBinary(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
}

function decodeBinary(input: string): Uint8Array {
  const bits = input.replace(/\s+/g, "");
  if (bits.length === 0) return new Uint8Array();
  if (bits.length % 8 !== 0 || !/^[01]+$/.test(bits)) {
    throw new Error("invalid");
  }
  const out = new Uint8Array(bits.length / 8);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return out;
}

function assertAsciiBytes(bytes: Uint8Array): void {
  for (const b of bytes) {
    if (b > 127) throw new Error("non-ascii");
  }
}

function assertAsciiText(input: string): void {
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    if (code > 127) throw new Error("non-ascii");
  }
}

export function encode(format: CodecFormatId, input: string): CodecResult {
  try {
    switch (format) {
      case "base64":
        return { ok: true, text: base64.encode(toBytes(input)) };
      case "base64url":
        return { ok: true, text: base64url.encode(toBytes(input)) };
      case "base58":
        return { ok: true, text: base58.encode(toBytes(input)) };
      case "base32":
        return { ok: true, text: base32.encode(toBytes(input)) };
      case "hex":
        return { ok: true, text: encodeHexBytes(toBytes(input)) };
      case "utf8":
        return { ok: true, text: encodeSpacedHexBytes(toBytes(input)) };
      case "ascii": {
        assertAsciiText(input);
        return { ok: true, text: encodeDecimalBytes(toBytes(input)) };
      }
      case "url":
        return { ok: true, text: encodeURIComponent(input) };
      case "binary":
        return { ok: true, text: encodeBinary(toBytes(input)) };
      case "html":
        return { ok: true, text: encodeHtml(input) };
      case "unicode":
        return { ok: true, text: encodeUnicode(input) };
      default:
        return { ok: false, errorKey: "tools.codec.errors.unsupported" };
    }
  } catch {
    return { ok: false, errorKey: encodeErrorKey(format) };
  }
}

export function decode(format: CodecFormatId, input: string): CodecResult {
  try {
    switch (format) {
      case "base64":
        return { ok: true, text: fromBytes(base64.decode(input.trim())) };
      case "base64url":
        return { ok: true, text: fromBytes(decodeBase64Url(input)) };
      case "base58":
        return { ok: true, text: fromBytes(base58.decode(input.trim())) };
      case "base32":
        return {
          ok: true,
          text: fromBytes(base32.decode(input.trim().toUpperCase())),
        };
      case "hex":
      case "utf8":
        return { ok: true, text: fromBytes(decodeHexToBytes(input)) };
      case "ascii": {
        const bytes = decodeDecimalBytes(input);
        assertAsciiBytes(bytes);
        return { ok: true, text: fromBytes(bytes) };
      }
      case "url":
        return { ok: true, text: decodeURIComponent(input.trim()) };
      case "binary":
        return { ok: true, text: fromBytes(decodeBinary(input)) };
      case "html":
        return { ok: true, text: decodeHtml(input) };
      case "unicode":
        return { ok: true, text: decodeUnicode(input) };
      default:
        return { ok: false, errorKey: "tools.codec.errors.unsupported" };
    }
  } catch {
    return { ok: false, errorKey: decodeErrorKey(format) };
  }
}

function encodeErrorKey(format: CodecFormatId): string {
  switch (format) {
    case "ascii":
      return "tools.codec.errors.nonAscii";
    default:
      return "tools.codec.errors.encodeFailed";
  }
}

function decodeErrorKey(format: CodecFormatId): string {
  switch (format) {
    case "base64":
      return "tools.codec.errors.invalidBase64";
    case "base64url":
      return "tools.codec.errors.invalidBase64url";
    case "base58":
      return "tools.codec.errors.invalidBase58";
    case "base32":
      return "tools.codec.errors.invalidBase32";
    case "hex":
    case "utf8":
      return "tools.codec.errors.invalidHex";
    case "ascii":
      return "tools.codec.errors.invalidAscii";
    case "url":
      return "tools.codec.errors.invalidUrl";
    case "binary":
      return "tools.codec.errors.invalidBinary";
    case "html":
      return "tools.codec.errors.invalidHtml";
    case "unicode":
      return "tools.codec.errors.invalidUnicode";
    default:
      return "tools.codec.errors.decodeFailed";
  }
}
