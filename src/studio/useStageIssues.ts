'use client';

/**
 * Finds designs that are quietly broken.
 *
 * A template is a fixed-size canvas and the copy in it is yours, so the single
 * most likely way to produce a bad export is to write more words than the box
 * holds. Nothing throws when that happens — the text simply clips, and you
 * find out after you have posted it.
 *
 * The pass is read-only and runs once per settled change: one
 * `querySelectorAll`, then measurements, with no writes interleaved, so it
 * cannot cause layout thrash.
 */
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { insets } from '@/templates/canvases';
import type { CanvasSpec } from '@/templates/types';

export type IssueKind = 'clipped' | 'outside' | 'unsafe';

export interface StageIssue {
  layerId: string;
  kind: IssueKind;
  /** Overshoot in DESIGN px — always the number the user can act on. */
  by: number;
}

export const ISSUE_LABEL: Record<IssueKind, string> = {
  clipped: 'Text is cut off',
  outside: 'Sits outside the canvas',
  unsafe: 'Inside the safe-area margin',
};

const DEBOUNCE_MS = 250;

export function useStageIssues(
  stageRef: RefObject<HTMLDivElement | null>,
  canvas: CanvasSpec,
  deps: readonly unknown[],
  enabled = true,
): StageIssue[] {
  const [issues, setIssues] = useState<StageIssue[]>([]);

  useEffect(() => {
    if (!enabled) return;

    let frame: number | null = null;
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(() => {
        frame = null;
        const stage = stageRef.current;
        if (!stage) return;

        const stageRect = stage.getBoundingClientRect();
        const width = stage.offsetWidth || canvas.w;
        // Screen px per design px. Everything reported must be divided by it.
        const k = width > 0 && stageRect.width > 0 ? stageRect.width / width : 1;
        const toDesign = (px: number) => Math.round(px / k);

        const safe = insets(canvas);
        const hasSafe = Boolean(canvas.safe);

        const found: StageIssue[] = [];

        for (const el of Array.from(stage.querySelectorAll<HTMLElement>('[data-layer]'))) {
          const layerId = el.getAttribute('data-layer');
          if (!layerId) continue;

          // Clipped content: the box is smaller than what it holds.
          const overflowY = el.scrollHeight - el.clientHeight;
          const overflowX = el.scrollWidth - el.clientWidth;
          if (overflowY > 1 || overflowX > 1) {
            found.push({ layerId, kind: 'clipped', by: Math.max(overflowY, overflowX) });
            continue;
          }

          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;

          // Distances are in the same space on both sides, so k cancels in the
          // comparison and is only applied to the reported magnitude.
          const left = r.left - stageRect.left;
          const top = r.top - stageRect.top;
          const right = stageRect.right - r.right;
          const bottom = stageRect.bottom - r.bottom;

          const worstOutside = Math.min(left, top, right, bottom);
          if (worstOutside < -1) {
            found.push({ layerId, kind: 'outside', by: toDesign(-worstOutside) });
            continue;
          }

          if (hasSafe) {
            // A story headline under the platform's own chrome is a warning,
            // not a broken export — reported separately for that reason.
            const intrusion = Math.max(
              safe.left * k - left,
              safe.top * k - top,
              safe.right * k - right,
              safe.bottom * k - bottom,
            );
            if (intrusion > 1) {
              found.push({ layerId, kind: 'unsafe', by: toDesign(intrusion) });
            }
          }
        }

        setIssues((prev) =>
          JSON.stringify(prev) === JSON.stringify(found) ? prev : found,
        );
      });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      if (frame !== null) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageRef, canvas, enabled, ...deps]);

  // While disabled — during an export, or before the template resolves —
  // report nothing rather than clearing state from an effect.
  return enabled ? issues : EMPTY;
}

const EMPTY: StageIssue[] = [];
