import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

interface TreeLine {
  id: string;
  lineNo: number;
  depth: number;
  /** Path used as collapse key for containers */
  path: string;
  isContainer: boolean;
  /** Opening line of a container that can be collapsed */
  canCollapse: boolean;
  /** Preview shown when collapsed, e.g. `{ … }` */
  collapsedPreview?: string;
  /** Closing brace/bracket line belonging to a container */
  isClosing?: boolean;
  /** Rendered prefix (indent is applied via depth) */
  keyLabel?: string;
  /** Content after key (or the whole scalar line) */
  content: string;
  /** Trailing comma */
  comma?: boolean;
}

function isObject(v: unknown): v is JsonObject {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function formatPrimitive(value: JsonPrimitive): string {
  return JSON.stringify(value);
}

function containerPreview(value: JsonValue): string {
  if (Array.isArray(value)) {
    return value.length === 0 ? "[]" : `[${value.length}]`;
  }
  if (isObject(value)) {
    const n = Object.keys(value).length;
    return n === 0 ? "{}" : `{${n}}`;
  }
  return formatPrimitive(value as JsonPrimitive);
}

/** Build a flat list of pretty-print lines with collapse metadata. */
function buildLines(
  value: JsonValue,
  path: string,
  depth: number,
  keyLabel: string | undefined,
  isLast: boolean,
  counter: { n: number },
): TreeLine[] {
  const lines: TreeLine[] = [];
  const nextNo = () => {
    counter.n += 1;
    return counter.n;
  };

  const comma = !isLast;

  if (Array.isArray(value)) {
    if (value.length === 0) {
      lines.push({
        id: `${path}:empty-arr`,
        lineNo: nextNo(),
        depth,
        path,
        isContainer: true,
        canCollapse: false,
        keyLabel,
        content: "[]",
        comma,
      });
      return lines;
    }

    const openId = `${path}:open`;
    lines.push({
      id: openId,
      lineNo: nextNo(),
      depth,
      path,
      isContainer: true,
      canCollapse: true,
      collapsedPreview: containerPreview(value),
      keyLabel,
      content: "[",
      // comma shown only when this container is collapsed
      comma,
    });

    value.forEach((item, i) => {
      lines.push(
        ...buildLines(
          item,
          `${path}/${i}`,
          depth + 1,
          undefined,
          i === value.length - 1,
          counter,
        ),
      );
    });

    lines.push({
      id: `${path}:close`,
      lineNo: nextNo(),
      depth,
      path,
      isContainer: true,
      canCollapse: false,
      isClosing: true,
      content: "]",
      comma,
    });
    return lines;
  }

  if (isObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) {
      lines.push({
        id: `${path}:empty-obj`,
        lineNo: nextNo(),
        depth,
        path,
        isContainer: true,
        canCollapse: false,
        keyLabel,
        content: "{}",
        comma,
      });
      return lines;
    }

    lines.push({
      id: `${path}:open`,
      lineNo: nextNo(),
      depth,
      path,
      isContainer: true,
      canCollapse: true,
      collapsedPreview: containerPreview(value),
      keyLabel,
      content: "{",
      // comma shown only when this container is collapsed
      comma,
    });

    keys.forEach((k, i) => {
      lines.push(
        ...buildLines(
          value[k],
          `${path}/${k}`,
          depth + 1,
          k,
          i === keys.length - 1,
          counter,
        ),
      );
    });

    lines.push({
      id: `${path}:close`,
      lineNo: nextNo(),
      depth,
      path,
      isContainer: true,
      canCollapse: false,
      isClosing: true,
      content: "}",
      comma,
    });
    return lines;
  }

  lines.push({
    id: path || "root-scalar",
    lineNo: nextNo(),
    depth,
    path,
    isContainer: false,
    canCollapse: false,
    keyLabel,
    content: formatPrimitive(value),
    comma,
  });
  return lines;
}

function filterCollapsed(
  lines: TreeLine[],
  collapsed: Set<string>,
): TreeLine[] {
  const result: TreeLine[] = [];
  let skipPath: string | null = null;
  let skipDepth = -1;

  for (const line of lines) {
    if (skipPath !== null) {
      if (line.depth > skipDepth) continue;
      // Reached sibling / close at same depth — stop skipping after we've
      // also skipped the closing line of the collapsed container.
      if (
        line.depth === skipDepth &&
        line.isClosing &&
        line.path === skipPath
      ) {
        skipPath = null;
        skipDepth = -1;
        continue;
      }
      skipPath = null;
      skipDepth = -1;
    }

    if (line.canCollapse && collapsed.has(line.path)) {
      result.push(line);
      skipPath = line.path;
      skipDepth = line.depth;
      continue;
    }

    result.push(line);
  }

  return result;
}

function tokenClass(content: string): string {
  if (
    content === "{" ||
    content === "}" ||
    content === "[" ||
    content === "]"
  ) {
    return "text-text-secondary";
  }
  if (content === "true" || content === "false") return "text-primary";
  if (content === "null") return "text-text-muted";
  if (content.startsWith('"')) return "text-success";
  return "text-accent";
}

export interface JsonTreeViewProps {
  value: unknown;
  className?: string;
}

export function JsonTreeView({ value, className }: JsonTreeViewProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const prevValueRef = useRef(value);

  // Reset collapse state when the root value identity/structure changes meaningfully
  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setCollapsed(new Set());
    }
  }, [value]);

  const allLines = useMemo(
    () => buildLines(value as JsonValue, "$", 0, undefined, true, { n: 0 }),
    [value],
  );

  const visible = useMemo(
    () => filterCollapsed(allLines, collapsed),
    [allLines, collapsed],
  );

  const toggle = (path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  // Remap sequential line numbers for visible rows
  let displayNo = 0;

  return (
    <div
      className={cn(
        "overflow-auto font-mono text-xs leading-5 text-text",
        className,
      )}
    >
      <div className="min-w-full">
        {visible.map((line) => {
          displayNo += 1;
          const isCollapsed = line.canCollapse && collapsed.has(line.path);
          const showComma = Boolean(
            line.comma && (line.isClosing || !line.canCollapse || isCollapsed),
          );

          return (
            <div key={line.id} className="flex hover:bg-surface-hover/60">
              <span
                className="sticky left-0 w-10 shrink-0 select-none border-r border-border bg-bg pr-2 text-right text-text-muted"
                aria-hidden
              >
                {displayNo}
              </span>
              <div
                className="flex min-w-0 flex-1 items-start gap-0.5"
                style={{ paddingLeft: `${line.depth * 12 + 8}px` }}
              >
                {line.canCollapse ? (
                  <button
                    type="button"
                    onClick={() => toggle(line.path)}
                    aria-label={
                      isCollapsed
                        ? t("tools.jsonParser.expand")
                        : t("tools.jsonParser.collapse")
                    }
                    className="mt-0.5 shrink-0 rounded p-0.5 text-text-muted transition-colors hover:bg-border/60 hover:text-text cursor-pointer"
                  >
                    {isCollapsed ? (
                      <ChevronRightIcon size={12} />
                    ) : (
                      <ChevronDownIcon size={12} />
                    )}
                  </button>
                ) : (
                  <span className="inline-block w-4 shrink-0" />
                )}
                <span className="min-w-0 break-all">
                  {line.keyLabel !== undefined && (
                    <>
                      <span className="text-primary">
                        {JSON.stringify(line.keyLabel)}
                      </span>
                      <span className="text-text-muted">: </span>
                    </>
                  )}
                  {isCollapsed ? (
                    <span className="text-text-secondary">
                      {line.collapsedPreview}
                    </span>
                  ) : (
                    <span className={tokenClass(line.content)}>
                      {line.content}
                    </span>
                  )}
                  {showComma && <span className="text-text-muted">,</span>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
