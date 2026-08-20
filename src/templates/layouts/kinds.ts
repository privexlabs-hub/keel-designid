/**
 * Layout identifiers and their options.
 *
 * Split from the components so `types.ts` can reference them without pulling
 * React into the contract layer (the exporter imports the contracts alone).
 */
export type SlotName = 'header' | 'body' | 'footer' | 'left' | 'right' | 'aside' | 'bleed';

export const SLOT_NAMES: SlotName[] = ['bleed', 'header', 'body', 'left', 'right', 'aside', 'footer'];

export type LayoutId =
  | 'stack'
  | 'splitH'
  | 'splitV'
  | 'grid2'
  | 'grid3'
  | 'heroBottomBar'
  | 'centeredHero'
  | 'edgeBand';

export interface LayoutOptions {
  /** Fraction of the long axis given to the first pane, 0..1. */
  ratio?: number;
  /** Gap between panes, in ramp units (multiplied by `t.unit`). */
  gap?: number;
  /** Vertical distribution of the body slot. */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Horizontal alignment of body content. */
  align?: 'start' | 'center' | 'end';
  /** Band thickness for edgeBand / heroBottomBar, in ramp units. */
  band?: number;
  /** Which edge the band sits on. */
  edge?: 'top' | 'bottom' | 'left' | 'right';
  /** Ignore the canvas safe area (full-bleed art that intentionally runs under chrome). */
  ignoreSafe?: boolean;
  /** Override the canvas padding, in design px. */
  pad?: number;
}
