'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/brand/icons';
import { KeelLockup } from '@/brand/Logo';
import { COLORWAYS } from '@/brand/tokens';
import { ScaledStage } from '@/templates/render/ScaledStage';
import { TemplateStage } from '@/templates/render/TemplateStage';
import { loadTemplateCached } from '@/templates/render/loadCache';
import { templateMeta } from '@/templates/registry';
import type { CanvasSpec, FieldDef, FieldValues, LayerNode, TemplateDef } from '@/templates/types';
import { rampFor } from '@/templates/ramp';
import { FieldControl } from './FieldControl';
import { LayerPanel } from './LayerPanel';
import { ExportPanel } from './ExportPanel';
import { ColorwayStrip } from './ColorwayStrip';
import { Filmstrip } from './Filmstrip';
import { LibraryRail } from './LibraryRail';
import { RailSheet } from './RailSheet';
import { StageOverlay } from './StageOverlay';
import { useLayerInteraction } from './useLayerInteraction';
import { useStageIssues } from './useStageIssues';
import { switchTemplateWithHistory, useDoc, useUI } from './store';

/** Stand-in while the template loads; the issue pass is disabled until then. */
const EMPTY_CANVAS: CanvasSpec = {
  id: 'square1080',
  label: '',
  w: 1,
  h: 1,
  ramp: 1,
  pad: 0,
};

/**
 * The editor. One stage, one inspector.
 *
 * The stage rendered here is the SAME component the exporter rasterises, at
 * exact design pixels, wrapped (never itself transformed) by ScaledStage. That
 * is what makes what-you-see-is-what-you-get literally true.
 */
export function Editor({ templateId }: { templateId: string }) {
  const [template, setTemplate] = useState<TemplateDef | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const doc = useDoc();
  const ui = useUI();

  // The route prop is the STARTING template only. After mount the rail drives
  // `activeId` directly: pushing a route per click would remount the editor and
  // throw away the rail's scroll position mid-browse.
  const [activeId, setActiveId] = useState(templateId);
  const [railOpen, setRailOpen] = useState(false);

  // If the route prop changes under us (a real navigation rather than a rail
  // click), re-seed during render. Adjusting state in render is the supported
  // way to do this; an effect would render once with the stale template first.
  const [seededFrom, setSeededFrom] = useState(templateId);
  if (templateId !== seededFrom) {
    setSeededFrom(templateId);
    setActiveId(templateId);
  }

  useEffect(() => {
    let live = true;
    loadTemplateCached(activeId)
      .then((t) => {
        if (!live) return;
        setTemplate(t);
        setError(null);
        // Parks the outgoing design and unparks this one if it was edited
        // before, so browsing away and back is lossless. A no-op when the
        // persisted document is already this template — which is what makes a
        // reload restore your work rather than reset it.
        switchTemplateWithHistory({
          templateId: t.id,
          schemaVersion: t.schemaVersion,
          colorway: t.colorways[0],
          values: structuredClone(t.defaults),
        });
        useUI.getState().setSlide(0);
        useUI.getState().select(null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
    return () => {
      live = false;
    };
  }, [activeId]);

  // Keep the address bar honest without remounting. Every template route is
  // prerendered, so the URL stays a valid deep link and a refresh works.
  useEffect(() => {
    if (typeof window === 'undefined' || !activeId) return;
    const next = `/studio/${activeId}/`;
    if (window.location.pathname !== next) {
      window.history.replaceState(null, '', next);
    }
  }, [activeId]);

  const fields: FieldValues = useMemo(() => {
    if (!template) return {};
    const perSlide = template.slides ? (doc.slideValues[ui.slide] ?? {}) : {};
    return { ...doc.values, ...perSlide };
  }, [template, doc.values, doc.slideValues, ui.slide]);

  // The filmstrip needs each slide's merged values, not just the active one.
  const fieldsForSlide = useCallback(
    (index: number): FieldValues => ({ ...doc.values, ...(doc.slideValues[index] ?? {}) }),
    [doc.values, doc.slideValues],
  );

  const meta = template ? templateMeta(template.id) : undefined;

  // Locked layers refuse selection-drag; the layer list still lists them.
  const lockedIds = useMemo(() => {
    if (!template) return new Set<string>();
    const ctx = {
      canvas: template.canvas,
      colorway: doc.colorway,
      slide: template.slides ? ui.slide + 1 : undefined,
      t: rampFor(template.canvas),
    };
    const ids = new Set<string>();
    const walk = (nodes: LayerNode[]) => {
      for (const n of nodes) {
        if (n.locked) ids.add(n.id);
        if (n.children) walk(n.children);
      }
    };
    walk(template.compose(fields, ctx));
    return ids;
  }, [template, fields, doc.colorway, ui.slide]);

  const layerHandlers = useLayerInteraction(stageRef, lockedIds);

  // Any change to the composition invalidates the measured overlay boxes.
  const revision = useMemo(
    () => JSON.stringify([fields, doc.overrides, doc.colorway, ui.slide, doc.extraLayers]).length,
    [fields, doc.overrides, doc.colorway, ui.slide, doc.extraLayers],
  );

  const issues = useStageIssues(
    stageRef,
    template?.canvas ?? EMPTY_CANVAS,
    [revision],
    Boolean(template) && !ui.exporting,
  );

  if (error) {
    return (
      <main className="mx-auto max-w-[560px] px-6 py-24 text-center">
        <h1 className="font-display text-fg-1" style={{ fontSize: 24, fontWeight: 600 }}>
          That template could not be loaded
        </h1>
        <p className="mt-3 text-fg-2" style={{ fontSize: 14 }}>
          {error}
        </p>
        <Link href="/studio/" className="mt-6 inline-block text-action" style={{ fontSize: 13.5 }}>
          Back to the studio
        </Link>
      </main>
    );
  }

  if (!template) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <span className="text-fg-3" style={{ fontSize: 13 }}>
          Loading template…
        </span>
      </main>
    );
  }

  const { canvas } = template;
  const slideCount = template.slides ?? 1;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas lg:h-dvh lg:overflow-hidden">
      <EditorHeader template={template} onOpenLibrary={() => setRailOpen(true)} />

      <RailSheet
        open={railOpen}
        onClose={() => setRailOpen(false)}
        activeId={activeId}
        onPick={setActiveId}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* ---------------------------------------------------------- rail */}
        <LibraryRail
          activeId={activeId}
          onPick={setActiveId}
          className="hidden w-[288px] shrink-0 border-r border-line bg-surface-1 xl:flex"
        />

        {/* ---------------------------------------------------------- stage */}
        <section
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-5 p-5 sm:p-8 lg:overflow-auto"
          aria-label="Preview"
        >
          {/* The pointer handlers live on this wrapper, never on the stage
              node — that node is what the exporter rasterises and it stays a
              plain, untransformed box. */}
          <div className="w-full max-w-[640px] touch-none" {...layerHandlers}>
            <ScaledStage w={canvas.w} h={canvas.h} maxScale={1} className="w-full">
              <TemplateStage
                ref={stageRef}
                template={template}
                fields={fields}
                colorway={doc.colorway}
                slide={ui.slide + 1}
                overrides={doc.overrides}
                extraText={doc.extraLayers}
              />
              {/* Sibling of the stage, so export can never see it. */}
              <StageOverlay
                stageRef={stageRef}
                canvas={canvas}
                selectedLayerId={ui.selectedLayerId}
                issues={issues}
                showGuides={ui.guides}
                revision={revision}
              />
            </ScaledStage>
          </div>

          <div className="flex w-full max-w-[640px] flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="font-mono text-fg-3" style={{ fontSize: 11 }}>
                {canvas.w} x {canvas.h}
              </span>
              <ColorwayStrip colorways={template.colorways} />
            </div>

            {slideCount > 1 ? (
              <>
                {/* Numbers below sm, where a filmstrip would be thumbnails too
                    small to recognise; live previews from sm up. */}
                <div className="sm:hidden">
                  <SlidePicker count={slideCount} value={ui.slide} onChange={ui.setSlide} />
                </div>
                {meta ? (
                  <div className="hidden w-full sm:block">
                    <Filmstrip
                      template={template}
                      meta={meta}
                      count={slideCount}
                      value={ui.slide}
                      onChange={ui.setSlide}
                      fieldsFor={fieldsForSlide}
                    />
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </section>

        {/* ------------------------------------------------------ inspector */}
        <aside
          className="flex w-full shrink-0 flex-col border-t bg-surface-1 lg:w-[380px] lg:border-t-0 lg:border-l"
          style={{ borderColor: 'var(--border)' }}
          aria-label="Inspector"
        >
          <Tabs />
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {ui.tab === 'content' ? (
              <ContentTab template={template} fields={fields} />
            ) : ui.tab === 'style' ? (
              <StyleTab template={template} />
            ) : ui.tab === 'layers' ? (
              <LayerPanel template={template} fields={fields} slide={ui.slide + 1} />
            ) : (
              <ExportPanel template={template} stageRef={stageRef} slide={ui.slide} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function EditorHeader({
  template,
  onOpenLibrary,
}: {
  template: TemplateDef;
  onOpenLibrary: () => void;
}) {
  const { undo, redo, pastStates, futureStates } = useDoc.temporal.getState();
  const [, force] = useState(0);

  useEffect(() => useDoc.temporal.subscribe(() => force((n) => n + 1)), []);

  return (
    <header
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-surface-1 px-4 py-3 sm:px-6"
      style={{ borderColor: 'var(--border)' }}
    >
      <Link href="/studio/" className="flex items-center gap-2 text-fg-2 no-underline" style={{ fontSize: 12.5 }}>
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
          <Icon name="chevronRight" size={14} />
        </span>
        Studio
      </Link>

      {/* Below xl the rail has no column of its own, so it opens as a sheet. */}
      <button
        type="button"
        onClick={onOpenLibrary}
        className="flex items-center gap-2 rounded-md border px-2.5 text-fg-2 xl:hidden"
        style={{ borderColor: 'var(--border)', fontSize: 12.5, minHeight: 34 }}
      >
        <Icon name="layers" size={14} />
        Templates
      </button>

      <span className="hidden sm:block" style={{ width: 1, height: 18, background: 'var(--border)' }} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-fg-1" style={{ fontSize: 14, fontWeight: 600 }}>
          {template.name}
        </span>
      </span>

      <span className="flex items-center gap-1.5">
        <HeaderBtn label="Undo" icon="arrowUp" disabled={pastStates.length === 0} onClick={() => undo()} rotate={-90} />
        <HeaderBtn label="Redo" icon="arrowUp" disabled={futureStates.length === 0} onClick={() => redo()} rotate={90} />
      </span>

      <Link
        href="/studio/export/"
        className="flex items-center gap-2 rounded-md border px-2.5 text-fg-2 no-underline"
        style={{ borderColor: 'var(--border)', fontSize: 12.5, minHeight: 34 }}
        title="Export several files at once"
      >
        <Icon name="layers" size={14} />
        <span className="hidden sm:inline">Export kit</span>
      </Link>

      <span className="hidden xl:block">
        <KeelLockup size={20} subtitle={null} />
      </span>
    </header>
  );
}

function HeaderBtn({
  label,
  icon,
  onClick,
  disabled,
  rotate = 0,
}: {
  label: string;
  icon: 'arrowUp' | 'x';
  onClick: () => void;
  disabled?: boolean;
  rotate?: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded-md border"
      style={{
        width: 34,
        height: 34,
        borderColor: 'var(--border)',
        background: 'var(--surface-1)',
        color: disabled ? 'var(--fg-3)' : 'var(--fg-1)',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span style={{ display: 'inline-flex', transform: `rotate(${rotate}deg)` }}>
        <Icon name={icon} size={15} />
      </span>
    </button>
  );
}

const TABS = [
  { id: 'content', label: 'Content' },
  { id: 'style', label: 'Style' },
  { id: 'layers', label: 'Layers' },
  { id: 'export', label: 'Export' },
] as const;

function Tabs() {
  const { tab, setTab } = useUI();
  return (
    <div role="tablist" className="flex border-b" style={{ borderColor: 'var(--border)' }}>
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => setTab(t.id)}
            className="flex-1 border-b-2 px-2 py-3"
            style={{
              fontSize: 12.5,
              fontWeight: active ? 600 : 500,
              color: active ? 'var(--action)' : 'var(--fg-2)',
              borderColor: active ? 'var(--action)' : 'transparent',
              minHeight: 44,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ContentTab({ template, fields }: { template: TemplateDef; fields: FieldValues }) {
  const { setField, setSlideField, colorway } = useDoc();
  const slide = useUI((s) => s.slide);

  const groups = useMemo(() => {
    const m = new Map<string, FieldDef[]>();
    for (const f of template.fields) {
      // A field pinned to a slide only appears while that slide is showing.
      if (f.slide !== undefined && f.slide !== slide + 1) continue;
      const g = f.group ?? 'Content';
      m.set(g, [...(m.get(g) ?? []), f]);
    }
    return [...m.entries()];
  }, [template.fields, slide]);

  return (
    <div className="flex flex-col gap-7">
      {groups.map(([group, list]) => (
        <section key={group} className="flex flex-col gap-4">
          <h2
            className="uppercase text-fg-3"
            style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}
          >
            {group}
          </h2>
          {list.map((f) => (
            <FieldControl
              key={f.key}
              field={f}
              value={fields[f.key]}
              colorway={colorway}
              onChange={(v) =>
                f.slide !== undefined ? setSlideField(slide, f.key, v) : setField(f.key, v)
              }
            />
          ))}
        </section>
      ))}
    </div>
  );
}

function StyleTab({ template }: { template: TemplateDef }) {
  const { colorway, setColorway, clearAllOverrides, overrides } = useDoc();
  const count = Object.keys(overrides).length;

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-3">
        <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
          Colourway
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {template.colorways.map((id) => {
            const cw = COLORWAYS[id];
            const active = colorway === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setColorway(id)}
                data-colorway={id}
                className="flex flex-col gap-2 rounded-lg border bg-t-bg p-3 text-left"
                style={{
                  borderColor: active ? 'var(--action)' : 'var(--border)',
                  borderWidth: active ? 2 : 1,
                  backgroundImage: cw.bgImage,
                }}
              >
                <span className="text-t-fg" style={{ fontSize: 12, fontWeight: 600 }}>
                  {cw.label}
                </span>
                <span className="flex gap-1">
                  {(['bg', 'fg', 'accent'] as const).map((s) => (
                    <span
                      key={s}
                      className="h-3.5 flex-1 rounded-sm"
                      style={{ background: cw.slots[s], border: '1px solid var(--t-line)' }}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {count > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
            Layer adjustments
          </h2>
          <p className="text-fg-2" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
            {count} layer{count === 1 ? '' : 's'} nudged from the template default.
          </p>
          <button
            type="button"
            onClick={clearAllOverrides}
            className="self-start rounded-md border px-3 py-2"
            style={{ borderColor: 'var(--border)', fontSize: 12.5, minHeight: 38 }}
          >
            Reset all layers
          </button>
        </section>
      ) : null}
    </div>
  );
}

function SlidePicker({
  count,
  value,
  onChange,
}: {
  count: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Slides">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === value}
          onClick={() => onChange(i)}
          className="rounded font-mono"
          style={{
            width: 30,
            height: 30,
            fontSize: 11,
            border: `1px solid ${i === value ? 'var(--action)' : 'var(--border)'}`,
            background: i === value ? 'var(--action)' : 'var(--surface-1)',
            color: i === value ? 'var(--action-fg)' : 'var(--fg-2)',
          }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
