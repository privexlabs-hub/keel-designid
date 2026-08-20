'use client';

/**
 * System map — pick a process, trace its chain across six columns.
 *
 * The chain scrolls horizontally at every size. Below 1024 the columns
 * scroll-snap, and 768-1023 adds a dot indicator so it is obvious there is
 * more chain off-screen.
 */
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/brand/icons';
import { PROCESSES } from '@/data/demo';
import { DEFAULT_MAP_ROOT, buildMap } from '@/lib/dashboard/map';
import { Badge } from './Badge';
import { useDashboard } from './DashboardContext';
import { PageBody } from './PageBody';

export function MapView() {
  const { openDetail } = useDashboard();
  const [root, setRoot] = useState(DEFAULT_MAP_ROOT);
  const [visible, setVisible] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const columns = buildMap(root);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const onScroll = () => {
      const width = node.scrollWidth / columns.length;
      setVisible(width > 0 ? Math.round(node.scrollLeft / width) : 0);
    };
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, [columns.length]);

  return (
    <PageBody>
      <p className="text-fg-2" style={{ fontSize: 13, marginBottom: 16, maxWidth: 760, marginTop: 0 }}>
        Every record in the system is connected. Pick a process to trace its full chain — risks it carries,
        the controls that hold them, the documents that describe them, the evidence they generate, and the
        measures that prove they work.
      </p>

      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 24 }} role="group" aria-label="Process">
        {PROCESSES.map((p) => {
          const active = p.id === root;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => setRoot(p.id)}
              className="flex cursor-pointer items-center font-ui"
              style={{
                gap: 8,
                border: `1px solid ${active ? 'var(--action)' : 'var(--border)'}`,
                background: active ? 'var(--action)' : 'var(--surface-1)',
                color: active ? 'var(--action-fg)' : 'var(--fg-2)',
                borderRadius: 8,
                padding: '8px 12px',
                minHeight: 44,
                fontSize: 12.5,
              }}
            >
              <span className="font-mono" style={{ fontSize: 10.5, opacity: 0.75 }}>
                {p.code}
              </span>
              {p.name}
            </button>
          );
        })}
      </div>

      <div
        ref={scroller}
        className="flex items-start overflow-x-auto snap-x snap-mandatory lg:snap-none"
        style={{ paddingBottom: 10 }}
      >
        {columns.map((col, i) => (
          <div key={col.key} className="flex items-start">
            {i > 0 ? (
              <div
                aria-hidden
                className="hidden flex-none items-center self-stretch text-fg-3 lg:flex"
                style={{ paddingTop: 36 }}
              >
                <Icon name="chevronRight" size={18} />
              </div>
            ) : null}
            <section
              className="flex-none snap-start lg:snap-align-none"
              style={{ width: 206, marginRight: 10 }}
            >
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: 11, padding: '0 2px' }}
              >
                <h2
                  className="uppercase text-fg-3"
                  style={{ fontSize: 10, letterSpacing: '0.08em', margin: 0, fontWeight: 400 }}
                >
                  {col.label}
                </h2>
                <span className="font-mono text-fg-3" style={{ fontSize: 11 }}>
                  {col.count}
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: 8 }}>
                {col.items.map((card) => (
                  <button
                    key={`${card.type}-${card.id}`}
                    type="button"
                    onClick={() => openDetail(card.type, card.id)}
                    className="w-full cursor-pointer text-left font-ui hover:border-line-strong hover:bg-surface-2"
                    style={{
                      background: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '11px 12px',
                    }}
                  >
                    <span
                      className="flex items-center justify-between"
                      style={{ gap: 6, marginBottom: 7 }}
                    >
                      <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
                        {card.code}
                      </span>
                      {card.status ? <Badge spec={card.status} /> : null}
                    </span>
                    <span className="block text-fg-1" style={{ fontSize: 12.5, lineHeight: 1.35 }}>
                      {card.name}
                    </span>
                    {card.sub ? (
                      <span className="block text-fg-3" style={{ fontSize: 10.5, marginTop: 6 }}>
                        {card.sub}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-2 lg:hidden" aria-hidden>
        {columns.map((c, i) => (
          <span
            key={c.key}
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: i === visible ? 'var(--action)' : 'var(--surface-3)',
            }}
          />
        ))}
      </div>
    </PageBody>
  );
}
