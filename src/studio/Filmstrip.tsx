'use client';

/**
 * Slide navigation for carousels, as live previews rather than numbers.
 *
 * Each thumbnail is the real composition with the real copy, so you navigate
 * by recognising a slide instead of remembering what "7" was. The already
 * loaded `TemplateDef` is passed straight through, so ten slides cost zero
 * extra imports.
 *
 * What this deliberately does NOT do: add, duplicate, reorder or delete
 * slides. Slides come out of `compose(fields, ctx)` keyed on `ctx.slide` —
 * they are template structure, not user data, and no amount of UI here can
 * change that. Rendering greyed-out "+" and "duplicate" buttons would promise
 * a feature this engine will never have, so the caption says what is true
 * instead. Slide *content* is editable, and the dot marks the slides you have
 * edited.
 */
import type { TemplateMeta } from '@/templates/registry';
import { TemplatePreview } from '@/templates/render/TemplatePreview';
import type { FieldValues, TemplateDef } from '@/templates/types';
import { useDoc } from './store';

export interface FilmstripProps {
  template: TemplateDef;
  meta: TemplateMeta;
  count: number;
  /** 0-based active slide. */
  value: number;
  onChange: (index: number) => void;
  /** Merged base + per-slide values, by 0-based slide index. */
  fieldsFor: (index: number) => FieldValues;
}

const THUMB_WIDTH = 104;

export function Filmstrip({
  template,
  meta,
  count,
  value,
  onChange,
  fieldsFor,
}: FilmstripProps) {
  const slideValues = useDoc((s) => s.slideValues);
  const colorway = useDoc((s) => s.colorway);
  const overrides = useDoc((s) => s.overrides);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <p className="m-0 font-mono text-fg-3" style={{ fontSize: 10 }}>
        {count} slides · defined by the template
      </p>

      <div
        role="tablist"
        aria-label="Slides"
        className="flex max-w-full gap-2 overflow-x-auto px-1 pb-1"
      >
        {Array.from({ length: count }, (_, i) => {
          const on = i === value;
          const edited = Object.keys(slideValues[i] ?? {}).length > 0;
          return (
            <button
              key={i}
              role="tab"
              aria-selected={on}
              aria-label={`Slide ${i + 1}${edited ? ', edited' : ''}`}
              onClick={() => onChange(i)}
              className="relative shrink-0 rounded-md border p-1"
              style={{
                borderColor: on ? 'var(--action)' : 'var(--border)',
                borderWidth: on ? 2 : 1,
                background: on ? 'var(--action-weak)' : 'var(--surface-1)',
              }}
            >
              <span className="block overflow-hidden rounded-sm">
                <TemplatePreview
                  meta={meta}
                  def={template}
                  slide={i + 1}
                  colorway={colorway}
                  fields={fieldsFor(i)}
                  overrides={overrides}
                  width={THUMB_WIDTH}
                />
              </span>
              <span
                className="mt-1 block font-mono"
                style={{ fontSize: 9.5, color: on ? 'var(--action)' : 'var(--fg-3)' }}
              >
                {String(i + 1).padStart(2, '0')}
                {edited ? (
                  <span
                    aria-hidden
                    className="ml-1 inline-block rounded-full align-middle"
                    style={{ width: 4, height: 4, background: 'var(--action)' }}
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
