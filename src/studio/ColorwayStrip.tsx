'use client';

/**
 * Colourway switching, kept next to the artboard.
 *
 * Colourway is the variant control people reach for most, so it belongs beside
 * the thing it changes rather than behind a tab. The Style tab keeps its larger
 * cards: that surface explains the colourways, this one switches them.
 *
 * Chips are `aria-pressed` buttons, deliberately not `role="tab"` — the export
 * verification drives the real UI by matching tab text, and a second set of
 * tabs here would confuse it.
 */
import Link from 'next/link';
import { COLORWAYS, type ColorwayId } from '@/brand/tokens';
import { useDoc } from './store';

export interface ColorwayStripProps {
  colorways: ColorwayId[];
}

export function ColorwayStrip({ colorways }: ColorwayStripProps) {
  const active = useDoc((s) => s.colorway);
  const setColorway = useDoc((s) => s.setColorway);

  if (colorways.length < 2) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only" id="colorway-strip-label">
        Colourway
      </span>
      {/* A scroller, so a template offering six colourways cannot widen the
          page on a 320px screen. */}
      <div
        className="flex gap-1.5 overflow-x-auto"
        role="group"
        aria-labelledby="colorway-strip-label"
      >
        {colorways.map((id) => {
          const cw = COLORWAYS[id];
          const on = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setColorway(id)}
              aria-pressed={on}
              title={cw.label}
              className="shrink-0 rounded-md border"
              style={{
                width: 28,
                height: 28,
                borderColor: on ? 'var(--action)' : 'var(--border)',
                borderWidth: on ? 2 : 1,
                // Three stops of the colourway itself, so the chip previews the
                // ground, the text and the accent it will apply.
                backgroundImage: `linear-gradient(135deg, ${cw.slots.bg} 0 45%, ${cw.slots.fg} 45% 70%, ${cw.slots.accent} 70% 100%)`,
              }}
            >
              <span className="sr-only">{cw.label}</span>
            </button>
          );
        })}
      </div>

      <Link
        href="/playbook/colour/"
        className="shrink-0 text-fg-3 no-underline"
        style={{ fontSize: 10.5 }}
        title="How the colourways are built"
      >
        Why
      </Link>
    </div>
  );
}
