'use client';

import { useRef, useState, type RefObject } from 'react';
import { Icon } from '@/brand/icons';
import { CAPABILITY_MATRIX, FORMATS, type ExportFormat } from '@/export/formats';
import { clampScale, estimateBytes, formatBytes } from '@/export/limits';
import { downloadOne } from '@/export/exportOne';
import type { TemplateDef } from '@/templates/types';
import { useDoc, useUI } from './store';

const FORMAT_ORDER: ExportFormat[] = ['png', 'jpeg', 'webp', 'svg', 'pdf'];
const SCALES = [1, 2, 3, 4] as const;

/**
 * Export controls for the design on screen.
 *
 * Everything here reports the truth rather than a hopeful number: the scale is
 * clamped against the browser's real canvas budget, the size estimate is shown
 * before the click, and the format capability matrix is one tap away so nobody
 * discovers SVG's text-shaping limits after the fact.
 */
export function ExportPanel({
  template,
  stageRef,
  slide,
}: {
  template: TemplateDef;
  stageRef: RefObject<HTMLDivElement | null>;
  slide: number;
}) {
  const { canvas } = template;
  const colorway = useDoc((s) => s.colorway);
  const setExporting = useUI((s) => s.setExporting);
  const exporting = useUI((s) => s.exporting);

  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState<number>(2);
  const [status, setStatus] = useState<string | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);
  const busy = useRef(false);

  const spec = FORMATS[format];
  const effective = spec.scalable ? clampScale(canvas.w, canvas.h, scale) : clampScale(canvas.w, canvas.h, 1);
  const estimate = estimateBytes(canvas.w, canvas.h, effective.scale);

  async function run() {
    if (busy.current) return;
    const stage = stageRef.current;
    if (!stage) {
      setStatus('The stage is not mounted yet.');
      return;
    }
    busy.current = true;
    setExporting(true);
    setStatus('Rendering…');
    try {
      const out = await downloadOne({
        stage,
        width: canvas.w,
        height: canvas.h,
        format,
        colorway,
        scale: spec.scalable ? scale : 1,
        templateName: template.name,
        slide: template.slides ? slide : undefined,
        totalSlides: template.slides,
      });
      setStatus(
        `${out.filename} — ${out.width}x${out.height}, ${formatBytes(out.blob.size)}${
          out.notice ? `. ${out.notice}` : ''
        }`,
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    } finally {
      busy.current = false;
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
          Format
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {FORMAT_ORDER.map((f) => {
            const active = format === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className="rounded-md border px-3 py-2.5 text-left"
                style={{
                  borderColor: active ? 'var(--action)' : 'var(--border)',
                  background: active ? 'var(--action-weak)' : 'var(--surface-1)',
                  borderWidth: active ? 2 : 1,
                  minHeight: 44,
                }}
              >
                <span
                  className="block"
                  style={{ fontSize: 12.5, fontWeight: 600, color: active ? 'var(--action)' : 'var(--fg-1)' }}
                >
                  {FORMATS[f].label}
                </span>
                <span className="block font-mono text-fg-3" style={{ fontSize: 10 }}>
                  .{FORMATS[f].ext}
                </span>
              </button>
            );
          })}
        </div>
        <p className="m-0 text-fg-2" style={{ fontSize: 12, lineHeight: 1.5 }}>
          {spec.note}
        </p>
      </section>

      {spec.scalable ? (
        <section className="flex flex-col gap-2">
          <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
            Resolution
          </h2>
          <div className="flex gap-2">
            {SCALES.map((s) => {
              const active = scale === s;
              const c = clampScale(canvas.w, canvas.h, s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  className="flex-1 rounded-md border py-2 font-mono"
                  style={{
                    fontSize: 12,
                    borderColor: active ? 'var(--action)' : 'var(--border)',
                    background: active ? 'var(--action-weak)' : 'var(--surface-1)',
                    color: c.clamped ? 'var(--warn)' : active ? 'var(--action)' : 'var(--fg-2)',
                    minHeight: 40,
                  }}
                  title={c.reason ?? `${c.width}x${c.height}`}
                >
                  {s}x
                </button>
              );
            })}
          </div>
          <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
            {effective.width} x {effective.height} · about {formatBytes(estimate)} in memory
          </span>
          {effective.clamped ? (
            <span className="flex items-start gap-2 rounded-md p-2.5" style={{ background: 'var(--warn-weak)', border: '1px solid var(--warn-weak-bd)' }}>
              <span style={{ color: 'var(--warn)' }}>
                <Icon name="alert" size={14} />
              </span>
              <span style={{ fontSize: 11.5, lineHeight: 1.45, color: 'var(--fg-1)' }}>
                {effective.reason}
              </span>
            </span>
          ) : null}
        </section>
      ) : null}

      <button
        type="button"
        onClick={run}
        disabled={exporting}
        className="flex items-center justify-center gap-2 rounded-lg px-4 py-3"
        style={{
          background: 'var(--action)',
          color: 'var(--action-fg)',
          fontSize: 13.5,
          fontWeight: 600,
          minHeight: 46,
          opacity: exporting ? 0.6 : 1,
        }}
      >
        <Icon name="file" size={16} />
        {exporting ? 'Exporting…' : `Download ${spec.label}`}
      </button>

      {status ? (
        <p
          className="m-0 rounded-md p-3 font-mono"
          style={{ fontSize: 11, lineHeight: 1.5, background: 'var(--surface-2)', color: 'var(--fg-2)' }}
        >
          {status}
        </p>
      ) : null}

      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowMatrix((v) => !v)}
          aria-expanded={showMatrix}
          className="flex items-center gap-2 self-start text-fg-2"
          style={{ fontSize: 12, minHeight: 38 }}
        >
          <span style={{ display: 'inline-flex', transform: showMatrix ? 'rotate(90deg)' : undefined }}>
            <Icon name="chevronRight" size={13} />
          </span>
          What each format can carry
        </button>
        {showMatrix ? (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontSize: 11 }}>
              <thead>
                <tr>
                  {['Feature', 'PNG', 'SVG', 'PDF'].map((h) => (
                    <th
                      key={h}
                      className="uppercase text-fg-3"
                      style={{ fontSize: 9.5, letterSpacing: '0.08em', textAlign: h === 'Feature' ? 'left' : 'center', padding: '6px 8px' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAPABILITY_MATRIX.map((row) => (
                  <tr key={row.feature} style={{ borderTop: '1px solid var(--border-faint)' }}>
                    <td style={{ padding: '7px 8px', color: 'var(--fg-1)' }}>
                      {row.feature}
                      {row.detail ? (
                        <span className="block text-fg-3" style={{ fontSize: 10, lineHeight: 1.4 }}>
                          {row.detail}
                        </span>
                      ) : null}
                    </td>
                    {(['png', 'svg', 'pdf'] as const).map((k) => (
                      <td key={k} style={{ padding: '7px 8px', textAlign: 'center' }}>
                        <span style={{ color: row[k] ? 'var(--brand)' : 'var(--fg-3)', display: 'inline-flex' }}>
                          <Icon name={row[k] ? 'clipCheck' : 'minus'} size={13} />
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
