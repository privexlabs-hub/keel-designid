'use client';

import { useId } from 'react';
import { Icon, ICON_NAMES, type IconName } from '@/brand/icons';
import { COLORWAYS, type ColorwayId, type SlotId } from '@/brand/tokens';
import type { FieldDef, FieldValue, ListItemValue } from '@/templates/types';
import { useAssets } from './store';

/**
 * Renders one schema field. Every control is driven by the template's own
 * `FieldDef`, so a new template gets a working inspector for free — and no
 * template can offer an off-brand choice, because colour fields select a
 * colorway SLOT, never a hex value.
 */
export function FieldControl({
  field,
  value,
  colorway,
  onChange,
}: {
  field: FieldDef;
  value: FieldValue | undefined;
  colorway: ColorwayId;
  onChange: (v: FieldValue) => void;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3">
        <span className="text-fg-1" style={{ fontSize: 12.5, fontWeight: 550 }}>
          {field.label}
        </span>
        <Counter field={field} value={value} />
      </label>

      <Control id={id} field={field} value={value} colorway={colorway} onChange={onChange} />

      {field.hint ? (
        <span className="text-fg-3" style={{ fontSize: 11, lineHeight: 1.45 }}>
          {field.hint}
        </span>
      ) : null}
    </div>
  );
}

function Counter({ field, value }: { field: FieldDef; value: FieldValue | undefined }) {
  if ((field.kind !== 'text' && field.kind !== 'longtext') || !field.max) return null;
  const len = typeof value === 'string' ? value.length : 0;
  const over = len > field.max;
  return (
    <span
      className="font-mono"
      style={{ fontSize: 10, color: over ? 'var(--danger)' : 'var(--fg-3)' }}
    >
      {len}/{field.max}
    </span>
  );
}

const INPUT =
  'w-full rounded-md border bg-surface-1 px-2.5 py-2 text-fg-1 outline-none';
const INPUT_STYLE = { borderColor: 'var(--border)', fontSize: 13, minHeight: 38 } as const;

function Control({
  id,
  field,
  value,
  colorway,
  onChange,
}: {
  id: string;
  field: FieldDef;
  value: FieldValue | undefined;
  colorway: ColorwayId;
  onChange: (v: FieldValue) => void;
}) {
  switch (field.kind) {
    case 'text':
      return (
        <input
          id={id}
          className={INPUT}
          style={INPUT_STYLE}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'longtext':
      return (
        <textarea
          id={id}
          className={INPUT}
          style={{ ...INPUT_STYLE, lineHeight: 1.5, resize: 'vertical' }}
          rows={field.rows ?? 3}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'number':
      return (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="number"
            className={INPUT}
            style={INPUT_STYLE}
            value={typeof value === 'number' ? value : Number(value ?? 0)}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          {field.suffix ? (
            <span className="font-mono text-fg-3" style={{ fontSize: 11 }}>
              {field.suffix}
            </span>
          ) : null}
        </div>
      );

    case 'select':
      return (
        <select
          id={id}
          className={INPUT}
          style={INPUT_STYLE}
          value={typeof value === 'string' ? value : field.options[0]?.value}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case 'boolean':
      return (
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => onChange(!value)}
          className="flex items-center gap-2.5 self-start rounded-md border px-2.5 py-2"
          style={{
            borderColor: value ? 'var(--action-weak-bd)' : 'var(--border)',
            background: value ? 'var(--action-weak)' : 'var(--surface-1)',
            minHeight: 38,
            fontSize: 12.5,
          }}
        >
          <span
            className="flex items-center rounded-full p-0.5"
            style={{
              width: 32,
              background: value ? 'var(--action)' : 'var(--surface-3)',
              justifyContent: value ? 'flex-end' : 'flex-start',
            }}
          >
            <span className="block h-3.5 w-3.5 rounded-full" style={{ background: 'var(--surface-1)' }} />
          </span>
          <span style={{ color: value ? 'var(--action)' : 'var(--fg-2)' }}>
            {value ? 'On' : 'Off'}
          </span>
        </button>
      );

    case 'color': {
      const slots = field.slots;
      const current = (typeof value === 'string' ? value : slots[0]) as SlotId;
      return (
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby={id}>
          {slots.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={current === s}
              aria-label={s}
              onClick={() => onChange(s)}
              className="rounded-md border"
              style={{
                width: 34,
                height: 34,
                background: COLORWAYS[colorway].slots[s],
                borderColor: current === s ? 'var(--action)' : 'var(--border)',
                borderWidth: current === s ? 2 : 1,
              }}
              title={s}
            />
          ))}
        </div>
      );
    }

    case 'icon': {
      const options = field.options ?? ICON_NAMES;
      const current = (typeof value === 'string' ? value : options[0]) as IconName;
      return (
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby={id}>
          {options.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={current === n}
              aria-label={n}
              title={n}
              onClick={() => onChange(n)}
              className="flex items-center justify-center rounded-md border"
              style={{
                width: 34,
                height: 34,
                borderColor: current === n ? 'var(--action)' : 'var(--border)',
                background: current === n ? 'var(--action-weak)' : 'var(--surface-1)',
                color: current === n ? 'var(--action)' : 'var(--fg-2)',
              }}
            >
              <Icon name={n} size={16} />
            </button>
          ))}
        </div>
      );
    }

    case 'image':
      return <ImageControl id={id} value={value} onChange={onChange} />;

    case 'list':
      return <ListControl field={field} value={value} colorway={colorway} onChange={onChange} />;
  }
}

function ImageControl({
  id,
  value,
  onChange,
}: {
  id: string;
  value: FieldValue | undefined;
  onChange: (v: FieldValue) => void;
}) {
  const add = useAssets((s) => s.add);
  const assets = useAssets((s) => s.assets);
  const current = typeof value === 'string' ? value : '';
  const asset = current.startsWith('asset-') ? assets[current] : undefined;

  return (
    <div className="flex flex-col gap-2">
      {asset ? (
        <div className="flex items-center gap-2.5 rounded-md border p-2" style={{ borderColor: 'var(--border)' }}>
          {/* Local object URL; next/image is off in a static export anyway. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4 }} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-fg-1" style={{ fontSize: 12 }}>{asset.name}</span>
            <span className="font-mono text-fg-3" style={{ fontSize: 10 }}>
              {asset.width}x{asset.height}
            </span>
          </span>
        </div>
      ) : null}
      <input
        id={id}
        type="file"
        accept="image/*"
        className="text-fg-2"
        style={{ fontSize: 12 }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const a = await add(file);
          onChange(a.id);
        }}
      />
      {current && !asset ? (
        <span className="text-fg-3" style={{ fontSize: 11 }}>
          Using the template&rsquo;s built-in image.
        </span>
      ) : null}
    </div>
  );
}

function ListControl({
  field,
  value,
  colorway,
  onChange,
}: {
  field: Extract<FieldDef, { kind: 'list' }>;
  value: FieldValue | undefined;
  colorway: ColorwayId;
  onChange: (v: FieldValue) => void;
}) {
  const items: ListItemValue[] = Array.isArray(value) ? value : [];

  const update = (i: number, key: string, v: FieldValue) => {
    const next = items.map((it, n) => (n === i ? { ...it, [key]: v } : it));
    onChange(next);
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <div
          key={item._k ?? i}
          className="flex flex-col gap-2 rounded-md border p-2.5"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-fg-3" style={{ fontSize: 10 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="flex gap-1">
              <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0} icon="arrowUp" />
              <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1} icon="arrowDown" />
              <IconBtn
                label="Remove"
                icon="x"
                disabled={items.length <= field.min}
                onClick={() => onChange(items.filter((_, n) => n !== i))}
              />
            </span>
          </div>
          {field.fields.map((f) => (
            <FieldControl
              key={f.key}
              field={f}
              value={item[f.key]}
              colorway={colorway}
              onChange={(v) => update(i, f.key, v)}
            />
          ))}
        </div>
      ))}

      {items.length < field.max ? (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...items,
              { _k: `k${Date.now().toString(36)}${items.length}` } as ListItemValue,
            ])
          }
          className="self-start rounded-md border px-2.5 py-2 text-action"
          style={{ borderColor: 'var(--action-weak-bd)', background: 'var(--action-weak)', fontSize: 12.5, minHeight: 38 }}
        >
          Add item
        </button>
      ) : null}
    </div>
  );
}

function IconBtn({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: IconName;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded border"
      style={{
        width: 26,
        height: 26,
        borderColor: 'var(--border)',
        background: 'var(--surface-1)',
        color: disabled ? 'var(--fg-3)' : 'var(--fg-2)',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Icon name={icon} size={13} />
    </button>
  );
}
