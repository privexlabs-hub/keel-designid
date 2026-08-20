'use client';

/**
 * The corrective-action board.
 *
 *   >= 1024   three columns
 *   768-1023  one horizontal scroller, columns at least 260px
 *   < 768     a segmented control, one column at a time
 */
import { useState } from 'react';
import { ACTION_BOARD, type ActionCard, type ActionGroup } from '@/lib/dashboard/actions';
import { actionsTitle } from '@/lib/dashboard/lens';
import { Badge } from './Badge';
import { useDashboard } from './DashboardContext';
import { PageBody } from './PageBody';

function Card({ a, onOpen }: { a: ActionCard; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full cursor-pointer text-left font-ui hover:border-line-strong"
      style={{
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: 12,
        background: 'var(--surface-2)',
      }}
    >
      <span className="flex items-center justify-between" style={{ gap: 8, marginBottom: 8 }}>
        <span className="font-mono text-fg-3" style={{ fontSize: 11 }}>
          {a.code}
        </span>
        <Badge spec={a.priority} />
      </span>
      <span className="block text-fg-1" style={{ fontSize: 13, lineHeight: 1.4, marginBottom: 9 }}>
        {a.title}
      </span>
      <span className="flex items-center justify-between" style={{ gap: 8 }}>
        <span className="text-fg-3" style={{ fontSize: 11 }}>
          {a.owner}
        </span>
        <span className="font-mono" style={{ fontSize: 11, color: a.dueColor }}>
          {a.dueText}
        </span>
      </span>
    </button>
  );
}

function Column({ g }: { g: ActionGroup }) {
  const { openDetail } = useDashboard();
  return (
    <section
      className="flex-none md:w-[260px] lg:w-auto lg:flex-1"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}
      >
        <span className="flex items-center" style={{ gap: 9 }}>
          <span
            aria-hidden
            style={{ width: 8, height: 8, borderRadius: '50%', background: g.dotColor, flex: 'none' }}
          />
          <h2 className="text-fg-1" style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
            {g.label}
          </h2>
        </span>
        <span className="font-mono text-fg-3" style={{ fontSize: 11 }}>
          {g.count}
        </span>
      </div>
      <div className="flex flex-col" style={{ padding: 10, gap: 8 }}>
        {g.items.map((a) => (
          <Card key={a.id} a={a} onOpen={() => openDetail('action', a.id)} />
        ))}
      </div>
    </section>
  );
}

export function ActionsView() {
  const { lens } = useDashboard();
  const [active, setActive] = useState(0);

  return (
    <PageBody>
      <h1 className="sr-only">{actionsTitle(lens)}</h1>

      {/* < 768: segmented control, one column at a time */}
      <div className="md:hidden">
        <div
          role="tablist"
          aria-label="Action status"
          className="mb-[14px] flex"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 2,
            gap: 2,
          }}
        >
          {ACTION_BOARD.map((g, i) => {
            const on = i === active;
            return (
              <button
                key={g.key}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`action-panel-${g.key}`}
                id={`action-tab-${g.key}`}
                onClick={() => setActive(i)}
                className="flex flex-1 cursor-pointer items-center justify-center border-none font-ui"
                style={{
                  gap: 7,
                  minHeight: 40,
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 550,
                  background: on ? 'var(--action)' : 'transparent',
                  color: on ? 'var(--action-fg)' : 'var(--fg-3)',
                }}
              >
                {g.label}
                <span className="font-mono" style={{ fontSize: 11, opacity: 0.8 }}>
                  {g.count}
                </span>
              </button>
            );
          })}
        </div>
        {ACTION_BOARD.map((g, i) =>
          i === active ? (
            <div key={g.key} role="tabpanel" id={`action-panel-${g.key}`} aria-labelledby={`action-tab-${g.key}`}>
              <Column g={g} />
            </div>
          ) : null,
        )}
      </div>

      {/* >= 768: scroller, then three columns at >= 1024 */}
      <div className="hidden items-start gap-[14px] overflow-x-auto md:flex lg:overflow-x-visible">
        {ACTION_BOARD.map((g) => (
          <Column key={g.key} g={g} />
        ))}
      </div>
    </PageBody>
  );
}
