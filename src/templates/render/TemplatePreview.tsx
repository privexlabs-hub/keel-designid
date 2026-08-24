'use client';

/**
 * One template, rendered live at preview scale.
 *
 * Extracted from `TemplateCard` so the gallery, the library rail and the slide
 * filmstrip all render through the same path. The stage inside is still
 * exactly `canvas.w x canvas.h` — only the wrapper is scaled — so a preview and
 * an export are the same composition.
 *
 * Deliberately cheap: a shared IntersectionObserver, a module-level definition
 * cache, and `content-visibility` for off-screen rows. No worker, no offscreen
 * rasteriser, no blob cache — at rail scale a mounted stage is a few dozen
 * divs, and the machinery would cost more than it saves.
 */
import { useEffect, useRef, useState } from 'react';
import type { ColorwayId } from '@/brand/tokens';
import type { TemplateMeta } from '../registry';
import type {
  ExtraTextLayer,
  FieldValues,
  Overrides,
  TemplateDef,
} from '../types';
import { loadTemplateCached } from './loadCache';
import { ScaledStage } from './ScaledStage';
import { TemplateStage } from './TemplateStage';

export interface TemplatePreviewProps {
  meta: TemplateMeta;
  /**
   * An already-loaded definition. Pass this when the caller has one (the
   * filmstrip renders ten slides of the open template) to skip the import.
   */
  def?: TemplateDef | null;
  /** 1-based slide for multi-slide templates. */
  slide?: number;
  colorway?: ColorwayId;
  /** Live field values. Omit to render the template's defaults. */
  fields?: FieldValues;
  overrides?: Overrides;
  extraText?: ExtraTextLayer[];
  /** Fixed preview width in px. Omit to fill the parent. */
  width?: number;
  /** Defer the import and the mount until scrolled near. Default true. */
  lazy?: boolean;
  className?: string;
}

/**
 * One observer for every preview on the page. `rootMargin` starts the import
 * before a row is visible so scrolling does not reveal placeholders.
 */
let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function observe(el: Element, onEnter: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onEnter();
    return () => {};
  }
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        observer?.unobserve(entry.target);
        callbacks.delete(entry.target);
      }
    },
    { rootMargin: '400px 0px' },
  );
  callbacks.set(el, onEnter);
  observer.observe(el);
  return () => {
    observer?.unobserve(el);
    callbacks.delete(el);
  };
}

export function TemplatePreview({
  meta,
  def: given,
  slide,
  colorway,
  fields,
  overrides,
  extraText,
  width,
  lazy = true,
  className,
}: TemplatePreviewProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState<TemplateDef | null>(null);
  const [failed, setFailed] = useState(false);
  // `given` only means the definition is already in hand, so the import can be
  // skipped — it is NOT a reason to mount immediately. Conflating the two made
  // a ten-slide filmstrip mount ten full stages on open.
  const [near, setNear] = useState(!lazy);

  // A caller-supplied definition is used directly. Deriving it rather than
  // mirroring it into state keeps the two from drifting, and avoids a
  // set-state-in-effect round trip on every render.
  const def = given ?? loaded;

  useEffect(() => {
    if (near || !hostRef.current) return;
    return observe(hostRef.current, () => setNear(true));
  }, [near]);

  useEffect(() => {
    if (!near || given) return;
    let live = true;
    loadTemplateCached(meta.id).then(
      (t) => {
        if (live) {
          setLoaded(t);
          setFailed(false);
        }
      },
      () => {
        if (live) setFailed(true);
      },
    );
    return () => {
      live = false;
    };
  }, [near, given, meta.id]);

  const ratio = meta.canvas.h / meta.canvas.w;
  const ready = def && def.id === meta.id;

  return (
    <div
      ref={hostRef}
      className={className}
      // A preview contains a real `[data-stage]` node, so a page showing the
      // rail has several of them. This marks the ones that are thumbnails:
      // the editor's own stage is the one inside the Preview region, and
      // anything reaching for it should use a ref or scope the query.
      data-thumbnail=""
      style={{
        // Off-screen rows skip layout and paint entirely; the intrinsic size
        // keeps the scrollbar honest while they do.
        contentVisibility: 'auto',
        containIntrinsicSize: width ? `${width}px ${Math.round(width * ratio)}px` : 'auto 240px',
      }}
    >
      {ready ? (
        <ScaledStage w={meta.canvas.w} h={meta.canvas.h} width={width}>
          <TemplateStage
            template={def}
            fields={fields}
            colorway={colorway}
            slide={slide}
            overrides={overrides}
            extraText={extraText}
          />
        </ScaledStage>
      ) : (
        <div
          className="bg-surface-2"
          style={{ width: width ?? '100%', paddingTop: `${ratio * 100}%` }}
          role="img"
          aria-label={failed ? `${meta.name} failed to load` : `Loading ${meta.name}`}
        />
      )}
    </div>
  );
}
