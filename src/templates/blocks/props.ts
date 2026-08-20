/**
 * Block prop contracts.
 *
 * Types only, no React — `types.ts` imports `BlockPropsMap` to correlate
 * `LayerNode.block` with `LayerNode.props`, and the exporter reads these
 * without loading the component layer.
 *
 * Every prop here is serialisable except `SplitPanelProps.children`, which the
 * renderer injects from `LayerNode.children` and which templates never set.
 */
import type { ReactNode } from 'react';
import type { IconName } from '@/brand/icons';
import type { FontRole, SlotId } from '@/brand/tokens';

export type Align = 'left' | 'center' | 'right';
/** Which colorway slot paints the text. Never a hex, never --action. */
export type TextSlot = Extract<SlotId, 'fg' | 'fgMuted' | 'accent' | 'accentFg'>;

/** Shared by every text-bearing block. All sizes are design px. */
export interface TextStyleProps {
  size?: number;
  slot?: TextSlot;
  weight?: number;
  font?: FontRole;
  align?: Align;
  /** Line-height ratio. */
  leading?: number;
  /** Letter-spacing in em. */
  tracking?: number;
  /** Max lines before the text is clipped with an ellipsis. */
  clamp?: number;
  /** Max measure in design px. */
  maxWidth?: number;
  uppercase?: boolean;
  /** Translation in design px. Backdrop layers use it to crop against an edge. */
  offsetX?: number;
  offsetY?: number;
}

export interface EyebrowProps extends TextStyleProps {
  text: string;
  /** A short rule drawn before the text. */
  rule?: boolean;
}
export interface HeadlineProps extends TextStyleProps {
  text: string;
}
export interface SubheadProps extends TextStyleProps {
  text: string;
}
export interface BodyProps extends TextStyleProps {
  text: string;
}
export interface TextLayerProps extends TextStyleProps {
  text: string;
}

export interface StatBigProps {
  value: string;
  label?: string;
  /** Small suffix set beside the value, e.g. a percent sign or "days". */
  unit?: string;
  size?: number;
  labelSize?: number;
  slot?: TextSlot;
  align?: Align;
  /** Paint the surface slot behind the stat and drop a shadow under it. */
  card?: boolean;
  shadow?: boolean;
  pad?: number;
  radius?: number;
}

export interface StatRowItem {
  key: string;
  value: string;
  label: string;
}
export interface StatRowProps {
  items: StatRowItem[];
  size?: number;
  labelSize?: number;
  gap?: number;
  /** Draw a hairline between items. */
  dividers?: boolean;
}

export interface QuoteProps {
  text: string;
  attribution?: string;
  role?: string;
  size?: number;
  attrSize?: number;
  /** Draw an accent rule down the left edge. */
  rule?: boolean;
  maxWidth?: number;
}

export interface AvatarRowItem {
  key: string;
  initials: string;
  name?: string;
}
export interface AvatarRowProps {
  items: AvatarRowItem[];
  size?: number;
  labelSize?: number;
  /** Trailing "+N" chip. */
  more?: number;
  caption?: string;
}

export interface LogoLockupProps {
  variant?: 'horizontal' | 'stacked' | 'mark';
  size?: number;
  subtitle?: string | null;
  slot?: TextSlot;
  align?: Align;
}

export interface FooterBarProps {
  left?: string;
  right?: string;
  size?: number;
  showMark?: boolean;
  markSize?: number;
  rule?: boolean;
  slot?: TextSlot;
}

export interface SplitPanelProps {
  /** Public path to a fill image. Rendered as a cover background. */
  image?: string;
  /** Fade the panel into the stage background with a transparent gradient. */
  scrim?: boolean;
  scrimFrom?: 'top' | 'bottom';
  /** Paint the surface slot behind the panel. */
  surface?: boolean;
  radius?: number;
  pad?: number;
  minHeight?: number;
  /** Grow to fill the slot. */
  fill?: boolean;
  shadow?: boolean;
  border?: boolean;
  /** Injected by the renderer from LayerNode.children. Never authored. */
  children?: ReactNode;
}

export interface ChecklistItem {
  key: string;
  text: string;
}
export interface ChecklistProps {
  items: ChecklistItem[];
  size?: number;
  icon?: IconName;
  iconSize?: number;
  gap?: number;
  slot?: TextSlot;
  leading?: number;
}

export interface ComparisonRow {
  key: string;
  left: string;
  right: string;
}
export interface ComparisonTableProps {
  columns: [string, string];
  rows: ComparisonRow[];
  size?: number;
  headSize?: number;
  /** Icon set in the right column ahead of the text. */
  rightIcon?: IconName;
  leftIcon?: IconName;
}

export interface ProgressBarProps {
  /** 0..1. Clamped by the block. */
  value: number;
  label?: string;
  caption?: string;
  height?: number;
  size?: number;
  /** Show the value as a percentage beside the label. */
  showValue?: boolean;
}

export interface SlideIndexProps {
  index: number;
  total: number;
  size?: number;
  style?: 'dots' | 'numeric' | 'both';
}

export interface BadgeProps {
  text: string;
  size?: number;
  icon?: IconName;
  tone?: 'accent' | 'outline' | 'surface';
  uppercase?: boolean;
}

export interface KpiTileProps {
  value: string;
  label: string;
  caption?: string;
  icon?: IconName;
  size?: number;
  labelSize?: number;
  surface?: boolean;
  pad?: number;
  radius?: number;
}

export interface IconGlyphProps {
  name: IconName;
  size?: number;
  stroke?: number;
  slot?: TextSlot;
  /** Draw the icon inside a rounded accent tile. */
  boxed?: boolean;
  boxPad?: number;
  radius?: number;
}

export interface RuleLineProps {
  thickness?: number;
  /** Design px, or a percentage string like '40%'. */
  width?: number | string;
  slot?: Extract<SlotId, 'line' | 'accent' | 'fg' | 'fgMuted'>;
  marginTop?: number;
  marginBottom?: number;
}

export interface BlockPropsMap {
  eyebrow: EyebrowProps;
  headline: HeadlineProps;
  subhead: SubheadProps;
  body: BodyProps;
  textLayer: TextLayerProps;
  statBig: StatBigProps;
  statRow: StatRowProps;
  quote: QuoteProps;
  avatarRow: AvatarRowProps;
  logoLockup: LogoLockupProps;
  footerBar: FooterBarProps;
  splitPanel: SplitPanelProps;
  checklist: ChecklistProps;
  comparisonTable: ComparisonTableProps;
  progressBar: ProgressBarProps;
  slideIndex: SlideIndexProps;
  badge: BadgeProps;
  kpiTile: KpiTileProps;
  iconGlyph: IconGlyphProps;
  ruleLine: RuleLineProps;
}
