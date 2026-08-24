'use client';

/**
 * Editor chrome drawn over the artboard: the selection ring, the safe-area
 * guides, and a mark on anything that overflows.
 *
 * THE INVARIANT THAT MATTERS: this is a SIBLING of the `[data-stage]` node,
 * never a child of it. Both exporters start from the stage node —
 * `rasterize()` clones that subtree and `stageToSvg()` walks it — so nothing
 * rendered here can reach an exported file. Move it inside the stage and every
 * PNG ships with a selection ring baked in.
 *
 * It sits inside `ScaledStage`'s transformed inner div, which is a containing
 * block for absolutely-positioned descendants. So it inherits the preview
 * scale for free and can be laid out in plain design pixels.
 */
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { insets } from '@/templates/canvases';
import type { CanvasSpec } from '@/templates/types';
import type { StageIssue } from './useStageIssues';

export interface StageOverlayProps {
  stageRef: RefObject<HTMLDivElement | null>;
  canvas: CanvasSpec;
  selectedLayerId: string | null;
  issues: readonly StageIssue[];
  showGuides: boolean;
  /** Bump to force a re-measure after the composition changes. */
  revision: number;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Measure a layer's box in DESIGN px, relative to the stage. */
function measure(stage: HTMLElement, layerId: string): Box | null {
  const el = stage.querySelector<HTMLElement>(`[data-layer="${CSS.escape(layerId)}"]`);
  if (!el) return null;

  const stageRect = stage.getBoundingClientRect();
  const width = stage.offsetWidth || stageRect.width;
  const k = width > 0 && stageRect.width > 0 ? stageRect.width / width : 1;
  if (k === 0) return null;

  const r = el.getBoundingClientRect();
  return {
    x: (r.left - stageRect.left) / k,
    y: (r.top - stageRect.top) / k,
    w: r.width / k,
    h: r.height / k,
  };
}

export function StageOverlay({
  stageRef,
  canvas,
  selectedLayerId,
  issues,
  showGuides,
  revision,
}: StageOverlayProps) {
  const [selection, setSelection] = useState<Box | null>(null);
  const [issueBoxes, setIssueBoxes] = useState<{ id: string; box: Box }[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const frame = requestAnimationFrame(() => {
      setSelection(selectedLayerId ? measure(stage, selectedLayerId) : null);

      const next: { id: string; box: Box }[] = [];
      for (const issue of issues) {
        const box = measure(stage, issue.layerId);
        if (box) next.push({ id: issue.layerId, box });
      }
      setIssueBoxes(next);
    });

    return () => cancelAnimationFrame(frame);
  }, [stageRef, selectedLayerId, issues, revision]);

  const safe = insets(canvas);
  const drawGuides = showGuides && Boolean(canvas.safe);

  return (
    <div
      aria-hidden
      data-export-ignore
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: canvas.w,
        height: canvas.h,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {drawGuides ? (
        <div
          style={{
            position: 'absolute',
            left: safe.left,
            top: safe.top,
            width: Math.max(0, canvas.w - safe.left - safe.right),
            height: Math.max(0, canvas.h - safe.top - safe.bottom),
            border: '2px dashed var(--action)',
            opacity: 0.5,
          }}
        />
      ) : null}

      {issueBoxes.map(({ id, box }) => (
        <div
          key={`issue-${id}`}
          style={{
            position: 'absolute',
            left: box.x,
            top: box.y,
            width: box.w,
            height: box.h,
            border: '2px dashed var(--warn)',
            borderRadius: 2,
          }}
        />
      ))}

      {selection ? (
        <div
          style={{
            position: 'absolute',
            left: selection.x,
            top: selection.y,
            width: selection.w,
            height: selection.h,
            outline: '2px solid var(--action)',
            outlineOffset: 1,
            borderRadius: 2,
          }}
        />
      ) : null}
    </div>
  );
}
