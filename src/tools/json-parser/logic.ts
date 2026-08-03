export interface DetectedInputMode {
  escaped: boolean;
  minified: boolean;
}

export interface FormatError {
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
}

export type FormatResult =
  | { ok: true; text: string; value: unknown }
  | { ok: false; error: FormatError }
  | { ok: true; empty: true };

const POSITION_RE = /position\s+(\d+)/i;

/** Convert a character offset into 1-based line/column. */
export function offsetToLineColumn(
  source: string,
  offset: number,
): { line: number; column: number } {
  const safe = Math.max(0, Math.min(offset, source.length));
  let line = 1;
  let column = 1;
  for (let i = 0; i < safe; i++) {
    if (source[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

/** Extract a short snippet around the error offset for display. */
export function snippetAround(
  source: string,
  offset: number,
  radius = 24,
): string {
  const safe = Math.max(0, Math.min(offset, source.length));
  const start = Math.max(0, safe - radius);
  const end = Math.min(source.length, safe + radius);
  let snippet = source.slice(start, end).replace(/\s+/g, " ");
  if (start > 0) snippet = `…${snippet}`;
  if (end < source.length) snippet = `${snippet}…`;
  return snippet;
}

function locateParseError(source: string, err: unknown): FormatError {
  const message =
    err instanceof Error
      ? err.message
      : "Invalid JSON — please check the syntax";

  const match = POSITION_RE.exec(message);
  if (!match) {
    return { message };
  }

  const offset = Number(match[1]);
  if (!Number.isFinite(offset)) {
    return { message };
  }

  const { line, column } = offsetToLineColumn(source, offset);
  return {
    message,
    line,
    column,
    snippet: snippetAround(source, offset),
  };
}

/**
 * Detect whether the input looks like an escaped JSON string and/or is minified.
 * Escaped = whole input parses as a JSON string whose content is an object/array JSON.
 */
export function detectInputMode(raw: string): DetectedInputMode {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { escaped: false, minified: false };
  }

  try {
    const first = JSON.parse(trimmed) as unknown;

    if (typeof first === "string") {
      try {
        const inner = JSON.parse(first) as unknown;
        if (inner !== null && typeof inner === "object") {
          const minified = !/\n/.test(first) && first === JSON.stringify(inner);
          return { escaped: true, minified };
        }
      } catch {
        // Plain JSON string value — not treated as escaped payload
      }
    }

    const minified = !/\n/.test(trimmed) && trimmed === JSON.stringify(first);
    return { escaped: false, minified };
  } catch {
    return { escaped: false, minified: false };
  }
}

/**
 * Parse raw text into a JSON value, unwrapping one escaped-string layer when present
 * (an escaped payload is a top-level JSON string whose content is itself JSON).
 */
function parseUnwrapped(
  raw: string,
): { ok: true; value: unknown } | { ok: false; error: FormatError } {
  const trimmed = raw.trim();
  try {
    const first = JSON.parse(trimmed) as unknown;
    if (typeof first === "string") {
      try {
        return { ok: true, value: JSON.parse(first) as unknown };
      } catch {
        // Plain JSON string value — treat the string itself as the value
        return { ok: true, value: first };
      }
    }
    return { ok: true, value: first };
  } catch (err) {
    return { ok: false, error: locateParseError(trimmed, err) };
  }
}

/** Render a JSON value according to the escape / minify representation flags. */
function renderJson(
  value: unknown,
  escape: boolean,
  minify: boolean,
): string | null {
  let text = minify ? JSON.stringify(value) : JSON.stringify(value, null, 2);
  if (text === undefined) return null;
  if (escape) text = JSON.stringify(text);
  return text;
}

/**
 * Re-render the input text under the given representation flags.
 * Used when a switch toggles: the left input box content follows the switches.
 * Returns the original text unchanged when it cannot be parsed.
 */
export function transformJson(
  raw: string,
  escape: boolean,
  minify: boolean,
): string {
  if (!raw.trim()) return raw;
  const parsed = parseUnwrapped(raw);
  if (!parsed.ok) return raw;
  return renderJson(parsed.value, escape, minify) ?? raw;
}

/**
 * Build the right-side preview: always the formatted standard JSON (pretty, 2-space),
 * regardless of the escape / minify switches.
 */
export function previewJson(raw: string): FormatResult {
  if (!raw.trim()) {
    return { ok: true, empty: true };
  }
  const parsed = parseUnwrapped(raw);
  if (!parsed.ok) {
    return parsed;
  }
  const text = JSON.stringify(parsed.value, null, 2);
  if (text === undefined) {
    return {
      ok: false,
      error: { message: "Value is not JSON-serializable" },
    };
  }
  return { ok: true, text, value: parsed.value };
}
