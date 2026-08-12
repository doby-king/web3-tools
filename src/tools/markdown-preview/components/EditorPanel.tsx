import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { EditorState, Compartment, type Extension } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { Card } from "@/components/ui";
import { useThemeStore, type Theme } from "@/stores/themeStore";

export interface EditorPanelProps {
  value: string;
  className?: string;
  onChange: (value: string) => void;
  /** Called once the CodeMirror view is mounted (used for scroll sync) */
  onViewReady: (view: EditorView) => void;
  /** Called when the CodeMirror view is destroyed */
  onViewDestroy: () => void;
}

/** Editor chrome themed with the app's semantic tokens; one-dark in dark mode */
function buildThemeExtensions(theme: Theme): Extension {
  return [
    theme === "dark" ? oneDark : [],
    EditorView.theme({
      "&": { backgroundColor: "transparent", fontSize: "13px", height: "100%" },
      ".cm-scroller": {
        fontFamily: "var(--font-mono)",
        lineHeight: "1.7",
      },
      ".cm-content": { padding: "12px 0" },
      ".cm-line": { padding: "0 12px" },
      ".cm-gutters": {
        backgroundColor: "transparent",
        border: "none",
        color: "var(--text-muted)",
        paddingLeft: "6px",
      },
      ".cm-activeLine": { backgroundColor: "transparent" },
      ".cm-activeLineGutter": {
        backgroundColor: "transparent",
        color: "var(--text-secondary)",
      },
      ".cm-cursor": { borderLeftColor: "var(--primary)" },
      ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
        backgroundColor: "color-mix(in srgb, var(--primary) 18%, transparent)",
      },
      "&.cm-focused": { outline: "none" },
    }),
  ];
}

export function EditorPanel({
  value,
  className,
  onChange,
  onViewReady,
  onViewDestroy,
}: EditorPanelProps) {
  const { t } = useTranslation();
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useRef(new Compartment());
  // Last value we pushed into / received from CodeMirror, to avoid loops when
  // the store value changes for external reasons (clear / seeding)
  const lastValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onViewReadyRef = useRef(onViewReady);
  onViewReadyRef.current = onViewReady;
  const onViewDestroyRef = useRef(onViewDestroy);
  onViewDestroyRef.current = onViewDestroy;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const state = EditorState.create({
      doc: lastValueRef.current,
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        themeCompartment.current.of(
          buildThemeExtensions(useThemeStore.getState().theme),
        ),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const doc = update.state.doc.toString();
            lastValueRef.current = doc;
            onChangeRef.current(doc);
          }
        }),
      ],
    });
    const view = new EditorView({ state, parent: host });
    viewRef.current = view;
    onViewReadyRef.current(view);

    // Follow app-level light / dark switches
    const unsubscribe = useThemeStore.subscribe((themeState) => {
      view.dispatch({
        effects: themeCompartment.current.reconfigure(
          buildThemeExtensions(themeState.theme),
        ),
      });
    });

    return () => {
      unsubscribe();
      view.destroy();
      viewRef.current = null;
      onViewDestroyRef.current();
    };
  }, []);

  // Apply external value changes (clear button, first-visit seeding)
  useEffect(() => {
    const view = viewRef.current;
    if (!view || value === lastValueRef.current) return;
    lastValueRef.current = value;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
  }, [value]);

  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold text-text">
          {t("tools.markdownPreview.editorLabel")}
        </h2>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-bg">
        <div ref={hostRef} className="h-full" />
      </div>
    </Card>
  );
}
