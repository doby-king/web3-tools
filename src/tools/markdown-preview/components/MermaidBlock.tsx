import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Callout, SpinnerIcon } from "@/components/ui";
import { useThemeStore } from "@/stores/themeStore";
import { renderMermaidDiagram } from "../lib/renderMermaid";

export interface MermaidBlockProps {
  code: string;
}

/**
 * Renders a fenced ```mermaid code block. Mermaid itself is loaded lazily on
 * first use; syntax errors fall back to an inline warning instead of breaking
 * the whole preview.
 */
export function MermaidBlock({ code }: MermaidBlockProps) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(null);
    renderMermaidDiagram(code, theme)
      .then((rendered) => {
        if (!cancelled) setSvg(rendered);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code, theme]);

  if (error) {
    return (
      <Callout variant="warning" className="my-4">
        <p>{t("tools.markdownPreview.mermaidError")}</p>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs text-text-muted">
          {error}
        </pre>
      </Callout>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-bg py-8 text-xs text-text-muted">
        <SpinnerIcon size={14} />
        <span>{t("tools.markdownPreview.mermaidRendering")}</span>
      </div>
    );
  }

  return (
    <div
      className="my-4 overflow-x-auto rounded-lg border border-border bg-surface p-4 [&_svg]:h-auto [&_svg]:max-w-full"
      // The SVG is generated locally by mermaid from the user's own input
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
