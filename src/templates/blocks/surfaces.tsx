'use client';

/** Container and list blocks. */
import { Icon } from '@/brand/icons';
import { useRamp } from '../ramp-context';
import { LEADING } from '../ramp';
import type { ChecklistProps, SplitPanelProps } from './props';
import { SLOT_VAR, TText, cx } from './primitives';

/**
 * A panel that can carry an image fill and fade into the stage ground.
 *
 * The scrim is a `linear-gradient` to the `transparent` keyword rather than an
 * opacity modifier or a `backdrop-filter`: opacity modifiers compile to
 * `color-mix()`, which DOM-snapshot export mangles, and `backdrop-filter` does
 * not survive rasterisation at all.
 */
export function SplitPanel({
  image,
  scrim,
  scrimFrom = 'bottom',
  surface,
  radius,
  pad,
  minHeight,
  fill = true,
  shadow,
  border,
  children,
}: SplitPanelProps) {
  const t = useRamp();
  const scrimCss =
    scrimFrom === 'bottom'
      ? `linear-gradient(to top, ${SLOT_VAR.bg} 0%, transparent 62%)`
      : `linear-gradient(to bottom, ${SLOT_VAR.bg} 0%, transparent 62%)`;
  return (
    <div
      className={cx(surface && 'bg-t-surface', border && 'border border-t-line')}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: radius,
        minHeight,
        height: fill ? '100%' : undefined,
        width: '100%',
        boxShadow: shadow ? 'var(--shadow-lg)' : undefined,
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: image ? 'cover' : undefined,
        backgroundPosition: image ? 'center' : undefined,
        backgroundRepeat: 'no-repeat',
      }}
    >
      {scrim ? <span aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: scrimCss }} /> : null}
      <div
        style={{
          position: 'relative',
          padding: pad ?? t.unit * 1.5,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: t.unit,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A checked list. The tick is the `clipCheck` icon, never the character U+2713 —
 * the bundled font subsets have no glyph for it and it would silently fall back
 * to a system font in every export.
 */
export function Checklist({ items, size, icon = 'clipCheck', iconSize, gap, slot = 'fg', leading }: ChecklistProps) {
  const t = useRamp();
  const px = size ?? t.body;
  const gl = iconSize ?? px * 1.05;
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: gap ?? t.unit * 0.7 }}>
      {items.map((item) => (
        <li key={item.key} style={{ display: 'flex', gap: t.unit * 0.6, alignItems: 'flex-start' }}>
          <span className="text-t-accent" style={{ display: 'inline-flex', paddingTop: px * 0.2, flex: '0 0 auto' }}>
            <Icon name={icon} size={gl} />
          </span>
          <TText slot={slot} fallbackSize={px} leading={leading ?? LEADING.body}>
            {item.text}
          </TText>
        </li>
      ))}
    </ul>
  );
}
