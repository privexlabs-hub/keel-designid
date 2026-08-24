'use client';

/**
 * The template library, kept on screen while you work.
 *
 * The point of a persistent rail rather than a modal picker is that choosing a
 * template stops being a commitment: with per-template state you can look at
 * something else and come back to find your copy, colourway and layer nudges
 * exactly as you left them.
 *
 * Previews render through the same `TemplatePreview` the gallery and the
 * filmstrip use, so a rail row and an exported file are the same composition.
 */
import { useMemo, useState } from 'react';
import { Icon } from '@/brand/icons';
import {
  CATEGORIES,
  TEMPLATE_INDEX,
  type CategorySpec,
  type TemplateMeta,
} from '@/templates/registry';
import type { TemplateCategory } from '@/templates/types';
import { TemplatePreview } from '@/templates/render/TemplatePreview';

export interface LibraryRailProps {
  activeId: string;
  onPick: (id: string) => void;
  className?: string;
  /** Rendered inside the mobile sheet, which supplies its own heading. */
  hideHeading?: boolean;
}

type Filter = TemplateCategory | 'all';

function matches(meta: TemplateMeta, needle: string, category: CategorySpec | undefined): boolean {
  if (!needle) return true;
  const haystack = [
    meta.name,
    meta.description,
    meta.canvas.label,
    `${meta.canvas.w}x${meta.canvas.h}`,
    category?.label ?? meta.category,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

export function LibraryRail({ activeId, onPick, className, hideHeading }: LibraryRailProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const map = new Map<TemplateCategory, number>();
    for (const t of TEMPLATE_INDEX) map.set(t.category, (map.get(t.category) ?? 0) + 1);
    return map;
  }, []);

  const needle = query.trim().toLowerCase();

  const groups = useMemo(() => {
    return CATEGORIES.filter((c) => filter === 'all' || c.id === filter).map((category) => ({
      category,
      items: TEMPLATE_INDEX.filter(
        (t) => t.category === category.id && matches(t, needle, category),
      ),
    }));
  }, [filter, needle]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className={`flex min-h-0 flex-col ${className ?? ''}`}>
      {hideHeading ? null : (
        <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
          <h2
            className="uppercase text-fg-3"
            style={{ fontSize: 10, letterSpacing: '0.1em', fontWeight: 600 }}
          >
            Templates
          </h2>
        </div>
      )}

      {/* search */}
      <div className="px-4 pt-3">
        <label className="sr-only" htmlFor="library-search">
          Search templates
        </label>
        <div
          className="flex items-center gap-2 rounded-md border px-2.5"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
        >
          <span className="text-fg-3">
            <Icon name="search" size={15} />
          </span>
          <input
            id="library-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or size"
            className="w-full bg-transparent py-2 text-fg-1 outline-none"
            style={{ fontSize: 12.5, minHeight: 36 }}
          />
        </div>
      </div>

      {/* category chips — a horizontal scroller, so a long list never widens
          the rail and trips the responsive check */}
      <div className="mt-3 flex gap-1.5 overflow-x-auto px-4 pb-3">
        <Chip label="All" count={TEMPLATE_INDEX.length} active={filter === 'all'} onClick={() => setFilter('all')} />
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            label={c.label}
            count={counts.get(c.id) ?? 0}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
          />
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        {total === 0 && needle ? (
          <p className="py-8 text-center text-fg-3" style={{ fontSize: 12.5 }}>
            Nothing matches “{query}”.
          </p>
        ) : null}

        {groups.map(({ category, items }) => {
          if (needle && items.length === 0) return null;
          return (
            <section key={category.id} className="mb-6">
              <div className="sticky top-0 z-1 -mx-1 bg-surface-1 px-1 pt-3 pb-2">
                <h3
                  className="uppercase text-fg-3"
                  style={{ fontSize: 9.5, letterSpacing: '0.11em', fontWeight: 600 }}
                >
                  {category.label}
                </h3>
                <p className="mt-0.5 font-mono text-fg-3" style={{ fontSize: 9.5 }}>
                  {category.dimensions.join(' · ')}
                </p>
              </div>

              {items.length === 0 ? (
                // Empty categories stay visible rather than being hidden. The
                // catalogue is still growing, and saying so is more useful than
                // pretending the category does not exist.
                <p className="text-fg-3" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                  {category.blurb} <span className="text-fg-3">None yet.</span>
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {items.map((meta) => (
                    <li key={meta.id}>
                      <RailItem meta={meta} active={meta.id === activeId} onPick={onPick} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const empty = count === 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5"
      style={{
        fontSize: 11,
        minHeight: 32,
        borderColor: active ? 'var(--action)' : 'var(--border)',
        background: active ? 'var(--action-weak)' : 'var(--surface-1)',
        color: active ? 'var(--action)' : empty ? 'var(--fg-3)' : 'var(--fg-2)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      <span className="font-mono" style={{ fontSize: 9.5, opacity: empty ? 0.7 : 1 }}>
        {count}
      </span>
    </button>
  );
}

function RailItem({
  meta,
  active,
  onPick,
}: {
  meta: TemplateMeta;
  active: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(meta.id)}
      aria-current={active ? 'true' : undefined}
      className="block w-full rounded-lg border p-2 text-left"
      style={{
        borderColor: active ? 'var(--action)' : 'var(--border)',
        borderWidth: active ? 2 : 1,
        background: active ? 'var(--action-weak)' : 'var(--surface-1)',
        minHeight: 44,
      }}
    >
      <span className="block overflow-hidden rounded border" style={{ borderColor: 'var(--border-faint)' }}>
        <TemplatePreview meta={meta} colorway={meta.defaultColorway} />
      </span>
      <span className="mt-2 flex items-baseline justify-between gap-2">
        <span
          className="truncate text-fg-1"
          style={{ fontSize: 12, fontWeight: active ? 600 : 550 }}
        >
          {meta.name}
        </span>
        <span className="shrink-0 font-mono text-fg-3" style={{ fontSize: 9.5 }}>
          {meta.canvas.w}x{meta.canvas.h}
        </span>
      </span>
      {meta.slides ? (
        <span className="mt-0.5 block font-mono text-fg-3" style={{ fontSize: 9.5 }}>
          {meta.slides} slides
        </span>
      ) : null}
    </button>
  );
}
