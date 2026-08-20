/**
 * Batch export.
 *
 * Design notes, each earned:
 *
 * - Concurrency is 1. The bottleneck is a single hidden stage plus main-thread
 *   rasterisation, so parallel jobs multiply peak memory without improving
 *   throughput. Speed comes from STORE compression and never touching base64.
 *
 * - Blobs go straight into the archive. A 3000x3000@2x PNG as a data URL is a
 *   ~90 MB JavaScript string that immediately doubles under UTF-16.
 *
 * - We yield to the browser between jobs so the progress UI paints and cancel
 *   stays responsive. requestIdleCallback is NOT used: on a busy main thread
 *   it can stall for seconds.
 *
 * - Concurrency 1 removes contention but not leaks. Object URLs, canvases and
 *   mounted stages are released per iteration.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { warmExportContext, releaseExportContext } from './raster';
import { estimateBytes, formatBytes, clampScale } from './limits';
import { FORMATS, exportFileName, type ExportFormat } from './formats';

export interface BatchJob {
  /** Stable id for progress reporting and retry. */
  id: string;
  templateId: string;
  templateName: string;
  category: string;
  colorway: string;
  format: ExportFormat;
  width: number;
  height: number;
  scale: number;
  slide?: number;
  totalSlides?: number;
}

export type JobState = 'queued' | 'running' | 'done' | 'failed' | 'skipped';

export interface JobProgress {
  job: BatchJob;
  state: JobState;
  error?: string;
  bytes?: number;
}

export interface BatchProgress {
  done: number;
  failed: number;
  total: number;
  current?: BatchJob;
  phase: 'rendering' | 'archiving' | 'complete' | 'cancelled';
  /** 0-1 while archiving. */
  archivePct?: number;
  jobs: JobProgress[];
}

/** Renders one job and returns its bytes. Supplied by the studio, which owns
 *  React mounting — this module stays framework-agnostic and testable. */
export type JobRenderer = (job: BatchJob, signal: AbortSignal) => Promise<Blob>;

export interface BatchOptions {
  /** Group files into per-category folders inside the archive. */
  foldered?: boolean;
  archiveName?: string;
  onProgress?: (p: BatchProgress) => void;
  signal?: AbortSignal;
  /** Save the archive when finished. Off for tests. */
  save?: boolean;
}

/** Yield to the event loop so the UI can paint and cancellation can land. */
function yieldToBrowser(): Promise<void> {
  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (s?.yield) return s.yield();
  return new Promise((resolve) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => {
      ch.port1.close();
      resolve();
    };
    ch.port2.postMessage(undefined);
  });
}

function pathFor(job: BatchJob, foldered: boolean): string {
  const name = exportFileName({
    template: job.templateName,
    colorway: job.colorway,
    format: job.format,
    slide: job.slide,
    totalSlides: job.totalSlides,
    scale: job.scale,
  });
  return foldered ? `${job.category}/${name}` : name;
}

/** Sum of decoded pixel bytes — the number that decides whether to warn. */
export function estimateBatch(jobs: BatchJob[]): { bytes: number; label: string } {
  const bytes = jobs.reduce((sum, j) => {
    const c = clampScale(j.width, j.height, j.scale);
    return sum + (FORMATS[j.format].id === 'svg' ? 200_000 : estimateBytes(j.width, j.height, c.scale));
  }, 0);
  return { bytes, label: formatBytes(bytes) };
}

export interface BatchResult {
  archive: Blob | null;
  succeeded: number;
  failed: JobProgress[];
  cancelled: boolean;
}

export async function runBatch(
  jobs: BatchJob[],
  render: JobRenderer,
  opts: BatchOptions = {},
): Promise<BatchResult> {
  const { foldered = true, onProgress, signal, save = true } = opts;

  const zip = new JSZip();
  const progress: JobProgress[] = jobs.map((job) => ({ job, state: 'queued' }));
  let done = 0;
  let failed = 0;
  let cancelled = false;

  const emit = (phase: BatchProgress['phase'], current?: BatchJob, archivePct?: number) =>
    onProgress?.({ done, failed, total: jobs.length, current, phase, archivePct, jobs: progress });

  await warmExportContext();

  try {
    for (let i = 0; i < jobs.length; i++) {
      if (signal?.aborted) {
        cancelled = true;
        for (let k = i; k < jobs.length; k++) progress[k].state = 'skipped';
        emit('cancelled');
        break;
      }

      const job = jobs[i];
      progress[i].state = 'running';
      emit('rendering', job);

      try {
        const blob = await render(job, signal ?? new AbortController().signal);
        // JSZip accepts a Blob directly and streams it — no base64 round trip.
        zip.file(pathFor(job, foldered), blob);
        progress[i].state = 'done';
        progress[i].bytes = blob.size;
        done++;
      } catch (err) {
        // One bad job never aborts the batch.
        progress[i].state = 'failed';
        progress[i].error = err instanceof Error ? err.message : String(err);
        failed++;
      }

      emit('rendering', job);
      await yieldToBrowser();
    }

    if (cancelled) return { archive: null, succeeded: done, failed: progress.filter((p) => p.state === 'failed'), cancelled };

    emit('archiving', undefined, 0);
    const archive = await zip.generateAsync(
      // PNG/JPEG/WebP are already compressed; deflating them again costs time
      // for almost no saving.
      { type: 'blob', compression: 'STORE' },
      (meta) => emit('archiving', undefined, meta.percent / 100),
    );

    if (save) {
      saveAs(archive, opts.archiveName ?? `keel-brand-kit-${stamp()}.zip`);
    }

    emit('complete');
    return { archive, succeeded: done, failed: progress.filter((p) => p.state === 'failed'), cancelled: false };
  } finally {
    releaseExportContext();
  }
}

/** Timestamp for archive names. Callers may pass their own name instead. */
function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
