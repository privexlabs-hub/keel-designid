'use client';

/**
 * Overview — the hero health ring, three stat tiles, the KPI table beside the
 * lens panel, the operating loop, and the two activity lists.
 */
import { Icon } from '@/brand/icons';
import { COUNTS, HEALTH, KPI_ROWS, LOOP, OPEN_ACTIONS, RECENT_EVIDENCE, TILES } from '@/lib/dashboard/overview';
import type { KpiRow } from '@/lib/dashboard/overview';
import { LENS_FRAMING, LENS_NAME, lensPanel } from '@/lib/dashboard/lens';
import { Badge, ToneDot } from './Badge';
import { useDashboard } from './DashboardContext';
import { PageBody, Panel, PanelHead } from './PageBody';
import { ResponsiveTable, type TableColumn } from './ResponsiveTable';

const KPI_COLUMNS: TableColumn<KpiRow>[] = [
  {
    key: 'measure',
    label: 'Measure',
    omitInCard: true,
    cell: (k) => (
      <span className="flex items-center" style={{ gap: 10 }}>
        <span className="font-mono text-fg-3" style={{ fontSize: 11 }}>
          {k.code}
        </span>
        <span className="text-fg-1" style={{ fontSize: 13 }}>
          {k.name}
        </span>
      </span>
    ),
  },
  {
    key: 'value',
    label: 'Value',
    align: 'right',
    cell: (k) => (
      <span className="font-mono text-fg-1" style={{ fontSize: 13.5 }}>
        {k.valueText}
      </span>
    ),
  },
  {
    key: 'target',
    label: 'Target',
    cell: (k) => (
      <span className="font-mono text-fg-3" style={{ fontSize: 12 }}>
        {k.target}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    align: 'right',
    omitInCard: true,
    cell: (k) => <Badge spec={k.status} />,
  },
];

function HealthRing() {
  return (
    <div
      className="flex flex-none items-center justify-center rounded-full [--ring:128px] md:[--ring:144px] lg:[--ring:176px] xl:[--ring:106px]"
      style={{ width: 'var(--ring)', height: 'var(--ring)', background: HEALTH.ring }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full"
        style={{
          width: 'calc(var(--ring) * 0.755)',
          height: 'calc(var(--ring) * 0.755)',
          background: 'var(--surface-1)',
        }}
      >
        <span
          className="font-display text-action"
          style={{ fontSize: 'calc(var(--ring) * 0.34)', fontWeight: 600, lineHeight: 1 }}
        >
          {HEALTH.score}
        </span>
        <span className="font-mono text-fg-3" style={{ fontSize: 10, marginTop: 1 }}>
          / 100
        </span>
      </div>
    </div>
  );
}

function LoopCard({ stage }: { stage: (typeof LOOP)[number] }) {
  return (
    <div
      className="flex-1"
      style={{
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '12px 13px',
        background: 'var(--surface-2)',
      }}
    >
      <div className="flex items-center" style={{ gap: 8, marginBottom: 7 }}>
        <ToneDot tone={stage.tone} />
        <span className="text-fg-1" style={{ fontSize: 12.5, fontWeight: 600 }}>
          {stage.label}
        </span>
      </div>
      <div className="text-fg-3" style={{ fontSize: 11, lineHeight: 1.4 }}>
        {stage.signal}
      </div>
    </div>
  );
}

export function OverviewView() {
  const { lens, openDetail } = useDashboard();
  const panel = lensPanel(lens);

  return (
    <PageBody>
      {/* ---- hero ---------------------------------------------------- */}
      <section
        className="mb-[14px] flex flex-col items-center gap-6 lg:flex-row lg:items-stretch lg:gap-7"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '22px 20px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex flex-none flex-col items-center gap-4 sm:flex-row sm:gap-5 lg:items-center">
          <HealthRing />
          <div className="flex flex-col text-center sm:text-left" style={{ gap: 4 }}>
            <span className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em' }}>
              System health
            </span>
            <span className="font-display text-fg-1" style={{ fontSize: 20, fontWeight: 600 }}>
              {HEALTH.word}
            </span>
            <span className="text-fg-2" style={{ fontSize: 12 }}>
              {HEALTH.label}
            </span>
          </div>
        </div>

        <div
          aria-hidden
          className="hidden w-px flex-none lg:block"
          style={{ background: 'linear-gradient(180deg, transparent, var(--action-weak-bd), transparent)' }}
        />
        <div
          aria-hidden
          className="h-px w-full flex-none lg:hidden"
          style={{ background: 'linear-gradient(90deg, transparent, var(--action-weak-bd), transparent)' }}
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center" style={{ gap: 9 }}>
          <span className="uppercase text-action" style={{ fontSize: 10, letterSpacing: '0.12em' }}>
            {LENS_NAME[lens]} lens
          </span>
          <p
            className="font-display text-fg-1"
            style={{
              fontSize: 'clamp(18px, 2.4vw, 23px)',
              fontWeight: 500,
              lineHeight: 1.32,
              maxWidth: 600,
              textWrap: 'pretty',
              margin: 0,
            }}
          >
            {LENS_FRAMING[lens]}
          </p>
        </div>
      </section>

      {/* ---- stat tiles ---------------------------------------------- */}
      <div className="mb-[14px] grid grid-cols-1 gap-[14px] md:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <div
            key={t.label}
            className="flex items-center justify-between gap-4 md:block"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '16px 18px',
            }}
          >
            <div className="min-w-0">
              <div
                className="uppercase text-fg-3 md:mb-3"
                style={{ fontSize: 10, letterSpacing: '0.08em' }}
              >
                {t.label}
              </div>
            </div>
            <div className="flex items-baseline md:mt-0" style={{ gap: 4 }}>
              <span
                className="font-display"
                style={{ fontSize: 33, fontWeight: 600, color: t.color, letterSpacing: '-0.01em', lineHeight: 1 }}
              >
                {t.value}
              </span>
              <span className="font-mono text-fg-3" style={{ fontSize: 13 }}>
                {t.unit}
              </span>
            </div>
            <div className="hidden text-fg-3 md:block" style={{ fontSize: 12, marginTop: 10 }}>
              {t.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ---- KPI table + lens panel ---------------------------------- */}
      <div className="mb-[14px] grid grid-cols-1 gap-[14px] lg:grid-cols-[1.4fr_1fr] xl:grid-cols-[1.7fr_1fr]">
        <Panel>
          <PanelHead title="Performance — this month" meta={`${COUNTS.kpis} measures`} />
          <ResponsiveTable
            label="Key performance indicators"
            columns={KPI_COLUMNS}
            rows={KPI_ROWS}
            rowKey={(k) => k.id}
            primary={(k) => k.name}
            secondary={(k) => k.code}
            trailing={(k) => <Badge spec={k.status} />}
            onRowClick={(k) => openDetail('kpi', k.id)}
            edgeX={20}
            innerX={12}
            headerY={9}
            cellY={11}
          />
        </Panel>

        <Panel>
          <div style={{ padding: '18px 20px' }}>
            <div className="flex flex-col" style={{ gap: 2, marginBottom: 6 }}>
              <h2 className="font-display text-fg-1" style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                {panel.title}
              </h2>
              <span className="text-fg-3" style={{ fontSize: 11.5 }}>
                {panel.sub}
              </span>
            </div>
            {panel.bars.map((b) => (
              <div key={b.label} style={{ marginTop: 15 }}>
                <div className="flex items-baseline justify-between" style={{ marginBottom: 6 }}>
                  <span className="truncate text-fg-2" style={{ fontSize: 12.5, paddingRight: 10 }}>
                    {b.label}
                  </span>
                  <span className="flex-none font-mono text-fg-1" style={{ fontSize: 12 }}>
                    {b.valueText}
                  </span>
                </div>
                <div
                  style={{ height: 6, borderRadius: 999, background: 'var(--surface-3)', overflow: 'hidden' }}
                >
                  <div style={{ height: '100%', borderRadius: 999, width: b.pctText, background: b.color }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* ---- the operating loop -------------------------------------- */}
      <Panel className="mb-[14px]">
        <div style={{ padding: '18px 20px' }}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2
              className="uppercase text-fg-3"
              style={{ fontSize: 10, letterSpacing: '0.08em', margin: 0, fontWeight: 400 }}
            >
              The operating loop
            </h2>
            <span className="hidden text-right text-fg-3 sm:block" style={{ fontSize: 11.5 }}>
              Your management system as a cycle — not a folder
            </span>
          </div>

          {/* >= 1024: six across, chevron-separated */}
          <div className="hidden items-stretch lg:flex">
            {LOOP.map((stage, i) => (
              <div key={stage.label} className="flex flex-1 items-stretch">
                {i > 0 ? (
                  <span
                    className="inline-flex flex-none items-center text-action"
                    style={{ margin: '0 2px' }}
                    aria-hidden
                  >
                    <Icon name="chevronRight" size={18} />
                  </span>
                ) : null}
                <LoopCard stage={stage} />
              </div>
            ))}
          </div>

          {/* 768-1023: 3 x 2 */}
          <div className="hidden grid-cols-3 gap-3 md:grid lg:hidden">
            {LOOP.map((stage) => (
              <LoopCard key={stage.label} stage={stage} />
            ))}
          </div>

          {/* < 768: vertical rail */}
          <ol className="flex list-none flex-col md:hidden" style={{ margin: 0, padding: 0 }}>
            {LOOP.map((stage, i) => (
              <li key={stage.label} className="flex" style={{ gap: 12 }}>
                <span className="flex flex-none flex-col items-center" style={{ width: 12 }}>
                  <span style={{ marginTop: 4 }}>
                    <ToneDot tone={stage.tone} />
                  </span>
                  {i < LOOP.length - 1 ? (
                    <span aria-hidden className="flex-1" style={{ width: 1, background: 'var(--border)' }} />
                  ) : null}
                </span>
                <span className="flex-1" style={{ paddingBottom: i < LOOP.length - 1 ? 16 : 0 }}>
                  <span className="block text-fg-1" style={{ fontSize: 13, fontWeight: 600 }}>
                    {stage.label}
                  </span>
                  <span className="block text-fg-3" style={{ fontSize: 11.5, marginTop: 2 }}>
                    {stage.signal}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Panel>

      {/* ---- activity ------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-2">
        <Panel>
          <PanelHead title="Open corrective actions" meta={`${COUNTS.openActions} open`} />
          <ul className="list-none" style={{ margin: 0, padding: 0 }}>
            {OPEN_ACTIONS.map((a) => (
              <li key={a.id} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                <button
                  type="button"
                  onClick={() => openDetail('action', a.id)}
                  className="flex w-full cursor-pointer items-center border-none bg-transparent text-left font-ui hover:bg-surface-2"
                  style={{ gap: 13, padding: '13px 20px', minHeight: 44 }}
                >
                  <span className="flex-none font-mono text-fg-3" style={{ fontSize: 11 }}>
                    {a.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-fg-1" style={{ fontSize: 13 }}>
                      {a.title}
                    </span>
                    <span className="block text-fg-3" style={{ fontSize: 11, marginTop: 2 }}>
                      {a.owner} · {a.sourceText}
                    </span>
                  </span>
                  <span className="flex flex-none flex-col items-end" style={{ gap: 5 }}>
                    <Badge spec={a.priority} />
                    <span className="font-mono" style={{ fontSize: 11, color: a.dueColor }}>
                      {a.dueText}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHead title="Recent evidence" meta="last 5 records" />
          <ul className="list-none" style={{ margin: 0, padding: 0 }}>
            {RECENT_EVIDENCE.map((e) => (
              <li key={e.id} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                <button
                  type="button"
                  onClick={() => openDetail('evidence', e.id)}
                  className="flex w-full cursor-pointer flex-wrap items-center border-none bg-transparent text-left font-ui hover:bg-surface-2"
                  style={{ gap: 13, padding: '13px 20px', minHeight: 44 }}
                >
                  <span className="flex-none font-mono text-fg-3" style={{ fontSize: 11 }}>
                    {e.code}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-fg-1" style={{ fontSize: 13 }}>
                    {e.name}
                  </span>
                  <span className="flex-none font-mono text-fg-3" style={{ fontSize: 11 }}>
                    {e.dateText}
                  </span>
                  <span className="flex-none">
                    <Badge spec={e.status} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </PageBody>
  );
}
