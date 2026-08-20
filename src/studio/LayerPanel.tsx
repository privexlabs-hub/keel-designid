'use client';

import { useMemo } from 'react';
import { Icon } from '@/brand/icons';
import { SLOT_IDS, type SlotId } from '@/brand/tokens';
import { rampFor } from '@/templates/ramp';
import type { ComposeCtx, FieldValues, LayerNode, TemplateDef } from '@/templates/types';
import { useDoc, useUI, withHistoryTransaction } from './store';

/**
 * Per-layer adjustments.
 *
 * Overrides are keyed by the layer's STABLE id, which `compose()` derives from
 * role (and slide, and repeat-item key) rather than array position. That is
 * what lets a nudge survive an unrelated content edit — and why a list
 * reordering never transfers one layer's adjustment to another.
 */
export function LayerPanel({
  template,
  fields,
  slide,
}: {
  template: TemplateDef;
  fields: FieldValues;
  slide: number;
}) {
  const { colorway, overrides, patchOverride, clearOverride, extraLayers, addTextLayer, removeTextLayer, updateTextLayer } =
    useDoc();
  const { selectedLayerId, select } = useUI();

  const nodes = useMemo(() => {
    const ctx: ComposeCtx = {
      canvas: template.canvas,
      colorway,
      slide: template.slides ? slide : undefined,
      t: rampFor(template.canvas),
    };
    const flat: LayerNode[] = [];
    const walk = (list: LayerNode[]) => {
      for (const n of list) {
        flat.push(n);
        if (n.children) walk(n.children);
      }
    };
    walk(template.compose(fields, ctx));
    return flat;
  }, [template, fields, colorway, slide]);

  const selected = nodes.find((n) => n.id === selectedLayerId);
  const o = selectedLayerId ? (overrides[selectedLayerId] ?? {}) : {};

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
          Layers
        </h2>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {nodes.map((n) => {
            const active = n.id === selectedLayerId;
            const hidden = overrides[n.id]?.hidden;
            const adjusted = Boolean(overrides[n.id]);
            return (
              <li key={n.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => select(active ? null : n.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2.5 py-2 text-left"
                  style={{
                    borderColor: active ? 'var(--action)' : 'var(--border)',
                    background: active ? 'var(--action-weak)' : 'var(--surface-1)',
                    minHeight: 38,
                  }}
                >
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate"
                      style={{ fontSize: 12.5, color: hidden ? 'var(--fg-3)' : 'var(--fg-1)' }}
                    >
                      {n.id}
                    </span>
                    <span className="block font-mono text-fg-3" style={{ fontSize: 10 }}>
                      {n.block}
                      {adjusted ? ' · adjusted' : ''}
                    </span>
                  </span>
                  {n.locked ? (
                    <span className="text-fg-3" title="Locked">
                      <Icon name="shield" size={13} />
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  aria-label={hidden ? `Show ${n.id}` : `Hide ${n.id}`}
                  title={hidden ? 'Show' : 'Hide'}
                  disabled={n.locked}
                  onClick={() => patchOverride(n.id, { hidden: !hidden })}
                  className="flex items-center justify-center rounded-md border"
                  style={{
                    width: 34,
                    height: 34,
                    borderColor: 'var(--border)',
                    background: 'var(--surface-1)',
                    color: hidden ? 'var(--fg-3)' : 'var(--fg-1)',
                    opacity: n.locked ? 0.4 : 1,
                  }}
                >
                  <Icon name={hidden ? 'minus' : 'gauge'} size={13} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {selected ? (
        <section className="flex flex-col gap-4">
          <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
            Adjust · {selected.id}
          </h2>

          <Nudge
            label="Horizontal"
            value={o.dx ?? 0}
            onChange={(dx) => patchOverride(selected.id, { dx })}
          />
          <Nudge
            label="Vertical"
            value={o.dy ?? 0}
            onChange={(dy) => patchOverride(selected.id, { dy })}
          />

          <Slider
            label="Scale"
            min={0.25}
            max={2.5}
            step={0.01}
            value={o.scale ?? 1}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(scale) => patchOverride(selected.id, { scale })}
          />

          <Slider
            label="Font size"
            min={8}
            max={320}
            step={1}
            value={o.fontSize ?? 0}
            format={(v) => (v ? `${Math.round(v)}px` : 'from ramp')}
            onChange={(fontSize) => patchOverride(selected.id, { fontSize: fontSize || undefined })}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-fg-1" style={{ fontSize: 12.5, fontWeight: 550 }}>
              Colour slot
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(SLOT_IDS as readonly SlotId[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={o.colorSlot === s}
                  onClick={() =>
                    patchOverride(selected.id, { colorSlot: o.colorSlot === s ? undefined : s })
                  }
                  className="rounded-md border px-2 py-1.5 font-mono"
                  style={{
                    fontSize: 10.5,
                    borderColor: o.colorSlot === s ? 'var(--action)' : 'var(--border)',
                    background: o.colorSlot === s ? 'var(--action-weak)' : 'var(--surface-1)',
                    color: o.colorSlot === s ? 'var(--action)' : 'var(--fg-2)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => clearOverride(selected.id)}
            className="self-start rounded-md border px-3 py-2"
            style={{ borderColor: 'var(--border)', fontSize: 12.5, minHeight: 38 }}
          >
            Reset this layer
          </button>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="uppercase text-fg-3" style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}>
          Added text
        </h2>
        {extraLayers.map((l) => (
          <div
            key={l.id}
            className="flex flex-col gap-2 rounded-md border p-2.5"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <textarea
              value={l.text}
              rows={2}
              onChange={(e) => updateTextLayer(l.id, { text: e.target.value })}
              className="w-full rounded border bg-surface-1 px-2 py-1.5 text-fg-1"
              style={{ borderColor: 'var(--border)', fontSize: 12.5 }}
            />
            <div className="flex items-center gap-2">
              <Slider
                label="Size"
                min={12}
                max={240}
                step={1}
                value={l.size}
                format={(v) => `${v}px`}
                onChange={(size) => updateTextLayer(l.id, { size })}
              />
            </div>
            <button
              type="button"
              onClick={() => removeTextLayer(l.id)}
              className="self-start rounded border px-2 py-1.5 text-danger"
              style={{ borderColor: 'var(--danger-weak-bd)', background: 'var(--danger-weak)', fontSize: 11.5 }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addTextLayer()}
          className="self-start rounded-md border px-3 py-2 text-action"
          style={{ borderColor: 'var(--action-weak-bd)', background: 'var(--action-weak)', fontSize: 12.5, minHeight: 38 }}
        >
          Add a text layer
        </button>
      </section>
    </div>
  );
}

/** Arrow-key nudging: 1px, or 10px with shift. */
function Nudge({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-fg-1" style={{ fontSize: 12.5, fontWeight: 550 }}>
        {label}
      </span>
      <span className="flex items-center gap-1.5">
        <StepBtn label={`${label} minus`} onClick={() => onChange(value - 1)} rotate={180} />
        <input
          type="number"
          value={Math.round(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault();
              const step = e.shiftKey ? 10 : 1;
              withHistoryTransaction(() => onChange(value + (e.key === 'ArrowUp' ? step : -step)));
            }
          }}
          className="rounded-md border bg-surface-1 px-2 py-1.5 text-center font-mono text-fg-1"
          style={{ width: 66, borderColor: 'var(--border)', fontSize: 12 }}
        />
        <StepBtn label={`${label} plus`} onClick={() => onChange(value + 1)} />
      </span>
    </div>
  );
}

function StepBtn({ label, onClick, rotate = 0 }: { label: string; onClick: () => void; rotate?: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center rounded border"
      style={{ width: 30, height: 30, borderColor: 'var(--border)', background: 'var(--surface-1)', color: 'var(--fg-2)' }}
    >
      <span style={{ display: 'inline-flex', transform: `rotate(${rotate}deg)` }}>
        <Icon name="chevronRight" size={13} />
      </span>
    </button>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  format,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <span className="flex items-baseline justify-between">
        <span className="text-fg-1" style={{ fontSize: 12.5, fontWeight: 550 }}>
          {label}
        </span>
        <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
          {format(value)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        // A drag is one undo entry, not forty: pause history for the gesture
        // and let it land on pointer release.
        onPointerDown={() => useDoc.temporal.getState().pause()}
        onPointerUp={() => useDoc.temporal.getState().resume()}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: 'var(--action)' }}
      />
    </div>
  );
}
