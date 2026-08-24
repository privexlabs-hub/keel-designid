'use client';

/**
 * A gallery card: one template, rendered live at preview scale, linking into
 * the editor.
 *
 * The preview itself lives in `TemplatePreview`, which the library rail and
 * the slide filmstrip also use — one render path, so a card, a rail row and an
 * exported file are always the same composition.
 */
import Link from 'next/link';
import type { ColorwayId } from '@/brand/tokens';
import { COLORWAYS } from '@/brand/tokens';
import type { TemplateMeta } from '../registry';
import { TemplatePreview } from './TemplatePreview';

export interface TemplateCardProps {
  meta: TemplateMeta;
  /** 1-based slide for multi-slide templates. */
  slide?: number;
  /** Override the template's default colorway for this card. */
  colorway?: ColorwayId;
}

export function TemplateCard({ meta, slide, colorway }: TemplateCardProps) {
  const way = colorway ?? meta.defaultColorway;

  return (
    <Link
      href={`/studio/${meta.id}/`}
      className="group block rounded-xl border border-line bg-surface-1 p-3 no-underline"
    >
      <div className="overflow-hidden rounded-lg border border-line-faint bg-canvas">
        <TemplatePreview meta={meta} slide={slide} colorway={way} />
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
