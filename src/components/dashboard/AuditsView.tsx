'use client';

/** Audits — a 900px stack of history cards. */
import { Icon } from '@/brand/icons';
import { AUDITS } from '@/data/demo';
import { auditBadge } from '@/lib/dashboard/tone';
import { Badge } from './Badge';
import { useDashboard } from './DashboardContext';
import { PageBody } from './PageBody';

export function AuditsView() {
  const { openDetail } = useDashboard();
  return (
    <PageBody>
      <ul className="flex list-none flex-col" style={{ gap: 12, maxWidth: 900, margin: 0, padding: 0 }}>
        {AUDITS.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => openDetail('audit', a.id)}
              className="flex w-full cursor-pointer flex-wrap items-center text-left font-ui hover:border-line-strong"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '16px 20px',
                gap: 16,
              }}
            >
              <span className="inline-flex flex-none text-fg-3">
                <Icon name="clipList" size={20} />
              </span>
              <span className="min-w-0 flex-1" style={{ minWidth: 180 }}>
                <span className="flex flex-wrap items-center" style={{ gap: 11 }}>
                  <span className="font-mono text-fg-3" style={{ fontSize: 11 }}>
                    {a.code}
                  </span>
                  <span className="text-fg-1" style={{ fontSize: 14, fontWeight: 550 }}>
                    {a.name}
                  </span>
                </span>
                <span className="block text-fg-3" style={{ fontSize: 12, marginTop: 4 }}>
                  {a.type} · {a.findings}
                </span>
              </span>
              <span className="flex-none font-mono text-fg-2" style={{ fontSize: 12 }}>
                {a.date}
              </span>
              <span className="flex-none">
                <Badge spec={auditBadge(a.status)} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </PageBody>
  );
}
