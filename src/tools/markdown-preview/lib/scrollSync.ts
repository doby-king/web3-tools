import { useEffect, useRef, type RefObject } from "react";
import type { EditorView } from "codemirror";

/**
 * Bidirectional block-level scroll sync between the CodeMirror editor and the
 * rendered preview.
 *
 * How it works:
 * - The preview's block elements carry a `data-line` attribute (injected by
 *   lib/rehypeSourceLine) mapping them back to their Markdown source line.
 * - Editor -> preview: read the source line at the editor's top edge, then
 *   scroll the preview to the matching block, interpolating between adjacent
 *   blocks so long blocks still track smoothly.
 * - Preview -> editor: find the block at the preview's top edge and scroll the
 *   editor so the corresponding source line sits at its top edge.
 * - A short lock prevents the two listeners from feeding back into each other.
 */

/** Pixels of breathing room above the synced line / block */
const TOP_MARGIN = 4;
/** Lock duration after the last programmatic scroll before the other side takes over */
const UNLOCK_DELAY_MS = 120;

type SyncSource = "editor" | "preview";

interface PreviewBlock {
  line: number;
  top: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Read all `data-line` markers in document order, with tops relative to the scroll container */
function collectPreviewBlocks(container: HTMLElement): PreviewBlock[] {
  const blocks: PreviewBlock[] = [];
  for (const el of container.querySelectorAll<HTMLElement>("[data-line]")) {
    const line = Number(el.dataset.line);
    if (Number.isFinite(line)) {
      blocks.push({ line, top: el.offsetTop });
    }
  }
  return blocks;
}

/** Last index whose line is <= `line` (-1 when `line` is before the first block) */
function findBlockIndex(blocks: PreviewBlock[], line: number): number {
  let lo = 0;
  let hi = blocks.length - 1;
  let result = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (blocks[mid].line <= line) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}

function isAtTop(el: HTMLElement) {
  return el.scrollTop <= 1;
}

function isAtBottom(el: HTMLElement) {
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
}

export function useScrollSync(
  enabled: boolean,
  editorView: EditorView | null,
  previewRef: RefObject<HTMLDivElement | null>,
) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    const preview = previewRef.current;
    if (!enabled || !editorView || !preview) return;

    const editorScrollEl = editorView.scrollDOM;
    const lock: { source: SyncSource | null } = { source: null };
    let unlockTimer: ReturnType<typeof setTimeout> | undefined;
    let editorRaf = 0;
    let previewRaf = 0;

    const acquire = (source: SyncSource): boolean => {
      if (lock.source && lock.source !== source) return false;
      lock.source = source;
      if (unlockTimer) clearTimeout(unlockTimer);
      unlockTimer = setTimeout(() => {
        lock.source = null;
      }, UNLOCK_DELAY_MS);
      return true;
    };

    /** Source line number currently sitting at the editor's top edge */
    const topEditorLine = (): number => {
      const scrollRect = editorScrollEl.getBoundingClientRect();
      const contentRect = editorView.contentDOM.getBoundingClientRect();
      const pos = editorView.posAtCoords({
        x: Math.max(contentRect.left, 0) + 4,
        y: scrollRect.top + TOP_MARGIN + 1,
      });
      if (pos === null)
        return editorView.state.doc.lineAt(editorView.viewport.from).number;
      return editorView.state.doc.lineAt(pos).number;
    };

    const syncEditorToPreview = () => {
      if (!acquire("editor")) return;
      if (isAtTop(editorScrollEl)) {
        preview.scrollTop = 0;
        return;
      }
      if (isAtBottom(editorScrollEl)) {
        preview.scrollTop = preview.scrollHeight;
        return;
      }
      const blocks = collectPreviewBlocks(preview);
      if (blocks.length === 0) return;

      const line = topEditorLine();
      const index = findBlockIndex(blocks, line);
      let target: number;
      if (index < 0) {
        target = 0;
      } else if (index >= blocks.length - 1) {
        target = blocks[blocks.length - 1].top;
      } else {
        // Interpolate between the current block and the next one
        const current = blocks[index];
        const next = blocks[index + 1];
        const span = next.line - current.line || 1;
        const progress = clamp((line - current.line) / span, 0, 1);
        target = current.top + progress * (next.top - current.top);
      }
      preview.scrollTop = clamp(target - TOP_MARGIN, 0, preview.scrollHeight);
    };

    const syncPreviewToEditor = () => {
      if (!acquire("preview")) return;
      if (isAtTop(preview)) {
        editorScrollEl.scrollTop = 0;
        return;
      }
      if (isAtBottom(preview)) {
        editorScrollEl.scrollTop = editorScrollEl.scrollHeight;
        return;
      }
      const blocks = collectPreviewBlocks(preview);
      if (blocks.length === 0) return;

      // Last block whose top is still above the preview's visible top edge
      let current = blocks[0];
      for (const block of blocks) {
        if (block.top - TOP_MARGIN <= preview.scrollTop) current = block;
        else break;
      }

      const doc = editorView.state.doc;
      const line = clamp(current.line, 1, doc.lines);
      const block = editorView.lineBlockAt(doc.line(line).from);
      const contentRect = editorView.contentDOM.getBoundingClientRect();
      const scrollRect = editorScrollEl.getBoundingClientRect();
      const delta = contentRect.top + block.top - (scrollRect.top + TOP_MARGIN);
      editorScrollEl.scrollTop = clamp(
        editorScrollEl.scrollTop + delta,
        0,
        editorScrollEl.scrollHeight,
      );
    };

    const onEditorScroll = () => {
      if (editorRaf) return;
      editorRaf = requestAnimationFrame(() => {
        editorRaf = 0;
        syncEditorToPreview();
      });
    };
    const onPreviewScroll = () => {
      if (previewRaf) return;
      previewRaf = requestAnimationFrame(() => {
        previewRaf = 0;
        syncPreviewToEditor();
      });
    };

    editorScrollEl.addEventListener("scroll", onEditorScroll, {
      passive: true,
    });
    preview.addEventListener("scroll", onPreviewScroll, { passive: true });

    return () => {
      editorScrollEl.removeEventListener("scroll", onEditorScroll);
      preview.removeEventListener("scroll", onPreviewScroll);
      if (editorRaf) cancelAnimationFrame(editorRaf);
      if (previewRaf) cancelAnimationFrame(previewRaf);
      if (unlockTimer) clearTimeout(unlockTimer);
    };
  }, [enabled, editorView, previewRef]);
}
