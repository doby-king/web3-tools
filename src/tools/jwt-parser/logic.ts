import {
  compactVerify,
  importJWK,
  importSPKI,
  type JWK,
  type JWTHeaderParameters,
  type JWTPayload,
} from "jose";

export type JwtParseErrorCode =
  "malformed" | "invalidBase64" | "invalidJson" | "emptySignature";

export interface JwtParseError {
  code: JwtParseErrorCode;
  message: string;
}

export interface JwtDecoded {
  header: JWTHeaderParameters;
  payload: JWTPayload;
  signature: string;
  rawJson: string;
}

export type JwtParseResult =
  | { ok: true; empty: true }
  | { ok: false; error: JwtParseError }
  | { ok: true; empty?: false; decoded: JwtDecoded };

export type ClaimSection = "header" | "payload";

export interface ClaimRow {
  section: ClaimSection;
  name: string;
  /** Raw display string for non-time fields; for time fields equals the numeric string */
  value: string;
  /** i18n key under tools.jwtParser.claims.* */
  descriptionKey: string;
  isTime: boolean;
  /** Unix seconds when isTime and valid */
  timestamp?: number;
}

export type VerifyStatus =
  | { kind: "idle" }
  | { kind: "skipped" }
  | { kind: "valid" }
  | { kind: "invalid" }
  | { kind: "keyError"; detail?: string }
  | { kind: "unsupportedAlg"; alg: string };

const TIME_CLAIM_NAMES = new Set(["exp", "nbf", "iat", "auth_time"]);

const KNOWN_CLAIM_KEYS = new Set([
  "alg",
  "typ",
  "kid",
  "cty",
  "jku",
  "jwk",
  "x5u",
  "x5c",
  "x5t",
  "x5t#S256",
  "crit",
  "iss",
  "sub",
  "aud",
  "exp",
  "nbf",
  "iat",
  "jti",
  "auth_time",
  "nonce",
  "azp",
  "scope",
]);

const SUPPORTED_ALGS = new Set([
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "ES256",
  "ES384",
  "ES512",
  "EdDSA",
  "PS256",
  "PS384",
  "PS512",
]);

function base64UrlToUtf8(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + "=".repeat(padLen);
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function formatJsonValue(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function parseJwt(tokenInput: string): JwtParseResult {
  const token = tokenInput.trim();
  if (!token) {
    return { ok: true, empty: true };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return {
      ok: false,
      error: {
        code: "malformed",
        message: "JWT must have three base64url segments separated by dots",
      },
    };
  }

  const [headerSeg, payloadSeg, signatureSeg] = parts;
  if (!headerSeg || !payloadSeg) {
    return {
      ok: false,
      error: {
        code: "malformed",
        message: "JWT header or payload segment is empty",
      },
    };
  }

  let headerRaw: string;
  let payloadRaw: string;
  try {
    headerRaw = base64UrlToUtf8(headerSeg);
    payloadRaw = base64UrlToUtf8(payloadSeg);
  } catch {
    return {
      ok: false,
      error: {
        code: "invalidBase64",
        message: "Failed to decode base64url header or payload",
      },
    };
  }

  let header: JWTHeaderParameters;
  let payload: JWTPayload;
  try {
    header = JSON.parse(headerRaw) as JWTHeaderParameters;
    payload = JSON.parse(payloadRaw) as JWTPayload;
  } catch {
    return {
      ok: false,
      error: {
        code: "invalidJson",
        message: "Header or payload is not valid JSON",
      },
    };
  }

  if (!signatureSeg) {
    return {
      ok: false,
      error: {
        code: "emptySignature",
        message: "JWT signature segment is empty",
      },
    };
  }

  const decoded: JwtDecoded = {
    header,
    payload,
    signature: signatureSeg,
    rawJson: JSON.stringify(
      { header, payload, signature: signatureSeg },
      null,
      2,
    ),
  };

  return { ok: true, decoded };
}

function claimDescriptionKey(name: string): string {
  if (KNOWN_CLAIM_KEYS.has(name)) {
    // x5t#S256 → x5tS256 for i18n key safety
    const safe = name.replace(/[^a-zA-Z0-9]/g, "");
    return `tools.jwtParser.claims.${safe}`;
  }
  return "tools.jwtParser.claims.custom";
}

function isTimeClaim(name: string, value: unknown): value is number {
  return (
    TIME_CLAIM_NAMES.has(name) &&
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

export function buildClaimsRows(
  header: JWTHeaderParameters,
  payload: JWTPayload,
): ClaimRow[] {
  const rows: ClaimRow[] = [];

  for (const [name, value] of Object.entries(header)) {
    if (value === undefined) continue;
    const time = isTimeClaim(name, value);
    rows.push({
      section: "header",
      name,
      value: formatJsonValue(value),
      descriptionKey: claimDescriptionKey(name),
      isTime: time,
      timestamp: time ? value : undefined,
    });
  }

  for (const [name, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    const time = isTimeClaim(name, value);
    rows.push({
      section: "payload",
      name,
      value: formatJsonValue(value),
      descriptionKey: claimDescriptionKey(name),
      isTime: time,
      timestamp: time ? value : undefined,
    });
  }

  return rows;
}

export interface FormattedClaimTime {
  local: string;
  utc: string;
  valid: boolean;
}

/** Format unix seconds as local timezone + UTC strings. */
export function formatClaimTime(sec: number): FormattedClaimTime {
  if (!Number.isFinite(sec) || sec < 0 || sec > 1e12) {
    return { local: String(sec), utc: String(sec), valid: false };
  }

  const date = new Date(sec * 1000);
  if (Number.isNaN(date.getTime())) {
    return { local: String(sec), utc: String(sec), valid: false };
  }

  const local = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "shortOffset",
  }).format(date);

  const utc = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  })
    .format(date)
    .replace(",", "")
    .concat(" UTC");

  return { local, utc, valid: true };
}

export type TimeValidityStatus =
  | "valid"
  | "expired"
  | "notYet"
  | "none";

/** Evaluate exp / nbf against current time (seconds). */
export function getTimeValidity(
  payload: JWTPayload,
  nowSec: number = Math.floor(Date.now() / 1000),
): TimeValidityStatus {
  const { exp, nbf } = payload;
  const hasExp = typeof exp === "number" && Number.isFinite(exp);
  const hasNbf = typeof nbf === "number" && Number.isFinite(nbf);

  if (!hasExp && !hasNbf) {
    return "none";
  }

  if (hasNbf && nowSec < nbf) {
    return "notYet";
  }

  if (hasExp && nowSec >= exp) {
    return "expired";
  }

  return "valid";
}

async function importKeyMaterial(
  keyInput: string,
  alg: string,
): Promise<CryptoKey | Uint8Array> {
  const trimmed = keyInput.trim();

  if (trimmed.startsWith("{")) {
    const jwk = JSON.parse(trimmed) as JWK;
    return importJWK(jwk, alg);
  }

  if (
    trimmed.includes("BEGIN PUBLIC KEY") ||
    trimmed.includes("BEGIN RSA PUBLIC KEY")
  ) {
    try {
      return await importSPKI(trimmed, alg);
    } catch {
      throw new Error(
        "Failed to import PEM public key (expect SPKI / PUBLIC KEY)",
      );
    }
  }

  if (trimmed.includes("BEGIN CERTIFICATE")) {
    throw new Error(
      "X.509 certificates are not supported; use a PEM public key or JWK",
    );
  }

  // HMAC secret (or raw key string)
  if (alg.startsWith("HS")) {
    return new TextEncoder().encode(trimmed);
  }

  // Asymmetric without PEM/JWK markers — treat as error
  throw new Error(
    "Provide a PEM public key (-----BEGIN PUBLIC KEY-----) or a JWK JSON object",
  );
}

export async function verifyJwt(
  tokenInput: string,
  keyInput: string,
  parsed: JwtParseResult,
): Promise<VerifyStatus> {
  const token = tokenInput.trim();
  const key = keyInput.trim();

  if (!token || !parsed.ok || parsed.empty) {
    return { kind: "idle" };
  }

  if (!key) {
    return { kind: "skipped" };
  }

  if (!("decoded" in parsed) || !parsed.decoded) {
    return { kind: "idle" };
  }

  const alg = parsed.decoded.header.alg;
  if (!alg || typeof alg !== "string") {
    return { kind: "unsupportedAlg", alg: String(alg ?? "") };
  }

  if (!SUPPORTED_ALGS.has(alg)) {
    return { kind: "unsupportedAlg", alg };
  }

  let keyMaterial: CryptoKey | Uint8Array;
  try {
    keyMaterial = await importKeyMaterial(key, alg);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { kind: "keyError", detail: message };
  }

  try {
    await compactVerify(token, keyMaterial, { algorithms: [alg] });
    return { kind: "valid" };
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: unknown }).code)
        : "";
    if (
      code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED" ||
      code === "ERR_JWS_INVALID"
    ) {
      return { kind: "invalid" };
    }
    const message = err instanceof Error ? err.message : String(err);
    const lower = message.toLowerCase();
    if (lower.includes("signature") || lower.includes("integrity")) {
      return { kind: "invalid" };
    }
    if (
      lower.includes("algorithm") ||
      lower.includes("key") ||
      lower.includes("unsupported")
    ) {
      return { kind: "keyError", detail: message };
    }
    return { kind: "invalid" };
  }
}
