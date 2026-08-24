'use client';

/**
 * Batch export.
 *
 * This lives on its own route rather than as a fifth inspector tab for two
 * reasons: the export verification drives the editor by matching tab text, and
 * a long-running render deserves a page where nothing else is competing for
 * the main thread.
 *
 * The counting is done before anything renders, so the size of what you asked
 * for is on screen before you start it — not discovered when the tab runs out
 * of memory.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/brand/icons';
import { KeelLockup } from '@/brand/Logo';
import { COLORWAYS, type ColorwayId } from '@/brand/tokens';
import { CATEGORIES, TEMPLATE_INDEX } from '@/templates/registry';
import { loadTemplateCached } from '@/templates/render/loadCache';
import type { TemplateCategory } from '@/templates/types';
import { estimateBatch, runBatch, type BatchProgress, type JobProgress } from '@/export/batch';
import { FORMATS, type ExportFormat } from '@/export/formats';
import { formatBytes } from '@/export/limits';
import { buildJobs, PRESETS, type JobScope } from '@/export/jobs';
import { ResponsiveTable, type TableColumn } from '@/components/dashboard/ResponsiveTable';
import { useBatchHost } from './BatchHost';
import { useDoc } from './store';

const SCOPES: { id: JobScope; label: string; hint: string }[] = [
  { id: 'design', label: 'This design', hint: 'The frame currently open.' },
  { id: 'slides', label: 'Every slide', hint: 'All slides of the open template.' },
  { id: 'colorways', label: 'Every colourway', hint: 'The open template in each approved colourway.' },
  { id: 'category', label: 'A whole category', hint: 'Every template in one category, default colourway.' },
  { id: 'everything', label: 'Everything', hint: 'The entire catalogue. Check the size first.' },
];

const FORMAT_CHOICES: ExportFormat[] = ['png', 'jpeg', 'webp', 'svg', 'pdf'];
const SCALE_CHOICES = [1, 2, 3] as const;

export function ExportConsole() {
  const activeTemplateId = useDoc((s) => s.templateId);
  const activeColorway = useDoc((s) => s.colorway);

  const [scope, setScope] = useState<JobScope>('design');
  const [formats, setFormats] = useState<ExportFormat[]>(['png']);
  const [scales, setScales] = useState<number[]>([2]);
  const [category, setCategory] = useState<TemplateCategory>('square');
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  const { render, node } = useBatchHost();

  const approvedColorways = useApprovedColorways(activeTemplateId);

  const jobs = useMemo(
    () =>
      buildJobs(
        {
          scope,
          formats,
          scales,
          templateId: activeTemplateId || TEMPLATE_INDEX[0]?.id,
          category,
          activeColorway,
          colorways: approvedColorways.length ? approvedColorways : undefined,
        },
        TEMPLATE_INDEX,
      ),
    [scope, formats, scales, activeTemplateId, category, activeColorway, approvedColorways],
  );

  const estimate = useMemo(() => estimateBatch(jobs), [jobs]);
  const running = progress?.phase === 'rendering' || progress?.phase === 'archiving';

  async function start() {
    if (running || jobs.length === 0) return;
    const controller = new AbortController();
    abort.current = controller;
    setSummary(null);

    const result = await runBatch(jobs, render, {
      onProgress: setProgress,
      signal: controller.signal,
      archiveName: `keel-${scope}-${jobs.length}-files.zip`,
    });

    abort.current = null;
    setSummary(
      result.cancelled
        ? `Cancelled after ${result.succeeded} of ${jobs.length}.`
        : `${result.succeeded} file${result.succeeded === 1 ? '' : 's'} exported` +
            (result.failed.length ? `, ${result.failed.length} failed.` : '.'),
    );
  }

  const columns: TableColumn<JobProgress>[] = [
    { key: 'template', label: 'Template', cell: (j) => j.job.templateName },
    {
      key: 'detail',
      label: 'Frame',
      cell: (j) =>
        [
          COLORWAYS[j.job.colorway as ColorwayId]?.label ?? j.job.colorway,
          j.job.slide ? `slide ${j.job.slide}` : null,
        ]
          .filter(Boolean)
          .join(' · '),
    },
    {
      key: 'format',
      label: 'Format',
      cell: (j) => `${FORMATS[j.job.format].label}${FORMATS[j.job.format].scalable ? ` @${j.job.scale}x` : ''}`,
    },
    {
      key: 'state',
      label: 'State',
      align: 'right',
      cell: (j) => (
        <span
          style={{
            color:
              j.state === 'done'
                ? 'var(--brand)'
                : j.state === 'failed'
                  ? 'var(--danger)'
                  : j.state === 'running'
                    ? 'var(--action)'
                    : 'var(--fg-3)',
          }}
        >
          {j.state === 'done' && j.bytes ? formatBytes(j.bytes) : j.state}
        </span>
      ),
    },
  ];

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8">
      {node}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <KeelLockup size={26} />
        <Link href={activeTemplateId ? `/studio/${activeTemplateId}/` : '/studio/'} className="flex items-center gap-2 text-fg-2 no-underline" style={{ fontSize: 12.5 }}>
          <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
            <Icon name="chevronRight" size={14} />
          </span>
          Back to the editor
        </Link>
      </div>

      <h1
        className="mt-8 font-display text-fg-1"
        style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 600, letterSpacing: '-0.012em' }}
      >
        Export a kit
      </h1>
      <p className="mt-3 max-w-[62ch] text-fg-2" style={{ fontSize: 15, lineHeight: 1.6 }}>
        Everything you have edited is exported as you left it. Files arrive as one archive,
        foldered by category.
      </p>

      {/* presets */}
      <section className="mt-10">
        <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
          Start from
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={p.needsTemplate && !activeTemplateId}
              onClick={() => {
                setScope(p.spec.scope);
                setFormats(p.spec.formats);
                setScales(p.spec.scales);
              }}
              className="rounded-xl border p-4 text-left"
              style={{
                borderColor: scope === p.spec.scope ? 'var(--action)' : 'var(--border)',
                background: 'var(--surface-1)',
                opacity: p.needsTemplate && !activeTemplateId ? 0.5 : 1,
              }}
            >
              <span className="block text-fg-1" style={{ fontSize: 14, fontWeight: 600 }}>
                {p.label}
              </span>
              <span className="mt-1 block text-fg-2" style={{ fontSize: 12.5, lineHeight: 1.45 }}>
                {p.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* scope */}
      <section className="mt-8">
        <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
          What to export
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScope(s.id)}
              aria-pressed={scope === s.id}
              title={s.hint}
              className="rounded-md border px-3 py-2"
              style={{
                fontSize: 12.5,
                minHeight: 40,
                borderColor: scope === s.id ? 'var(--action)' : 'var(--border)',
                background: scope === s.id ? 'var(--action-weak)' : 'var(--surface-1)',
                color: scope === s.id ? 'var(--action)' : 'var(--fg-2)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {scope === 'category' ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => {
              const count = TEMPLATE_INDEX.filter((t) => t.category === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-pressed={category === c.id}
                  disabled={count === 0}
                  className="rounded-full border px-2.5 py-1.5"
                  style={{
                    fontSize: 11,
                    minHeight: 32,
                    opacity: count === 0 ? 0.45 : 1,
                    borderColor: category === c.id ? 'var(--action)' : 'var(--border)',
                    background: category === c.id ? 'var(--action-weak)' : 'var(--surface-1)',
                    color: category === c.id ? 'var(--action)' : 'var(--fg-2)',
                  }}
                >
                  {c.label} <span className="font-mono" style={{ fontSize: 9.5 }}>{count}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      {/* formats + scales */}
      <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
            Formats
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {FORMAT_CHOICES.map((f) => {
              const on = formats.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setFormats((prev) =>
                      // Never let the list empty out — an export of nothing is
                      // a confusing no-op rather than a useful state.
                      on ? (prev.length > 1 ? prev.filter((x) => x !== f) : prev) : [...prev, f],
                    )
                  }
                  className="rounded-md border px-3 py-2"
                  style={{
                    fontSize: 12.5,
                    minHeight: 40,
                    borderColor: on ? 'var(--action)' : 'var(--border)',
                    background: on ? 'var(--action-weak)' : 'var(--surface-1)',
                    color: on ? 'var(--action)' : 'var(--fg-2)',
                  }}
                >
                  {FORMATS[f].label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
            Resolution
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SCALE_CHOICES.map((s) => {
              const on = scales.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setScales((prev) =>
                      on ? (prev.length > 1 ? prev.filter((x) => x !== s) : prev) : [...prev, s],
                    )
                  }
                  className="rounded-md border px-3 py-2 font-mono"
                  style={{
                    fontSize: 12,
                    minHeight: 40,
                    borderColor: on ? 'var(--action)' : 'var(--border)',
                    background: on ? 'var(--action-weak)' : 'var(--surface-1)',
                    color: on ? 'var(--action)' : 'var(--fg-2)',
                  }}
                >
                  {s}x
                </button>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-fg-3" style={{ fontSize: 10.5 }}>
            Vector formats ignore resolution.
          </p>
        </div>
      </section>

      {/* run */}
      <section
        className="mt-10 rounded-xl border p-5"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="m-0 text-fg-1" style={{ fontSize: 15, fontWeight: 600 }}>
              {jobs.length} file{jobs.length === 1 ? '' : 's'}
            </p>
            <p className="m-0 mt-1 font-mono text-fg-3" style={{ fontSize: 11 }}>
              about {estimate.label} of pixels to render
            </p>
          </div>

          <div className="flex gap-2">
            {running ? (
              <button
                type="button"
                onClick={() => abort.current?.abort()}
                className="rounded-lg border px-4 py-3"
                style={{ borderColor: 'var(--border)', fontSize: 13.5, minHeight: 46 }}
              >
                Stop
              </button>
            ) : null}
            <button
              type="button"
              onClick={start}
              disabled={running || jobs.length === 0}
              className="rounded-lg px-5 py-3"
              style={{
                background: 'var(--action)',
                color: 'var(--action-fg)',
                fontSize: 13.5,
                fontWeight: 600,
                minHeight: 46,
                opacity: running || jobs.length === 0 ? 0.6 : 1,
              }}
            >
              {running ? 'Exporting…' : 'Export kit'}
            </button>
          </div>
        </div>

        {progress ? (
          <div className="mt-4">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: 'var(--surface-3)' }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.done}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
                  background: 'var(--action)',
                  transition: 'width 120ms var(--ease)',
                }}
              />
            </div>
            <p className="mt-2 font-mono text-fg-2" style={{ fontSize: 11 }}>
              {progress.phase === 'archiving'
                ? `Packing the archive… ${Math.round((progress.archivePct ?? 0) * 100)}%`
                : `${progress.done} of ${progress.total}${progress.current ? ` · ${progress.current.templateName}` : ''}`}
            </p>
          </div>
        ) : null}

        {summary ? (
          <p className="mt-3 font-mono text-fg-2" style={{ fontSize: 11.5 }}>
            {summary}
          </p>
        ) : null}
      </section>

      {progress && progress.jobs.length ? (
        <section className="mt-8">
          <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
            Files
          </h2>
          <div className="mt-3">
            <ResponsiveTable
              label="Export jobs"
              columns={columns}
              rows={progress.jobs}
              rowKey={(j) => j.job.id}
              primary={(j) => j.job.templateName}
              secondary={(j) =>
                [
                  COLORWAYS[j.job.colorway as ColorwayId]?.label ?? j.job.colorway,
                  j.job.slide ? `slide ${j.job.slide}` : null,
                  FORMATS[j.job.format].label,
                ]
                  .filter(Boolean)
                  .join(' · ')
              }
            />
          </div>
          {progress.jobs.some((j) => j.state === 'failed') ? (
            <ul className="mt-4 m-0 list-none p-0">
              {progress.jobs
                .filter((j) => j.state === 'failed')
                .map((j) => (
                  <li
                    key={j.job.id}
                    className="mb-2 rounded-md p-3"
                    style={{ background: 'var(--danger-weak)', border: '1px solid var(--danger-weak-bd)' }}
                  >
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--fg-1)' }}>
                      {j.job.templateName} · {j.error}
                    </span>
                  </li>
                ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

/**
 * The colourways a template actually approves.
 *
 * The registry index carries only the default — the full list lives on the
 * definition. Rather than guess (which would queue jobs in colourways a
 * template does not allow), load the one definition that is open.
 */
function useApprovedColorways(templateId: string): ColorwayId[] {
  const [ways, setWays] = useState<ColorwayId[]>([]);

  useEffect(() => {
    if (!templateId) return;
    let live = true;
    loadTemplateCached(templateId).then(
      (def) => {
        if (live) setWays(def.colorways);
      },
      () => {
        if (live) setWays([]);
      },
    );
    return () => {
      live = false;
    };
  }, [templateId]);

  // No template open means no approved list, reported without clearing state
  // from inside an effect.
  return templateId ? ways : EMPTY_COLORWAYS;
}

const EMPTY_COLORWAYS: ColorwayId[] = [];
