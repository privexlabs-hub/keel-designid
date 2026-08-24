/**
 * Turning "export all of it" into a concrete list of files.
 *
 * Pure and index-driven: given a scope and the template index, produce the
 * `BatchJob[]` that `runBatch` consumes. Keeping this separate from both the
 * runner and the UI means the job list can be counted and sized before a
 * single pixel is rendered — which is what lets the console warn you that
 * "everything" is 1.4 GB before you start it rather than after.
 */
import type { ColorwayId } from '@/brand/tokens';
import type { TemplateMeta } from '@/templates/registry';
import type { TemplateCategory } from '@/templates/types';
import type { BatchJob } from './batch';
import { FORMATS, type ExportFormat } from './formats';

export type JobScope = 'design' | 'slides' | 'colorways' | 'category' | 'everything';

export interface JobSpec {
  scope: JobScope;
  formats: ExportFormat[];
  /** Raster scales. Ignored for vector formats. */
  scales: number[];
  /** Required for 'design', 'slides' and 'colorways'. */
  templateId?: string;
  /** Required for 'category'. */
  category?: TemplateCategory;
  /** The colourway currently chosen for a template, when one is open. */
  activeColorway?: ColorwayId;
  /** 0-based active slide, for the single-design scope. */
  activeSlide?: number;
  /** Colourways to cover for the 'colorways' scope. */
  colorways?: ColorwayId[];
}

function slidesOf(meta: TemplateMeta): number {
  return meta.slides ?? 1;
}

/**
 * `slide` is ZERO-BASED throughout, matching `exportFileName` (which adds one
 * for the human-facing filename) and the editor's own `ExportPanel`. Mixing
 * the two conventions produces an archive numbered 02..11.
 */
function jobFor(
  meta: TemplateMeta,
  colorway: string,
  format: ExportFormat,
  scale: number,
  slide?: number,
): BatchJob {
  const total = slidesOf(meta);
  return {
    id: `${meta.id}:${colorway}:${slide ?? 0}:${format}:${scale}`,
    templateId: meta.id,
    templateName: meta.name,
    category: meta.category,
    colorway,
    format,
    width: meta.canvas.w,
    height: meta.canvas.h,
    scale,
    slide: total > 1 ? slide : undefined,
    totalSlides: total > 1 ? total : undefined,
  };
}

/** Vector formats ignore scale, so emitting one per scale would duplicate files. */
function scalesFor(format: ExportFormat, scales: number[]): number[] {
  return FORMATS[format].scalable ? scales : [1];
}

export function buildJobs(spec: JobSpec, index: readonly TemplateMeta[]): BatchJob[] {
  const jobs: BatchJob[] = [];
  const push = (meta: TemplateMeta, colorway: string, slide?: number) => {
    for (const format of spec.formats) {
      for (const scale of scalesFor(format, spec.scales)) {
        jobs.push(jobFor(meta, colorway, format, scale, slide));
      }
    }
  };

  const find = (id?: string) => index.find((t) => t.id === id);

  switch (spec.scope) {
    case 'design': {
      const meta = find(spec.templateId);
      if (!meta) break;
      const colorway = spec.activeColorway ?? meta.defaultColorway;
      push(meta, colorway, slidesOf(meta) > 1 ? (spec.activeSlide ?? 0) : undefined);
      break;
    }

    case 'slides': {
      const meta = find(spec.templateId);
      if (!meta) break;
      const colorway = spec.activeColorway ?? meta.defaultColorway;
      const total = slidesOf(meta);
      if (total === 1) {
        push(meta, colorway);
        break;
      }
      for (let i = 0; i < total; i++) push(meta, colorway, i);
      break;
    }

    case 'colorways': {
      const meta = find(spec.templateId);
      if (!meta) break;
      const ways = spec.colorways ?? [meta.defaultColorway];
      for (const way of ways) {
        push(meta, way, slidesOf(meta) > 1 ? (spec.activeSlide ?? 0) : undefined);
      }
      break;
    }

    case 'category': {
      for (const meta of index.filter((t) => t.category === spec.category)) {
        const total = slidesOf(meta);
        if (total > 1) for (let i = 0; i < total; i++) push(meta, meta.defaultColorway, i);
        else push(meta, meta.defaultColorway);
      }
      break;
    }

    case 'everything': {
      for (const meta of index) {
        const total = slidesOf(meta);
        if (total > 1) for (let i = 0; i < total; i++) push(meta, meta.defaultColorway, i);
        else push(meta, meta.defaultColorway);
      }
      break;
    }
  }

  return jobs;
}

export interface Preset {
  id: string;
  label: string;
  description: string;
  spec: Omit<JobSpec, 'templateId' | 'category' | 'activeColorway' | 'activeSlide' | 'colorways'>;
  /** Presets that only make sense with a template open. */
  needsTemplate?: boolean;
}

/**
 * The three exports people actually ask for. "Everything" is deliberately not
 * a preset — it is available as a scope, behind a size estimate.
 */
export const PRESETS: Preset[] = [
  {
    id: 'post',
    label: 'This design',
    description: 'The frame on screen, at retina resolution.',
    spec: { scope: 'design', formats: ['png'], scales: [2] },
    needsTemplate: true,
  },
  {
    id: 'deck',
    label: 'Every slide',
    description: 'All slides of this template, in order, ready to upload as a carousel.',
    spec: { scope: 'slides', formats: ['png'], scales: [2] },
    needsTemplate: true,
  },
  {
    id: 'handoff',
    label: 'Handoff pack',
    description: 'PNG for placing and SVG for editing, of every colourway this template allows.',
    spec: { scope: 'colorways', formats: ['png', 'svg'], scales: [2] },
    needsTemplate: true,
  },
];
