import type { Theme } from "@/stores/themeStore";

/**
 * Mermaid integration: the (heavy) mermaid library is loaded lazily on first
 * diagram render so it never delays the initial page load, and re-initialized
 * whenever the app theme flips so diagrams match light / dark mode.
 */

type Mermaid = typeof import("mermaid").default;

let mermaidPromise: Promise<Mermaid> | null = null;

function loadMermaid(): Promise<Mermaid> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then(({ default: mermaid }) => mermaid);
  }
  return mermaidPromise;
}

let idCounter = 0;

/** Render mermaid source into an SVG string; throws on syntax errors */
export async function renderMermaidDiagram(
  code: string,
  theme: Theme,
): Promise<string> {
  const mermaid = await loadMermaid();
  mermaid.initialize({
    startOnLoad: false,
    theme: theme === "dark" ? "dark" : "default",
    // Keep diagrams readable inside the narrow preview column
    flowchart: { useMaxWidth: true },
    sequence: { useMaxWidth: true },
  });
  idCounter += 1;
  const { svg } = await mermaid.render(`markdown-preview-${idCounter}`, code);
  return svg;
}
