import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EditorView } from "codemirror";
import {
  Button,
  Callout,
  CopyButton,
  ExpandIcon,
  MaximizeIcon,
  MinimizeIcon,
  SegmentedControl,
  Switch,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { EditorPanel } from "./components/EditorPanel";
import { PreviewPanel } from "./components/PreviewPanel";
import { useScrollSync } from "./lib/scrollSync";
import { useMarkdownPreviewStore } from "./store";

/** Mobile shows one pane at a time; desktop shows both side by side */
type MobileView = "edit" | "preview";

const PANEL_HEIGHT = "h-[70vh] lg:h-[calc(100vh-16rem)] lg:min-h-[420px]";

export default function MarkdownPreviewTool() {
  const { t } = useTranslation();
  const input = useMarkdownPreviewStore((s) => s.input);
  const syncOn = useMarkdownPreviewStore((s) => s.syncOn);
  const hasHydrated = useMarkdownPreviewStore((s) => s._hasHydrated);
  const setInput = useMarkdownPreviewStore((s) => s.setInput);
  const setSyncOn = useMarkdownPreviewStore((s) => s.setSyncOn);

  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("edit");

  // Page fullscreen ("zen") covers the viewport with a fixed overlay; native
  // fullscreen additionally requests the browser's fullscreen mode
  const [zenOn, setZenOn] = useState(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  // Zen state to restore after the browser leaves fullscreen (e.g. via Esc)
  const zenBeforeNativeRef = useRef(false);

  useEffect(() => {
    const onChange = () => {
      const active = Boolean(document.fullscreenElement);
      setNativeFullscreen(active);
      if (!active) setZenOn(zenBeforeNativeRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Esc exits page fullscreen (browser fullscreen handles Esc natively)
  useEffect(() => {
    if (!zenOn) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) setZenOn(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zenOn]);

  // Lock the page behind the overlay from scrolling
  useEffect(() => {
    document.body.style.overflow = zenOn ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [zenOn]);

  const togglePageFullscreen = () => {
    if (!zenOn) {
      setZenOn(true);
      return;
    }
    if (document.fullscreenElement) {
      // Leaving page fullscreen also leaves browser fullscreen
      zenBeforeNativeRef.current = false;
      document.exitFullscreen().catch(() => {
        setZenOn(false);
      });
    } else {
      setZenOn(false);
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
    zenBeforeNativeRef.current = zenOn;
    setZenOn(true);
    containerRef.current?.requestFullscreen().catch(() => {});
  };

  useEffect(() => {
    useMarkdownPreviewStore.persist.rehydrate()?.catch(() => {
      useMarkdownPreviewStore.getState().setHasHydrated(true);
    });
  }, []);

  // Seed the localized sample document on first visit
  useEffect(() => {
    if (!hasHydrated) return;
    const state = useMarkdownPreviewStore.getState();
    if (!state.seeded) {
      state.seed(t("tools.markdownPreview.sampleDoc"));
    }
  }, [hasHydrated, t]);

  useScrollSync(syncOn, editorView, previewRef);

  // CodeMirror needs a re-measure after being hidden on mobile
  useEffect(() => {
    if (mobileView === "edit") editorView?.requestMeasure();
  }, [mobileView, editorView]);

  const stats = useMemo(
    () => ({
      lines: input ? input.split("\n").length : 0,
      chars: [...input].length,
    }),
    [input],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        zenOn
          ? "fixed inset-0 z-[100] flex flex-col overflow-hidden bg-bg px-4 py-3"
          : "mx-auto max-w-7xl px-4 py-10 sm:px-6",
      )}
    >
      {!zenOn && (
        <header className="animate-fade-in-up">
          <h1 className="font-display text-2xl font-bold text-text">
            {t("tools.markdownPreview.name")}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {t("tools.markdownPreview.subtitle")}
          </p>
          <div className="mt-4">
            <Callout variant="info">
              {t("tools.markdownPreview.privacyNotice")}
            </Callout>
          </div>
        </header>
      )}

      <div
        className={cn(
          "animate-fade-in-up flex flex-wrap items-center justify-between gap-3",
          zenOn ? "shrink-0" : "mt-6",
        )}
      >
        <div className="flex flex-wrap items-center gap-4">
          <SegmentedControl<MobileView>
            className="lg:hidden"
            value={mobileView}
            onChange={setMobileView}
            options={[
              {
                label: t("tools.markdownPreview.editorLabel"),
                // eslint-disable-next-line i18next/no-literal-string
                value: "edit" as const,
              },
              {
                label: t("tools.markdownPreview.previewLabel"),
                // eslint-disable-next-line i18next/no-literal-string
                value: "preview" as const,
              },
            ]}
          />
          <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
            <Switch
              checked={syncOn}
              onChange={setSyncOn}
              aria-label={t("tools.markdownPreview.syncScroll")}
            />
            <span>{t("tools.markdownPreview.syncScroll")}</span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-text-muted">
            {t("tools.markdownPreview.statsLines", { count: stats.lines })}
            {" · "}
            {t("tools.markdownPreview.statsChars", { count: stats.chars })}
          </span>
          <CopyButton
            text={input}
            label={t("tools.markdownPreview.copySource")}
          />
          <Button
            variant="ghost"
            size="sm"
            disabled={!input}
            onClick={() => setInput("")}
          >
            {t("tools.markdownPreview.clear")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePageFullscreen}
            aria-label={t("tools.markdownPreview.pageFullscreen")}
          >
            {zenOn ? <MinimizeIcon size={14} /> : <MaximizeIcon size={14} />}
            {zenOn
              ? t("tools.markdownPreview.exitPageFullscreen")
              : t("tools.markdownPreview.pageFullscreen")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            aria-label={t("tools.markdownPreview.fullscreen")}
          >
            {nativeFullscreen ? (
              <MinimizeIcon size={14} />
            ) : (
              <ExpandIcon size={14} />
            )}
            {nativeFullscreen
              ? t("tools.markdownPreview.exitFullscreen")
              : t("tools.markdownPreview.fullscreen")}
          </Button>
        </div>
      </div>

      <main
        className={cn(
          "animate-fade-in-up grid grid-cols-1 gap-4 lg:grid-cols-2",
          zenOn ? "mt-3 min-h-0 flex-1" : "mt-4",
        )}
      >
        <EditorPanel
          value={input}
          onChange={setInput}
          onViewReady={setEditorView}
          onViewDestroy={() => setEditorView(null)}
          className={cn(
            "flex flex-col p-4",
            zenOn ? "min-h-0" : PANEL_HEIGHT,
            mobileView === "edit" ? "flex" : "hidden lg:flex",
          )}
        />
        <PreviewPanel
          input={input}
          scrollRef={previewRef}
          className={cn(
            "flex flex-col p-4",
            zenOn ? "min-h-0" : PANEL_HEIGHT,
            mobileView === "preview" ? "flex" : "hidden lg:flex",
          )}
        />
      </main>
    </div>
  );
}
