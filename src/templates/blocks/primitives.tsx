'use client';

/**
 * Shared block internals.
 *
 * Colour comes only from the `t-*` slot utilities so a colorway remap reaches
 * every block. There are no hex literals here and no `--action` / `--surface-*`
 * references; templates that reached for those could not be recoloured.
 */
import type { CSSProperties, ReactNode } from 'react';
import type { FontRole, SlotId } from '@/brand/tokens';
import type { Align, TextSlot, TextStyleProps } from './props';

export const TEXT_SLOT_CLASS: Record<TextSlot, string> = {
  fg: 'text-t-fg',
  fgMuted: 'text-t-fg-muted',
  accent: 'text-t-accent',
  accentFg: 'text-t-accent-fg',
};

export const BG_SLOT_CLASS: Record<Extract<SlotId, 'bg' | 'surface' | 'accent'>, string> = {
  bg: 'bg-t-bg',
  surface: 'bg-t-surface',
  accent: 'bg-t-accent',
};

/** `currentColor` for SVG strokes, resolved through a slot var. */
export const SLOT_VAR: Record<SlotId, string> = {
  bg: 'var(--t-bg)',
  surface: 'var(--t-surface)',
  fg: 'var(--t-fg)',
  fgMuted: 'var(--t-fg-muted)',
  accent: 'var(--t-accent)',
  accentFg: 'var(--t-accent-fg)',
  line: 'var(--t-line)',
};

export const FONT_VAR: Record<FontRole, string> = {
  display: 'var(--font-display)',
  ui: 'var(--font-ui)',
  mono: 'var(--font-mono)',
};

export function cx(...parts: (string | false | undefined | null)[]): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * A per-layer font-size override lands on the wrapper as `--layer-font-size`.
 * Blocks resolve their own size through it so overrides never become a prop
 * blocks have to know about.
 */
export function sizeVar(px: number): string {
  return `var(--layer-font-size, ${px}px)`;
}

export interface TTextProps extends TextStyleProps {
  children: ReactNode;
  /** Resolved size in design px when the template did not pass one. */
  fallbackSize: number;
  as?: 'p' | 'div' | 'span';
  style?: CSSProperties;
  className?: string;
  /** Opt out of the wrapper font-size override (labels beside a big value). */
  fixed?: boolean;
}

export function TText({
  children,
  fallbackSize,
  size,
  slot = 'fg',
  weight = 400,
  font = 'ui',
  align,
  leading = 1.3,
  tracking,
  clamp,
  maxWidth,
  uppercase,
  offsetX,
  offsetY,
  as = 'div',
  style,
  className,
  fixed,
}: TTextProps) {
  const px = size ?? fallbackSize;
  const clampStyle: CSSProperties = clamp
    ? {
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: clamp,
        overflow: 'hidden',
      }
    : {};
  const css: CSSProperties = {
    fontFamily: FONT_VAR[font],
    fontSize: fixed ? px : sizeVar(px),
    fontWeight: weight,
    lineHeight: leading,
    letterSpacing: tracking === undefined ? undefined : `${tracking}em`,
    textAlign: align,
    textTransform: uppercase ? 'uppercase' : undefined,
    maxWidth,
    margin: 0,
    transform: offsetX || offsetY ? `translate(${offsetX ?? 0}px, ${offsetY ?? 0}px)` : undefined,
    ...clampStyle,
    ...style,
  };
  const Tag = as;
  return (
    <Tag className={cx(TEXT_SLOT_CLASS[slot], className)} style={css}>
      {children}
    </Tag>
  );
}

export function alignItems(align: Align | undefined): CSSProperties['alignItems'] {
  if (align === 'center') return 'center';
  if (align === 'right') return 'flex-end';
  return 'flex-start';
}
