'use client';

/** Text blocks. Sizes default from the canvas ramp; templates may override. */
import { useRamp } from '../ramp-context';
import { LEADING, TRACKING } from '../ramp';
import type { BodyProps, EyebrowProps, HeadlineProps, SubheadProps, TextLayerProps } from './props';
import { SLOT_VAR, TEXT_SLOT_CLASS, TText, cx } from './primitives';

export function Eyebrow({ text, rule, ...rest }: EyebrowProps) {
  const t = useRamp();
  const slot = rest.slot ?? 'accent';
  if (!rule) {
    return (
      <TText
        {...rest}
        slot={slot}
        fallbackSize={t.eyebrow}
        weight={rest.weight ?? 600}
        tracking={rest.tracking ?? TRACKING.eyebrow}
        uppercase={rest.uppercase ?? true}
        leading={rest.leading ?? LEADING.heading}
      >
        {text}
      </TText>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: t.unit * 0.6 }}>
      <span
        aria-hidden
        style={{ width: t.unit * 2, height: 2, background: SLOT_VAR[slot === 'fgMuted' ? 'fgMuted' : 'accent'] }}
      />
      <TText
        {...rest}
        slot={slot}
        fallbackSize={t.eyebrow}
        weight={rest.weight ?? 600}
        tracking={rest.tracking ?? TRACKING.eyebrow}
        uppercase={rest.uppercase ?? true}
        leading={rest.leading ?? LEADING.heading}
      >
        {text}
      </TText>
    </div>
  );
}

export function Headline({ text, ...rest }: HeadlineProps) {
  const t = useRamp();
  return (
    <TText
      {...rest}
      as="p"
      fallbackSize={t.h1}
      font={rest.font ?? 'display'}
      weight={rest.weight ?? 600}
      leading={rest.leading ?? LEADING.display}
      tracking={rest.tracking ?? TRACKING.display}
    >
      {text}
    </TText>
  );
}

export function Subhead({ text, ...rest }: SubheadProps) {
  const t = useRamp();
  return (
    <TText
      {...rest}
      as="p"
      fallbackSize={t.subhead}
      slot={rest.slot ?? 'fgMuted'}
      weight={rest.weight ?? 400}
      leading={rest.leading ?? LEADING.subhead}
    >
      {text}
    </TText>
  );
}

/**
 * Body copy. Newlines in the source become paragraphs — dense multi-paragraph
 * templates rely on this rather than on ten separate layers.
 */
export function Body({ text, ...rest }: BodyProps) {
  const t = useRamp();
  const paras = text.split('\n').filter((p) => p.trim().length > 0);
  if (paras.length <= 1) {
    return (
      <TText {...rest} as="p" fallbackSize={t.body} slot={rest.slot ?? 'fgMuted'} leading={rest.leading ?? LEADING.body}>
        {text}
      </TText>
    );
  }
  return (
    <div
      className={cx(TEXT_SLOT_CLASS[rest.slot ?? 'fgMuted'])}
      style={{ display: 'flex', flexDirection: 'column', gap: t.unit * 0.7, maxWidth: rest.maxWidth }}
    >
      {paras.map((p) => (
        <TText key={p.slice(0, 48)} {...rest} as="p" fallbackSize={t.body} slot={rest.slot ?? 'fgMuted'} leading={rest.leading ?? LEADING.body}>
          {p}
        </TText>
      ))}
    </div>
  );
}

/** The escape hatch: an unstyled run of text at an explicit size. */
export function TextLayer({ text, ...rest }: TextLayerProps) {
  const t = useRamp();
  return (
    <TText {...rest} fallbackSize={t.body}>
      {text}
    </TText>
  );
}
