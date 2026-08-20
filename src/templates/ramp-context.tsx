'use client';

/**
 * The active canvas ramp, published to blocks.
 *
 * Blocks are canvas-agnostic: they never branch on canvas id. They read
 * `useRamp().h1` (etc.) purely as a default when a template did not pass an
 * explicit size, which is what keeps one block correct on a 191px LinkedIn
 * cover and on a 3000px podcast tile without a variant for either.
 */
import { createContext, useContext } from 'react';
import { BASE_RAMP } from './ramp';
import type { CanvasSpec, ComposeCtx, TypeRamp } from './types';
import { CANVASES } from './canvases';

export interface StageContextValue {
  t: TypeRamp;
  canvas: CanvasSpec;
  slide?: number;
}

const FALLBACK: StageContextValue = { t: BASE_RAMP, canvas: CANVASES.square1080 };

const StageContext = createContext<StageContextValue>(FALLBACK);

export const StageContextProvider = StageContext.Provider;

export function useStageContext(): StageContextValue {
  return useContext(StageContext);
}

/** The scaled type ramp for the canvas currently being rendered. */
export function useRamp(): TypeRamp {
  return useContext(StageContext).t;
}

export function stageContextFromCompose(ctx: ComposeCtx): StageContextValue {
  return { t: ctx.t, canvas: ctx.canvas, slide: ctx.slide };
}
