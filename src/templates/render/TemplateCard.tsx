'use client';

/**
 * A gallery card: one template, loaded on demand and rendered live at preview
 * scale. The stage inside is still exactly `canvas.w x canvas.h` — only the
 * wrapper is scaled — so what is on screen is what would export.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ColorwayId } from '@/brand/tokens';
import { COLORWAYS } from '@/brand/tokens';
import { loadTemplate, type TemplateMeta } from '../registry';
import type { TemplateDef } from '../types';
import { ScaledStage } from './ScaledStage';
import { TemplateStage } from './TemplateStage';

export interface TemplateCardProps {
  meta: TemplateMeta;
  /** 1-based slide for multi-slide templates. */
  slide?: number;
  /** Override the template's default colorway for this card. */
  colorway?: ColorwayId;
}

export function TemplateCard({ meta, slide, colorway }: TemplateCardProps) {
  const [def, setDef] = useState<TemplateDef | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadTemplate(meta.id).then(
      (t) => {
        if (live) setDef(t);
      },
      () => {
        if (live) setFailed(true);
      },
    );
    return () => {
      live = false;
    };
  }, [meta.id]);

  const way = colorway ?? meta.defaultColorway;
  const ratio = meta.canvas.h / meta.canvas.w;

  return (
    <Link
      href={`/studio/${meta.id}/`}
      className="group block rounded-xl border border-line bg-surface-1 p-3 no-underline"
    >
      <div className="overflow-hidden rounded-lg border border-line-faint bg-canvas">
        {def ? (
          <ScaledStage w={meta.canvas.w} h={meta.canvas.h}>
            <TemplateStage template={def} colorway={way} slide={slide} />
          </ScaledStage>
        ) : (
          <div
            className="bg-surface-2"
            style={{ width: '100%', paddingTop: `${ratio * 100}%` }}
            aria-label={failed ? 'Template failed to load' : 'Loading template'}
          />
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="font-display text-[15px] font-semibold text-fg-1">
          {meta.name}
          {slide ? ` · slide ${slide}` : ''}
        </span>
        <span className="font-mono text-[11px] text-fg-3">
          {meta.canvas.w} x {meta.canvas.h}
        </span>
      </div>
      <p className="mt-1 text-[13px] leading-[1.45] text-fg-2">{meta.description}</p>
      <p className="mt-2 font-mono text-[11px] text-fg-3">
        {meta.canvas.label} · {COLORWAYS[way].label}
        {meta.slides ? ` · ${meta.slides} slides` : ''}
      </p>
    </Link>
  );
}
