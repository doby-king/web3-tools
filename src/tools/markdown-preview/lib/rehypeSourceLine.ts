/**
 * Rehype plugin: tag every block-level element with the Markdown source line it
 * was parsed from (`data-line`). The preview panel uses these markers to build a
 * source-line -> pixel-position map for block-accurate scroll syncing.
 */

/** Minimal structural view of a hast node (avoids depending on @types/hast) */
interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  position?: { start: { line: number } };
  children?: HastNode[];
}

/** Block-level tags that anchor scroll positions (inline elements are skipped) */
const BLOCK_TAGS = new Set([
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "ul",
  "ol",
  "li",
  "table",
  "figure",
  "hr",
  "details",
]);

function walk(node: HastNode) {
  if (
    node.type === "element" &&
    node.tagName &&
    BLOCK_TAGS.has(node.tagName) &&
    node.position &&
    node.properties
  ) {
    // `dataLine` is serialized as the `data-line` HTML attribute
    node.properties.dataLine = node.position.start.line;
  }
  node.children?.forEach(walk);
}

export function rehypeSourceLine() {
  return (tree: HastNode) => {
    walk(tree);
  };
}
