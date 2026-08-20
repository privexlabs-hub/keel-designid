'use client';

/** Numeric / tabular blocks. */
import { Icon } from '@/brand/icons';
import { useRamp } from '../ramp-context';
import { LEADING, TRACKING } from '../ramp';
import type {
  ComparisonTableProps,
  KpiTileProps,
  ProgressBarProps,
  StatBigProps,
  StatRowProps,
} from './props';
import { SLOT_VAR, TText, alignItems, cx } from './primitives';

export function StatBig({
  value,
  label,
  unit,
  size,
  labelSize,
  slot = 'fg',
  align = 'left',
  card,
  shadow,
  pad,
  radius,
}: StatBigProps) {
  const t = useRamp();
  const boxPad = pad ?? t.unit * 2;
  return (
    <div
      className={cx(card && 'bg-t-surface', card && 'border', card && 'border-t-line')}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: alignItems(align),
        gap: t.unit * 0.4,
        padding: card ? boxPad : undefined,
        borderRadius: card ? (radius ?? t.unit) : undefined,
        boxShadow: shadow ? 'var(--shadow-lg)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: t.unit * 0.4 }}>
        <TText
          slot={slot}
          font="display"
          weight={600}
          fallbackSize={size ?? t.stat}
          leading={LEADING.tight}
          tracking={TRACKING.display}
        >
          {value}
        </TText>
        {unit ? (
          <TText fixed slot="fgMuted" font="ui" weight={500} fallbackSize={(size ?? t.stat) * 0.28} leading={LEADING.tight}>
            {unit}
          </TText>
        ) : null}
      </div>
      {label ? (
        <TText fixed slot="fgMuted" fallbackSize={labelSize ?? t.subhead} leading={LEADING.subhead} align={align}>
          {label}
        </TText>
      ) : null}
    </div>
  );
}

export function StatRow({ items, size, labelSize, gap, dividers }: StatRowProps) {
  const t = useRamp();
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: gap ?? t.unit * 2 }}>
      {items.map((item, i) => (
        <div
          key={item.key}
          className={cx(dividers && i > 0 && 'border-t-line')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: t.unit * 0.25,
            paddingLeft: dividers && i > 0 ? (gap ?? t.unit * 2) : undefined,
            borderLeftWidth: dividers && i > 0 ? 1 : undefined,
            borderLeftStyle: dividers && i > 0 ? 'solid' : undefined,
          }}
        >
          <TText slot="fg" font="display" weight={600} fallbackSize={size ?? t.statSmall} leading={LEADING.tight}>
            {item.value}
          </TText>
          <TText fixed slot="fgMuted" fallbackSize={labelSize ?? t.small} leading={LEADING.subhead}>
            {item.label}
          </TText>
        </div>
      ))}
    </div>
  );
}

export function KpiTile({ value, label, caption, icon, size, labelSize, surface = true, pad, radius }: KpiTileProps) {
  const t = useRamp();
  return (
    <div
      className={cx(surface && 'bg-t-surface', 'border', 'border-t-line')}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: t.unit * 0.35,
        padding: pad ?? t.unit * 1.2,
        borderRadius: radius ?? t.unit * 0.7,
      }}
    >
      {icon ? (
        <span className="text-t-accent" style={{ display: 'inline-flex' }}>
          <Icon name={icon} size={(size ?? t.statSmall) * 0.34} stroke={1.75} />
        </span>
      ) : null}
      <TText slot="fg" font="display" weight={600} fallbackSize={size ?? t.statSmall} leading={LEADING.tight}>
        {value}
      </TText>
      <TText fixed slot="fgMuted" fallbackSize={labelSize ?? t.small} leading={LEADING.subhead}>
        {label}
      </TText>
      {caption ? (
        <TText fixed slot="fgMuted" fallbackSize={(labelSize ?? t.small) * 0.85} leading={LEADING.subhead}>
          {caption}
        </TText>
      ) : null}
    </div>
  );
}

export function ProgressBar({ value, label, caption, height, size, showValue = true }: ProgressBarProps) {
  const t = useRamp();
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const barH = height ?? t.unit * 0.7;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.unit * 0.5, width: '100%' }}>
      {label || showValue ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: t.unit }}>
          {label ? (
            <TText slot="fg" weight={600} fallbackSize={size ?? t.body} leading={LEADING.subhead}>
              {label}
            </TText>
          ) : (
            <span />
          )}
          {showValue ? (
            <TText fixed slot="accent" font="mono" weight={500} fallbackSize={size ?? t.body} leading={LEADING.subhead}>
              {`${pct}%`}
            </TText>
          ) : null}
        </div>
      ) : null}
      <div
        className="bg-t-surface border border-t-line"
        style={{ height: barH, borderRadius: barH, overflow: 'hidden', width: '100%' }}
      >
        <div className="bg-t-accent" style={{ width: `${pct}%`, height: '100%', borderRadius: barH }} />
      </div>
      {caption ? (
        <TText fixed slot="fgMuted" fallbackSize={t.small} leading={LEADING.subhead}>
          {caption}
        </TText>
      ) : null}
    </div>
  );
}

export function ComparisonTable({ columns, rows, size, headSize, leftIcon, rightIcon }: ComparisonTableProps) {
  const t = useRamp();
  const cell = size ?? t.body;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div
        className="border-t-line"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: t.unit,
          paddingBottom: t.unit * 0.6,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
        }}
      >
        {columns.map((c, i) => (
          <TText
            key={c}
            fixed
            slot={i === 0 ? 'fgMuted' : 'accent'}
            weight={600}
            uppercase
            tracking={TRACKING.caps}
            fallbackSize={headSize ?? t.small}
            leading={LEADING.subhead}
          >
            {c}
          </TText>
        ))}
      </div>
      {rows.map((row) => (
        <div
          key={row.key}
          className="border-t-line"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: t.unit,
            paddingTop: t.unit * 0.6,
            paddingBottom: t.unit * 0.6,
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
          }}
        >
          <div style={{ display: 'flex', gap: t.unit * 0.4, alignItems: 'flex-start' }}>
            {leftIcon ? (
              <span className="text-t-fg-muted" style={{ display: 'inline-flex', paddingTop: cell * 0.18 }}>
                <Icon name={leftIcon} size={cell * 0.9} />
              </span>
            ) : null}
            <TText slot="fgMuted" fallbackSize={cell} leading={LEADING.body}>
              {row.left}
            </TText>
          </div>
          <div style={{ display: 'flex', gap: t.unit * 0.4, alignItems: 'flex-start' }}>
            {rightIcon ? (
              <span style={{ display: 'inline-flex', paddingTop: cell * 0.18, color: SLOT_VAR.accent }}>
                <Icon name={rightIcon} size={cell * 0.9} />
              </span>
            ) : null}
            <TText slot="fg" weight={500} fallbackSize={cell} leading={LEADING.body}>
              {row.right}
            </TText>
          </div>
        </div>
      ))}
    </div>
  );
}
