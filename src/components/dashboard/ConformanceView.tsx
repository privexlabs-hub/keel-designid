'use client';

/** Conformance — the headline number, the certified standards, and clause rows. */
import { CLAUSE_ROWS, OVERALL_TEXT, STANDARD_STATUS } from '@/lib/dashboard/conformance';
import { Badge } from './Badge';
import { useDashboard } from './DashboardContext';
import { PageBody, Panel } from './PageBody';

export function ConformanceView() {
  const { openDetail } = useDashboard();

  return (
    <PageBody>
      <div className="mb-4 flex" style={{ gap: 14 }}>
        <div
          className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '18px 22px',
          }}
        >
          <div>
            <div
              className="uppercase text-fg-3"
              style={{ fontSize: 10, letterSpacing: '0.08em', marginBottom: 6 }}
            >
              Overall conformance
            </div>
            <div className="font-display text-action" style={{ fontSize: 38, fontWeight: 600, lineHeight: 1 }}>
              {OVERALL_TEXT}
            </div>
          </div>
          <div aria-hidden className="hidden sm:block" style={{ width: 1, height: 52, background: 'var(--border)' }} />
          <ul className="flex list-none flex-col" style={{ gap: 8, margin: 0, padding: 0 }}>
            {STANDARD_STATUS.map((s) => (
              <li key={s.code} className="flex items-center" style={{ gap: 9 }}>
                <span
                  aria-hidden
                  style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', flex: 'none' }}
                />
                <span className="font-mono text-fg-1" style={{ fontSize: 12 }}>
                  {s.code}
                </span>
                <span className="text-fg-3" style={{ fontSize: 11.5 }}>
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Panel>
        {CLAUSE_ROWS.map((c) => (
          <div key={c.id} style={{ borderBottom: '1px solid var(--border-faint)', padding: '16px 20px 14px' }}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center" style={{ columnGap: 20 }}>
              <div className="flex flex-none items-center lg:w-[300px]" style={{ gap: 12 }}>
                <span className="font-mono text-fg-3" style={{ fontSize: 13, width: 22 }}>
                  {c.code}
                </span>
                <span className="text-fg-1" style={{ fontSize: 13.5 }}>
                  {c.title}
                </span>
              </div>
              <div className="flex flex-1 items-center" style={{ gap: 12 }}>
                <div
                  className="flex-1"
                  style={{ height: 6, borderRadius: 999, background: 'var(--surface-3)', overflow: 'hidden' }}
                  role="img"
                  aria-label={`${c.pctText} covered`}
                >
                  <div style={{ height: '100%', width: c.pctText, background: c.barColor, borderRadius: 999 }} />
                </div>
                <span
                  className="font-mono text-fg-2"
                  style={{ fontSize: 12, width: 38, textAlign: 'right' }}
                >
                  {c.pctText}
                </span>
                <span className="flex flex-none justify-end lg:hidden">
                  <Badge spec={c.status} />
                </span>
              </div>
              <span className="hidden flex-none justify-end lg:flex lg:w-[104px]">
                <Badge spec={c.status} />
              </span>
            </div>

            {c.links.length > 0 ? (
              <div className="flex flex-wrap lg:pl-[34px]" style={{ gap: 6, marginTop: 12 }}>
                {c.links.map((lk) => (
                  <button
                    key={`${lk.type}-${lk.id}`}
                    type="button"
                    onClick={() => openDetail(lk.type, lk.id)}
                    className="inline-flex cursor-pointer items-center font-ui hover:border-line-strong"
                    style={{
                      gap: 7,
                      border: '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      borderRadius: 6,
                      padding: '6px 9px',
                      minHeight: 32,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{ width: 6, height: 6, borderRadius: '50%', background: lk.dotColor, flex: 'none' }}
                    />
                    <span className="font-mono text-fg-2" style={{ fontSize: 10.5 }}>
                      {lk.code}
                    </span>
                    <span className="truncate text-fg-3" style={{ fontSize: 11, maxWidth: 170 }}>
                      {lk.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </Panel>
    </PageBody>
  );
}
