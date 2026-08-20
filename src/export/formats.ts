/**
 * Export format definitions and the per-format capability matrix.
 *
 * The matrix is deliberately explicit: PNG, SVG and PDF cannot promise
 * identical output, and pretending otherwise produces bug reports. The studio
 * surfaces this to the user rather than hiding it.
 */

export type RasterFormat = 'png' | 'jpeg' | 'webp';
export type ExportFormat = RasterFormat | 'svg' | 'pdf';

export interface FormatSpec {
  id: ExportFormat;
  label: string;
  mime: string;
  ext: string;
  /** Raster formats honour the scale multiplier; vector ones do not. */
  scalable: boolean;
  /** False for JPEG — it has no alpha channel. */
  alpha: boolean;
  lossy: boolean;
  note: string;
}

export const FORMATS: Record<ExportFormat, FormatSpec> = {
  png: {
    id: 'png', label: 'PNG', mime: 'image/png', ext: 'png',
    scalable: true, alpha: true, lossy: false,
    note: 'Lossless with transparency. The default for anything with flat colour or text.',
  },
  jpeg: {
    id: 'jpeg', label: 'JPEG', mime: 'image/jpeg', ext: 'jpg',
    scalable: true, alpha: false, lossy: true,
    note: 'Smaller files, no transparency. Best for photographic fills.',
  },
  webp: {
    id: 'webp', label: 'WebP', mime: 'image/webp', ext: 'webp',
    scalable: true, alpha: true, lossy: true,
    note: 'Smaller than PNG at similar quality. Not accepted by every upload form.',
  },
  svg: {
    id: 'svg', label: 'SVG', mime: 'image/svg+xml', ext: 'svg',
    scalable: false, alpha: true, lossy: false,
    note: 'Vector, resolution independent. Text layout is reproduced from measurement, so complex shaping is not guaranteed — see the feature matrix.',
  },
  pdf: {
    id: 'pdf', label: 'PDF', mime: 'application/pdf', ext: 'pdf',
    scalable: true, alpha: false, lossy: true,
    note: 'Print ready, multi-page for carousels. Rendered from a 2x raster.',
  },
};

export const RASTER_FORMATS: RasterFormat[] = ['png', 'jpeg', 'webp'];

export function isRaster(f: ExportFormat): f is RasterFormat {
  return f === 'png' || f === 'jpeg' || f === 'webp';
}

/**
 * What each format can and cannot carry. Surfaced in the export UI so the
 * choice is informed rather than a surprise.
 */
export interface CapabilityRow {
  feature: string;
  png: boolean;
  svg: boolean;
  pdf: boolean;
  detail?: string;
}

export const CAPABILITY_MATRIX: CapabilityRow[] = [
  { feature: 'Exact pixel dimensions', png: true, svg: true, pdf: true },
  { feature: 'Transparency', png: true, svg: true, pdf: false, detail: 'PDF composites onto the colorway background.' },
  { feature: 'Resolution independent', png: false, svg: true, pdf: true },
  { feature: 'Selectable / editable text', png: false, svg: true, pdf: false, detail: 'SVG text mode only; outline mode converts to paths.' },
  { feature: 'Gradients', png: true, svg: true, pdf: true },
  { feature: 'Drop shadows', png: true, svg: true, pdf: true },
  { feature: 'Uploaded images', png: true, svg: true, pdf: true, detail: 'Embedded as data URIs so the file is self-contained.' },
  { feature: 'Complex text shaping', png: true, svg: false, pdf: true, detail: 'Ligatures, kerning pairs and bidi are browser-shaped; SVG reproduces measured line breaks only.' },
  { feature: 'Multi-page', png: false, svg: false, pdf: true, detail: 'Carousels export as one PDF per deck.' },
];

/** Slug a template name into a safe, sortable filename component. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export interface FileNameParts {
  template: string;
  colorway: string;
  format: ExportFormat;
  slide?: number;
  totalSlides?: number;
  scale?: number;
}

/** keel-big-stat_teal@2x.png — carousel slides get a zero-padded index. */
export function exportFileName(p: FileNameParts): string {
  const spec = FORMATS[p.format];
  const slide =
    p.slide !== undefined && p.totalSlides && p.totalSlides > 1
      ? `-${String(p.slide + 1).padStart(2, '0')}`
      : '';
  const scale = spec.scalable && p.scale && p.scale !== 1 ? `@${p.scale}x` : '';
  return `keel-${slugify(p.template)}${slide}_${p.colorway}${scale}.${spec.ext}`;
}
