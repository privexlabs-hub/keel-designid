'use client';

/**
 * Click a layer on the artboard to select it; drag it to nudge it.
 *
 * Two coordinate systems meet here. The stage is laid out at exact design
 * pixels but displayed through a `transform: scale(k)` wrapper, so every
 * measurement and every pointer delta arrives in SCREEN pixels and has to be
 * divided by `k` before it becomes a design-pixel offset. Getting that wrong
 * is invisible on a desktop at k≈0.6 and obvious on a phone at k≈0.3.
 *
 * The handlers are spread onto a wrapper around `ScaledStage`, never onto the
 * stage node itself — the exporter rasterises that node, and it must stay a
 * plain, untransformed, un-instrumented box.
 */
import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import type { RefObject } from 'react';
import { beginGesture, endGesture, useDoc, useUI } from './store';

export interface LayerInteractionHandlers {
  onPointerDown(e: ReactPointerEvent<HTMLDivElement>): void;
  onPointerMove(e: ReactPointerEvent<HTMLDivElement>): void;
  onPointerUp(e: ReactPointerEvent<HTMLDivElement>): void;
  onPointerCancel(e: ReactPointerEvent<HTMLDivElement>): void;
  onDoubleClick(e: ReactPointerEvent<HTMLDivElement>): void;
}

interface DragState {
  layerId: string;
  startX: number;
  startY: number;
  baseDx: number;
  baseDy: number;
  scale: number;
  moved: boolean;
  frame: number | null;
}

/** Below this many screen px a pointer movement is a click, not a drag. */
const DRAG_THRESHOLD = 3;

export function useLayerInteraction(
  stageRef: RefObject<HTMLDivElement | null>,
  lockedIds: ReadonlySet<string>,
): LayerInteractionHandlers {
  const drag = useRef<DragState | null>(null);

  /** Screen px per design px, measured from the stage's own box. */
  const scaleOf = useCallback((): number => {
    const stage = stageRef.current;
    if (!stage) return 1;
    const rect = stage.getBoundingClientRect();
    const w = stage.offsetWidth || rect.width;
    return w > 0 && rect.width > 0 ? rect.width / w : 1;
  }, [stageRef]);

  const layerIdAt = useCallback((target: EventTarget | null): string | null => {
    if (!(target instanceof Element)) return null;
    const el = target.closest('[data-layer]');
    return el?.getAttribute('data-layer') ?? null;
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      // Let the free-text overlay and any real control keep their own clicks.
      if (e.button !== 0) return;

      const layerId = layerIdAt(e.target);
      useUI.getState().select(layerId);
      if (!layerId || lockedIds.has(layerId)) return;

      const existing = useDoc.getState().overrides[layerId];
      drag.current = {
        layerId,
        startX: e.clientX,
        startY: e.clientY,
        baseDx: existing?.dx ?? 0,
        baseDy: existing?.dy ?? 0,
        scale: scaleOf(),
        moved: false,
        frame: null,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [layerIdAt, lockedIds, scaleOf],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;

    let dxScreen = e.clientX - d.startX;
    let dyScreen = e.clientY - d.startY;

    if (!d.moved) {
      if (Math.abs(dxScreen) < DRAG_THRESHOLD && Math.abs(dyScreen) < DRAG_THRESHOLD) return;
      d.moved = true;
      // Only now is this a drag rather than a click, so only now does it need
      // to become an undo entry.
      beginGesture();
    }

    // Shift locks to the dominant axis — the usual way to keep an aligned
    // element aligned while nudging it.
    if (e.shiftKey) {
      if (Math.abs(dxScreen) > Math.abs(dyScreen)) dyScreen = 0;
      else dxScreen = 0;
    }

    const dx = Math.round(d.baseDx + dxScreen / d.scale);
    const dy = Math.round(d.baseDy + dyScreen / d.scale);

    // Coalesce to one store write per frame; a raw pointermove stream would
    // recompose the template far more often than the screen refreshes.
    if (d.frame !== null) cancelAnimationFrame(d.frame);
    d.frame = requestAnimationFrame(() => {
      d.frame = null;
      useDoc.getState().patchOverride(d.layerId, { dx, dy });
    });
  }, []);

  const finish = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.frame !== null) cancelAnimationFrame(d.frame);
    if (d.moved) endGesture();
  }, []);

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      finish();
    },
    [finish],
  );

  const onPointerCancel = useCallback(() => finish(), [finish]);

  const onDoubleClick = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      // A single click selects without moving the user's context; a deliberate
      // double click is a request to go and adjust the thing.
      if (layerIdAt(e.target)) useUI.getState().setTab('layers');
    },
    [layerIdAt],
  );

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onDoubleClick };
}
