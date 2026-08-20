/**
 * The block registry.
 *
 * Blocks are grouped by family into four modules rather than twenty files —
 * they share the same primitives and are edited together. What matters for the
 * engine is this map: `LayerNode.block` is a key of it, and `BLOCKS[id]` is the
 * only way the renderer resolves a component.
 *
 * Every block is presentational and canvas-agnostic. None of them read the
 * canvas id, none apply layout padding, and none see layer overrides.
 */
import type { ComponentType } from 'react';
import type { BlockPropsMap } from './props';
import { Body, Eyebrow, Headline, Subhead, TextLayer } from './text';
import { ComparisonTable, KpiTile, ProgressBar, StatBig, StatRow } from './data';
import {
  AvatarRow,
  Badge,
  FooterBar,
  IconGlyph,
  LogoLockupBlock,
  Quote,
  RuleLine,
  SlideIndex,
} from './chrome';
import { Checklist, SplitPanel } from './surfaces';

export type BlockId = keyof BlockPropsMap;

export type BlockComponents = { [K in BlockId]: ComponentType<BlockPropsMap[K]> };

export const BLOCKS: BlockComponents = {
  eyebrow: Eyebrow,
  headline: Headline,
  subhead: Subhead,
  body: Body,
  textLayer: TextLayer,
  statBig: StatBig,
  statRow: StatRow,
  quote: Quote,
  avatarRow: AvatarRow,
  logoLockup: LogoLockupBlock,
  footerBar: FooterBar,
  splitPanel: SplitPanel,
  checklist: Checklist,
  comparisonTable: ComparisonTable,
  progressBar: ProgressBar,
  slideIndex: SlideIndex,
  badge: Badge,
  kpiTile: KpiTile,
  iconGlyph: IconGlyph,
  ruleLine: RuleLine,
};

export const BLOCK_IDS = Object.keys(BLOCKS) as BlockId[];

/** True when the block renders `LayerNode.children` inside itself. */
export const CONTAINER_BLOCKS: ReadonlySet<BlockId> = new Set<BlockId>(['splitPanel']);

export * from './props';
