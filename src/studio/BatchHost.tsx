'use client';

/**
 * The off-screen stage a batch export renders through.
 *
 * `batch.ts` deliberately does not know how to draw anything — it delegates via
 * `JobRenderer` because mounting React is the studio's business. This is that
 * renderer: mount one stage at exact size, wait for it to be real, export it,
 * unmount, next.
 *
 * THE RULE THAT MATTERS: the host is `opacity: 0`, never `display: none`,
 * `visibility: hidden`, or `contain: size`. All of those skip layout, and a
 * stage with no layout rasterises to a blank image without throwing — the same
 * silent-empty-output failure `limits.ts` documents for Safari's canvas cap.
 * Opacity keeps a full box and full computed styles, which is exactly what the
 * exporter clones.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ColorwayId } from '@/brand/tokens';
import { loadTemplateCached } from '@/templates/render/loadCache';
import { TemplateStage } from '@/templates/render/TemplateStage';
import type {
  ExtraTextLayer,
  FieldValues,
  Overrides,
  TemplateDef,
} from '@/templates/types';
import type { BatchJob, JobRenderer } from '@/export/batch';
import { exportOne } from '@/export/exportOne';
import { useDoc, type DocEntry } from './store';

interface Mount {
  def: TemplateDef;
  fields: FieldValues;
  colorway: ColorwayId;
  slide?: number;
  overrides: Overrides;
  extraText: ExtraTextLayer[];
}

/**
 * The saved design for a template, if the user has edited it — so "export
 * everything" exports their work rather than the shipped defaults.
 */
function entryFor(templateId: string): DocEntry | null {
  const s = useDoc.getState();
  if (s.templateId === templateId) {
    return {
      schemaVersion: s.schemaVersion,
      colorway: s.colorway,
      values: s.values,
      slideValues: s.slideValues,
      overrides: s.overrides,
      extraLayers: s.extraLayers,
      updatedAt: Date.now(),
    };
  }
  return s.docs[templateId] ?? null;
}

export interface BatchHostHandle {
  render: JobRenderer;
  node: React.ReactNode;
}

export function useBatchHost(): BatchHostHandle {
  const [mount, setMount] = useState<Mount | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const readyResolve = useRef<(() => void) | null>(null);

  // Fires once the requested stage has actually been committed to the DOM.
  useEffect(() => {
    if (mount && readyResolve.current) {
      const resolve = readyResolve.current;
      readyResolve.current = null;
      resolve();
    }
  }, [mount]);

  const render = useCallback<JobRenderer>(async (job: BatchJob, signal: AbortSignal) => {
    const def = await loadTemplateCached(job.templateId);
    const entry = entryFor(job.templateId);

    const base = entry?.values ?? def.defaults;
    // `job.slide` is zero-based; TemplateStage wants a one-based slide number.
    const slideIndex = job.slide ?? 0;
    const perSlide = entry?.slideValues?.[slideIndex] ?? {};

    await new Promise<void>((resolve) => {
      readyResolve.current = resolve;
      setMount({
        def,
        fields: { ...base, ...perSlide },
        colorway: job.colorway as ColorwayId,
        slide: job.slide === undefined ? undefined : slideIndex + 1,
        overrides: entry?.overrides ?? {},
        extraText: entry?.extraLayers ?? [],
      });
    });

    // One frame for layout, then make sure the faces this stage needs are
    // genuinely loaded — a fallback rendering is worse than a failed job.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await document.fonts.ready;

    if (signal.aborted) throw new Error('cancelled');

    const stage = stageRef.current;
    if (!stage) throw new Error('the export stage did not mount');

    // Explicit width/height: nothing is ever inferred from a measured box.
    const out = await exportOne({
      stage,
      width: job.width,
      height: job.height,
      format: job.format,
      colorway: job.colorway as ColorwayId,
      scale: job.scale,
      templateName: job.templateName,
      slide: job.slide,
      totalSlides: job.totalSlides,
    });

    return out.blob;
  }, []);

  // Rendered inline rather than through a portal: the host is
  // `position: fixed`, so it is already out of flow and affects nothing around
  // it, and a portal would only add a document-ready dance for no benefit.
  const node = (
    <div
      aria-hidden
      data-export-host
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        // Laid out and painted, but invisible and untouchable. See the note at
        // the top of this file before changing any of these three.
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {mount ? (
        <TemplateStage
          ref={stageRef}
          template={mount.def}
          fields={mount.fields}
          colorway={mount.colorway}
          slide={mount.slide}
          overrides={mount.overrides}
          extraText={mount.extraText}
        />
      ) : null}
    </div>
  );

  return { render, node };
}
