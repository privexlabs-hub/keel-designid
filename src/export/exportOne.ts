/**
 * Export one design, in any supported format, from a live stage node.
 * This is the single entry point the editor and the batch runner both use, so
 * a preview and a batch export can never diverge in behaviour.
 */

import { saveAs } from 'file-saver';
import { rasterize, warmExportContext } from './raster';
import { stageToSvg, svgToBlob } from './svg';
import { FORMATS, exportFileName, isRaster, type ExportFormat } from './formats';
import { clampScale } from './limits';
import type { ColorwayId } from '@/brand/tokens';

export interface ExportRequest {
  stage: HTMLElement;
  width: number;
  height: number;
  format: ExportFormat;
  colorway: ColorwayId;
  scale?: number;
  quality?: number;
  templateName: string;
  slide?: number;
  totalSlides?: number;
}

export interface ExportOutcome {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  /** Set when the requested scale had to be reduced. */
  notice?: string;
}

export async function exportOne(req: ExportRequest): Promise<ExportOutcome> {
  const { stage, width, height, format, colorway } = req;
  const scale = req.scale ?? 1;

  const filename = exportFileName({
    template: req.templateName,
    colorway,
    format,
    slide: req.slide,
    totalSlides: req.totalSlides,
    scale,
  });

  await warmExportContext();

  if (format === 'svg') {
    const svg = await stageToSvg(stage, { width, height, colorway });
    return { blob: svgToBlob(svg), filename, width, height };
  }

  if (format === 'pdf') {
    // Rendered from a 2x raster. A vector PDF via the SVG path is possible but
    // its text handling is weaker than the raster path, so this is the default.
    const png = await rasterize(stage, {
      width,
      height,
      format: 'jpeg',
      scale: Math.min(2, clampScale(width, height, 2).scale),
      quality: 0.94,
      background: undefined,
    });
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      unit: 'px',
      format: [width, height],
      orientation: width >= height ? 'landscape' : 'portrait',
      compress: true,
    });
    const dataUrl = await blobToDataUrl(png.blob);
    doc.addImage(dataUrl, 'JPEG', 0, 0, width, height, undefined, 'FAST');
    return { blob: doc.output('blob'), filename, width, height };
  }

  if (!isRaster(format)) throw new Error(`Unsupported format: ${format}`);

  const out = await rasterize(stage, {
    width,
    height,
    format,
    scale,
    quality: req.quality ?? (FORMATS[format].lossy ? 0.92 : undefined),
  });

  return {
    blob: out.blob,
    filename,
    width: out.width,
    height: out.height,
    notice: out.clamp.reason,
  };
}

/** Export and hand the file to the user. */
export async function downloadOne(req: ExportRequest): Promise<ExportOutcome> {
  const out = await exportOne(req);
  saveAs(out.blob, out.filename);
  return out;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error ?? new Error('Could not read blob'));
    fr.readAsDataURL(blob);
  });
}
