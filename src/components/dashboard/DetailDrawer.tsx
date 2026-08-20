'use client';

/**
 * The entity drawer. Any record in the system opens here, and its related
 * records are chips that open the next one — the drawer is how the graph is
 * actually traversed.
 *
 *   >= 1024   fixed 440px right panel over the scrim
 *   768-1023  the same panel at 400px
 *   < 768     a bottom sheet, max 88dvh, rounded top, drag handle
 */
import { useRef } from 'react';
import { Icon } from '@/brand/icons';
import { buildDetail } from '@/lib/dashboard/detail';
import { Badge } from './Badge';
import { useDashboard } from './DashboardContext';
import { useDialogBehaviour } from './useDialogBehaviour';

export function DetailDrawer() {
  const { detail, closeDetail, openDetail } = useDashboard();
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogBehaviour(panelRef, detail !== null, closeDetail);

  if (!detail) return null;
  const model = buildDetail(detail.type, detail.id);
  if (!model) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close details"
        onClick={closeDetail}
        className="absolute inset-0 border-none"
        style={{ background: 'var(--scrim)', animation: 'kf-scrim 180ms var(--ease)' }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        tabIndex={-1}
        className={[
          'absolute flex flex-col',
          // bottom sheet
          'right-0 bottom-0 left-0 max-h-[88dvh] rounded-t-[14px]',
          // side panel
          'md:top-0 md:left-auto md:h-full md:max-h-none md:w-[400px] md:rounded-none lg:w-[440px]',
        ].join(' ')}
        style={{
          background: 'var(--surface-1)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'kf-drawer 220ms var(--ease-out)',
        }}
      >
        <div className="md:hidden" style={{ padding: '8px 0 0', display: 'flex', justifyContent: 'center' }}>
          <span
            aria-hidden
            style={{ width: 38, height: 4, borderRadius: 999, background: 'var(--surface-3)' }}
          />
        </div>

        <div
          className="flex flex-none items-start"
          style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', gap: 14 }}
        >
          <span
            className="inline-flex flex-none items-center justify-center text-fg-2"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            <Icon name={model.icon} size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center" style={{ gap: 9 }}>
              <span className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.08em' }}>
                {model.typeLabel}
              </span>
              <span className="font-mono text-fg-3" style={{ fontSize: 11 }}>
                {model.code}
              </span>
            </div>
            <h2
              id="detail-title"
              className="font-display text-fg-1"
              style={{ fontSize: 18, fontWeight: 600, marginTop: 4, marginBottom: 0, lineHeight: 1.3 }}
            >
              {model.title}
            </h2>
            <div className="text-fg-3" style={{ fontSize: 12, marginTop: 3 }}>
              {model.subtitle}
            </div>
          </div>
          <button
            type="button"
            onClick={closeDetail}
            aria-label="Close details"
            className="inline-flex flex-none cursor-pointer items-center justify-center border-none bg-transparent text-fg-3 hover:text-fg-1"
            style={{ width: 44, height: 44, margin: '-8px -12px 0 0' }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: '18px 22px 28px' }}>
          {model.status ? (
            <div style={{ marginBottom: 18 }}>
              <Badge spec={model.status} />
            </div>
          ) : null}

          <dl
            className="flex flex-col"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden',
              marginBottom: 22,
              margin: '0 0 22px',
            }}
          >
            {model.fields.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between"
                style={{ gap: 14, padding: '11px 14px', borderBottom: '1px solid var(--border-faint)' }}
              >
                <dt className="flex-none text-fg-3" style={{ fontSize: 12 }}>
                  {f.label}
                </dt>
                <dd className="m-0 text-right">
                  {f.badge ? (
                    <Badge spec={f.badge} />
                  ) : (
                    <span
                      className={f.mono ? 'font-mono text-fg-1' : 'font-ui text-fg-1'}
                      style={{ fontSize: 12.5 }}
                    >
                      {f.value}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {model.related
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <section key={g.label} style={{ marginBottom: 18 }}>
                <h3
                  className="flex items-center uppercase text-fg-3"
                  style={{ fontSize: 10, letterSpacing: '0.08em', marginBottom: 11, gap: 8, fontWeight: 600 }}
                >
                  {g.label}
                  <span className="font-mono" style={{ fontWeight: 400 }}>
                    {g.items.length}
                  </span>
                </h3>
                <div className="flex flex-col" style={{ gap: 7 }}>
                  {g.items.map((it) => (
                    <button
                      key={`${it.type}-${it.id}`}
                      type="button"
                      onClick={() => openDetail(it.type, it.id)}
                      className="flex w-full cursor-pointer items-center text-left hover:bg-surface-3"
                      style={{
                        gap: 11,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-2)',
                        borderRadius: 7,
                        padding: '9px 12px',
                        minHeight: 44,
                      }}
                    >
                      <span
                        style={{ width: 7, height: 7, borderRadius: '50%', background: it.dotColor, flex: 'none' }}
                      />
                      <span className="flex-none font-mono text-fg-3" style={{ fontSize: 11 }}>
                        {it.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-fg-1" style={{ fontSize: 12.5 }}>
                        {it.label}
                      </span>
                      <span className="inline-flex flex-none text-fg-3">
                        <Icon name="chevronRight" size={15} />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}
