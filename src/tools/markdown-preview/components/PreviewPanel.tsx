import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { rehypeSourceLine } from "../lib/rehypeSourceLine";
import { MermaidBlock } from "./MermaidBlock";
import "../styles.css";

export interface PreviewPanelProps {
  input: string;
  className?: string;
  /** Scroll container ref, used by the scroll-sync hook */
  scrollRef: RefObject<HTMLDivElement | null>;
}

/** Minimal structural view of a hast node (avoids depending on @types/hast) */
interface HastNodeLike {
  type: string;
  tagName?: string;
  value?: string;
  properties?: { className?: string[] | string };
  children?: HastNodeLike[];
}

function classList(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(/\s+/);
  return [];
}

/** Concatenate all text nodes under a hast node */
function extractText(node: HastNodeLike): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(extractText).join("");
}

/**
 * Element styling follows the UI theme rules: semantic tokens only, headings
 * use font-display, all chain-style monospace content uses font-mono.
 */
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-3 border-b border-border pb-2 font-display text-2xl font-bold text-text first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-6 mb-2.5 border-b border-border pb-1.5 font-display text-xl font-bold text-text first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-5 mb-2 font-display text-lg font-semibold text-text first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-4 mb-2 font-display text-base font-semibold text-text first:mt-0">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="mt-4 mb-1.5 font-display text-sm font-semibold text-text first:mt-0">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="mt-4 mb-1.5 font-display text-sm font-semibold text-text-muted first:mt-0">
      {children}
    </h6>
  ),
  p: ({ children }) => <p className="my-3 leading-7 text-text">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 break-words hover:text-primary-hover"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-border-strong pl-4 text-text-secondary [&_p]:my-1.5">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="my-3 list-disc space-y-1 pl-6 text-text">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1 pl-6 text-text">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  input: ({ checked, disabled, type }) =>
    type === "checkbox" ? (
      <input
        type="checkbox"
        checked={checked ?? false}
        disabled={disabled}
        readOnly
        className="mr-1.5 size-3.5 translate-y-0.5 accent-(--primary)"
      />
    ) : null,
  hr: () => <hr className="my-6 border-border" />,
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="my-3 max-w-full rounded-lg border border-border"
    />
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border bg-surface-hover px-3 py-2 text-left font-semibold text-text">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-3 py-2 align-top text-text last:border-b-0">
      {children}
    </td>
  ),
  // Fenced blocks: mermaid is rendered as a diagram, everything else keeps the
  // highlighted <code> children inside a styled container
  pre: ({ node, children }) => {
    const codeEl = (node as HastNodeLike | undefined)?.children?.find(
      (child) => child.type === "element" && child.tagName === "code",
    );
    if (
      codeEl &&
      classList(codeEl.properties?.className).includes("language-mermaid")
    ) {
      return <MermaidBlock code={extractText(codeEl).replace(/\n$/, "")} />;
    }
    return (
      <pre className="my-4 overflow-x-auto rounded-lg border border-border bg-bg p-4">
        {children}
      </pre>
    );
  },
  code: ({ className, children }) => {
    const text = Array.isArray(children)
      ? children.join("")
      : String(children ?? "");
    const classes = classList(className);
    const isBlock =
      text.includes("\n") ||
      classes.includes("hljs") ||
      classes.some((name) => name.startsWith("language-"));
    if (isBlock) {
      return (
        <code className={cn("font-mono text-xs leading-6", className)}>
          {children}
        </code>
      );
    }
    return (
      <code className="rounded-md bg-surface-hover px-1.5 py-0.5 font-mono text-[0.85em] text-primary">
        {children}
      </code>
    );
  },
};

export function PreviewPanel({
  input,
  className,
  scrollRef,
}: PreviewPanelProps) {
  const { t } = useTranslation();
  const isEmpty = input.trim().length === 0;

  return (
    <Card className={className}>
      <h2 className="font-display text-sm font-semibold text-text">
        {t("tools.markdownPreview.previewLabel")}
      </h2>
      {/* `relative` anchors offsetTop of [data-line] blocks to this container */}
      <div
        ref={scrollRef}
        className="relative mt-3 min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-bg"
      >
        {isEmpty ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-text-muted">
            {t("tools.markdownPreview.empty")}
          </div>
        ) : (
          <div className="md-preview px-5 py-4">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSourceLine, [rehypeHighlight, {}]]}
              components={markdownComponents}
            >
              {input}
            </Markdown>
          </div>
        )}
      </div>
    </Card>
  );
}
