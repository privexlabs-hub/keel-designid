'use client';

/**
 * The three-way lens switch. A radiogroup, not three toggle buttons, because
 * exactly one is always chosen.
 */
import { Icon } from '@/brand/icons';
import { LENSES, LENS_LABEL } from '@/lib/dashboard/lens';
import { useDashboard } from './DashboardContext';

export function LensToggle() {
  const { lens, setLens } = useDashboard();
  return (
    <div className="flex flex-col items-end" style={{ gap: 4 }}>
      <span
        id="lens-label"
        className="uppercase text-fg-3"
        style={{ fontSize: 9, letterSpacing: '0.11em' }}
      >
        Lens
      </span>
      <div
        role="radiogroup"
        aria-labelledby="lens-label"
        className="flex"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 2,
          gap: 2,
        }}
      >
        {LENSES.map((l) => {
          const active = lens === l;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setLens(l)}
              className="cursor-pointer border-none font-ui"
              style={{
                fontSize: 12,
                fontWeight: 550,
                padding: '5px 13px',
                borderRadius: 6,
                background: active ? 'var(--action)' : 'transparent',
                color: active ? 'var(--action-fg)' : 'var(--fg-3)',
              }}
            >
              {LENS_LABEL[l]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The same control as a vertical list, for the < 768px overflow menu. */
export function LensMenuItems({ onPick }: { onPick?: () => void }) {
  const { lens, setLens } = useDashboard();
  return (
    <div role="radiogroup" aria-label="Lens" className="flex flex-col" style={{ padding: 6 }}>
      {LENSES.map((l) => {
        const active = lens === l;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              setLens(l);
              onPick?.();
            }}
            className="flex cursor-pointer items-center justify-between border-none bg-transparent text-left font-ui hover:bg-surface-2"
            style={{
              gap: 12,
              padding: '10px 12px',
              minHeight: 44,
              borderRadius: 6,
              fontSize: 13.5,
              fontWeight: active ? 600 : 500,
              color: active ? 'var(--action)' : 'var(--fg-2)',
            }}
          >
            <span>{LENS_LABEL[l]}</span>
            {active ? (
              <span className="text-action">
                <Icon name="clipCheck" size={15} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
