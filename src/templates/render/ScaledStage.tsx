'use client';

/**
 * A fixed-size stage shown smaller than life.
 *
 * The scale lives on a WRAPPER, never on the stage node. The stage must stay at
 * exact design pixels: the exporter reads `data-stage` and rasterises it at
 * 1:1, and a transform on that node would bake the preview scale into the file.
 *
 * CSS transforms are layout-free — a scaled child still reserves its unscaled
 * box — so the outer box explicitly reserves `h * k`, otherwise every preview
 * in a grid would leave a tall gap beneath it.
 *
 * !! `getBoundingClientRect()` on ANY node inside this subtree returns SCALED
 * !! pixels. Drag deltas, hit-testing and measured geometry must be divided by
 * !! `k` (see `useStageScale`) before they are stored as design px.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface StageScale {
  /** Preview scale factor, 0 < k <= 1. Design px * k = screen px. */
  k: number;
  /** Design-pixel width of the stage. */
  w: number;
  /** Design-pixel height of the stage. */
  h: number;
  /** Convert a screen-space delta to design px. */
  toDesign(px: number): number;
  /** Convert design px to screen space. */
  toScreen(px: number): number;
}

const DEFAULT: StageScale = { k: 1, w: 0, h: 0, toDesign: (p) => p, toScreen: (p) => p };

const ScaleContext = createContext<StageScale>(DEFAULT);

/** Later phases divide pointer deltas and measured rects by this. */
export function useStageScale(): StageScale {
  return useContext(ScaleContext);
}

export interface ScaledStageProps {
  /** Design width of the stage in px. */
  w: number;
  /** Design height of the stage in px. */
  h: number;
  children: ReactNode;
  /**
   * Cap the scale. Defaults to 1 — previews shrink but never blow up, because
   * an upscaled stage shows font hinting the export will not have.
   */
  maxScale?: number;
  /** Fixed width instead of measuring the parent. */
  width?: number;
  className?: string;
}

export function ScaledStage({ w, h, children, maxScale = 1, width, className }: ScaledStageProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState<number | null>(null);

  // A caller-supplied width is derived during render — no effect, no second
  // pass. Only the auto-measuring case needs to observe the DOM.
  const k =
    width !== undefined
      ? Math.min(maxScale, width / w)
      : measured !== null
        ? Math.min(maxScale, measured / w)
        : maxScale;

  const record = useCallback((available: number) => {
    if (available <= 0) return;
    setMeasured((prev) => (prev !== null && Math.abs(prev - available) < 0.5 ? prev : available));
  }, []);

  // A callback ref runs at commit, so the first measurement lands before paint
  // without a layout effect — which is what keeps a grid of previews from
  // flashing at full size on mount.
  const attach = useCallback(
    (el: HTMLDivElement | null) => {
      boxRef.current = el;
      if (el && width === undefined) record(el.clientWidth);
    },
    [record, width],
  );

  useEffect(() => {
    if (width !== undefined) return;
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) record(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [record, width]);

  const value: StageScale = {
    k,
    w,
    h,
    toDesign: (px: number) => px / k,
    toScreen: (px: number) => px * k,
  };

  return (
    <div
      ref={attach}
      className={className}
      style={{
        width: width ?? '100%',
        // Transforms do not affect layout, so the reserved height is explicit.
        height: h * k,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          transform: `scale(${k})`,
          transformOrigin: 'top left',
        }}
      >
        <ScaleContext.Provider value={value}>{children}</ScaleContext.Provider>
      </div>
    </div>
  );
}
