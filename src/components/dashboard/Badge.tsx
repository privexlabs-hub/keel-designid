/**
 * The pill badge from the source's `badge()` — a tone dot plus a label, on a
 * weak tinted ground with a matching hairline.
 */
import { toneSpec } from '@/lib/dashboard/tone';
import type { BadgeSpec } from '@/lib/dashboard/tone';

export function Badge({ spec }: { spec: BadgeSpec }) {
  const t = toneSpec(spec.tone);
  return (
    <span
      className="inline-flex items-center whitespace-nowrap font-ui"
      style={{
        gap: 6,
        fontSize: 11.5,
        fontWeight: 600,
        lineHeight: 1,
        padding: '4px 9px',
        borderRadius: 999,
        color: t.c,
        background: t.b,
        border: `1px solid ${t.d}`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.c, flex: 'none' }} />
      <span>{spec.label}</span>
    </span>
  );
}

/** The haloed status dot from `dot()`. */
export function ToneDot({ tone }: { tone: BadgeSpec['tone'] }) {
  const t = toneSpec(tone);
  return (
    <span
      style={{
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: t.c,
        flex: 'none',
        boxShadow: `0 0 0 3px ${t.b}`,
      }}
    />
  );
}
