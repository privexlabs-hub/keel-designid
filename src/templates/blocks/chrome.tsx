'use client';

/** Identity, navigation and ornament blocks. */
import { Icon } from '@/brand/icons';
import { KeelLockup, KeelMark } from '@/brand/Logo';
import { useRamp } from '../ramp-context';
import { LEADING, TRACKING } from '../ramp';
import type {
  AvatarRowProps,
  BadgeProps,
  FooterBarProps,
  IconGlyphProps,
  LogoLockupProps,
  QuoteProps,
  RuleLineProps,
  SlideIndexProps,
} from './props';
import { SLOT_VAR, TEXT_SLOT_CLASS, TText, alignItems, cx } from './primitives';

/** The inline SVG mark. Never an <img> — export must not hit the network. */
export function LogoLockupBlock({ variant = 'horizontal', size, subtitle, slot = 'fg', align }: LogoLockupProps) {
  const t = useRamp();
  return (
    <div style={{ display: 'flex', justifyContent: alignItems(align) }}>
      <KeelLockup
        variant={variant}
        size={size ?? t.unit * 2}
        subtitle={subtitle === undefined ? 'Management system' : subtitle}
        className={TEXT_SLOT_CLASS[slot]}
      />
    </div>
  );
}

export function FooterBar({ left, right, size, showMark = true, markSize, rule = true, slot = 'fgMuted' }: FooterBarProps) {
  const t = useRamp();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.unit * 0.7, width: '100%' }}>
      {rule ? <span aria-hidden style={{ height: 1, width: '100%', background: SLOT_VAR.line }} /> : null}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.unit }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: t.unit * 0.6 }}>
          {showMark ? (
            <span className="text-t-accent" style={{ display: 'inline-flex' }}>
              <KeelMark size={markSize ?? t.unit * 1.4} />
            </span>
          ) : null}
          {left ? (
            <TText slot={slot} fallbackSize={size ?? t.small} weight={500} leading={LEADING.subhead}>
              {left}
            </TText>
          ) : null}
        </div>
        {right ? (
          <TText fixed slot={slot} fallbackSize={size ?? t.small} leading={LEADING.subhead}>
            {right}
          </TText>
        ) : null}
      </div>
    </div>
  );
}

export function Badge({ text, size, icon, tone = 'accent', uppercase = true }: BadgeProps) {
  const t = useRamp();
  const px = size ?? t.small;
  const isAccent = tone === 'accent';
  return (
    <span
      className={cx(
        isAccent && 'bg-t-accent text-t-accent-fg',
        tone === 'surface' && 'bg-t-surface text-t-fg border border-t-line',
        tone === 'outline' && 'text-t-fg border border-t-line',
      )}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: px * 0.45,
        padding: `${px * 0.42}px ${px * 0.8}px`,
        borderRadius: 999,
        fontFamily: 'var(--font-ui)',
        fontSize: px,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: `${TRACKING.caps}em`,
        textTransform: uppercase ? 'uppercase' : 'none',
      }}
    >
      {icon ? <Icon name={icon} size={px * 1.05} /> : null}
      {text}
    </span>
  );
}

export function IconGlyph({ name, size, stroke = 1.75, slot = 'accent', boxed, boxPad, radius }: IconGlyphProps) {
  const t = useRamp();
  const px = size ?? t.h3;
  if (!boxed) {
    return (
      <span className={TEXT_SLOT_CLASS[slot]} style={{ display: 'inline-flex' }}>
        <Icon name={name} size={px} stroke={stroke} />
      </span>
    );
  }
  return (
    <span
      className="bg-t-accent text-t-accent-fg"
      style={{
        display: 'inline-flex',
        padding: boxPad ?? px * 0.42,
        borderRadius: radius ?? px * 0.34,
        lineHeight: 0,
      }}
    >
      <Icon name={name} size={px} stroke={stroke} />
    </span>
  );
}

export function RuleLine({ thickness = 2, width = '100%', slot = 'line', marginTop, marginBottom }: RuleLineProps) {
  return (
    <span
      aria-hidden
      style={{
        display: 'block',
        height: thickness,
        width: typeof width === 'number' ? `${width}px` : width,
        background: SLOT_VAR[slot],
        marginTop,
        marginBottom,
        borderRadius: thickness,
      }}
    />
  );
}

export function SlideIndex({ index, total, size, style = 'both' }: SlideIndexProps) {
  const t = useRamp();
  const px = size ?? t.small;
  const dotSize = px * 0.5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: px * 0.7 }}>
      {style !== 'numeric' ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: dotSize * 0.7 }}>
          {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={n === index ? 'bg-t-accent' : 'bg-t-fg-muted'}
              style={{ width: dotSize, height: dotSize, borderRadius: 999 }}
            />
          ))}
        </span>
      ) : null}
      {style !== 'dots' ? (
        <TText fixed slot="fgMuted" font="mono" fallbackSize={px} leading={1}>
          {`${index} / ${total}`}
        </TText>
      ) : null}
    </div>
  );
}

export function Quote({ text, attribution, role, size, attrSize, rule = true, maxWidth }: QuoteProps) {
  const t = useRamp();
  return (
    <div style={{ display: 'flex', gap: t.unit, maxWidth }}>
      {rule ? <span aria-hidden style={{ width: 3, alignSelf: 'stretch', background: SLOT_VAR.accent, borderRadius: 3 }} /> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: t.unit * 0.8 }}>
        <TText as="p" slot="fg" font="display" weight={400} fallbackSize={size ?? t.quote} leading={LEADING.heading}>
          {text}
        </TText>
        {attribution ? (
          <TText fixed slot="fgMuted" fallbackSize={attrSize ?? t.small} weight={500} leading={LEADING.subhead}>
            {role ? `${attribution} · ${role}` : attribution}
          </TText>
        ) : null}
      </div>
    </div>
  );
}

export function AvatarRow({ items, size, labelSize, more, caption }: AvatarRowProps) {
  const t = useRamp();
  const px = size ?? t.unit * 2.4;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.unit * 0.8 }}>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {items.map((item, i) => (
          <span
            key={item.key}
            className="bg-t-surface text-t-fg border border-t-line"
            style={{
              width: px,
              height: px,
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: i === 0 ? 0 : -px * 0.28,
              fontFamily: 'var(--font-ui)',
              fontSize: px * 0.36,
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {item.initials}
          </span>
        ))}
        {more ? (
          <span
            className="bg-t-accent text-t-accent-fg"
            style={{
              width: px,
              height: px,
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: -px * 0.28,
              fontFamily: 'var(--font-ui)',
              fontSize: px * 0.34,
              fontWeight: 600,
            }}
          >
            {`+${more}`}
          </span>
        ) : null}
      </span>
      {caption ? (
        <TText fixed slot="fgMuted" fallbackSize={labelSize ?? t.small} leading={LEADING.subhead}>
          {caption}
        </TText>
      ) : null}
    </div>
  );
}
