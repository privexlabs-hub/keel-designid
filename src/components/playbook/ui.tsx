/**
 * The playbook's shared furniture.
 *
 * Every piece here is a server component and takes its colour from the token
 * layer — no hex literals, no opacity modifiers. The one thing these do that a
 * generic UI kit would not is hold the document's measure: prose sits at 68
 * characters, figures break out to the full column.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Icon } from '@/brand/icons';
import { formatRatio, type MeasuredPair } from './contrast';
import type { AssetGroup } from './assets';

/* ------------------------------------------------------------------ text - */

export function Lede({ children }: { children: ReactNode }) {
  return (
    <p
      className="max-w-[62ch] font-display text-fg-2"
      style={{ fontSize: 19, lineHeight: 1.5, marginBlock: 0 }}
    >
      {children}
    </p>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-[68ch] text-fg-2" style={{ fontSize: 14.5, lineHeight: 1.65, marginBlock: 0 }}>
      {children}
    </p>
  );
}

export function Eyebrow({ children, size = 10.5 }: { children: ReactNode; size?: number }) {
  return (
    <span
      className="block text-fg-3 uppercase"
      style={{ fontSize: size, fontWeight: 600, letterSpacing: size <= 10.5 ? '0.12em' : '0.08em' }}
    >
      {children}
    </span>
  );
}

/** A second-level heading. Every section builds its outline from these. */
export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 font-display text-fg-1"
      style={{ fontSize: 25, fontWeight: 600, letterSpacing: '-0.006em', lineHeight: 1.2, marginBlock: 0 }}
    >
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3
      className="text-fg-1"
      style={{ fontSize: 15, fontWeight: 650, letterSpacing: '-0.002em', marginBlock: 0 }}
    >
      {children}
    </h3>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return (
    <code
      className="rounded bg-surface-2 font-mono text-fg-1"
      style={{ fontSize: 12, padding: '1px 5px' }}
    >
      {children}
    </code>
  );
}

/** A short list of rules. Numbered where order matters. */
export function Rules({ items, ordered = false }: { items: ReactNode[]; ordered?: boolean }) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List className="m-0 flex max-w-[68ch] list-none flex-col gap-2.5 p-0">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-fg-2" style={{ fontSize: 14.5, lineHeight: 1.6 }}>
          <span
            aria-hidden
            className="mt-[0.55em] h-[5px] w-[5px] shrink-0 rounded-full bg-action"
            style={{ opacity: ordered ? 0 : 1 }}
          />
          {ordered ? (
            <span className="shrink-0 font-mono text-fg-3" style={{ fontSize: 12, marginTop: 2 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
          ) : null}
          <span>{item}</span>
        </li>
      ))}
    </List>
  );
}

/* --------------------------------------------------------------- section - */

/** A run of content under one H2, with consistent vertical rhythm. */
export function Block({ id, title, intro, children }: {
  id: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5" aria-labelledby={id}>
      <div className="flex flex-col gap-2.5">
        <H2 id={id}>{title}</H2>
        {intro ? <P>{intro}</P> : null}
      </div>
      {children}
    </section>
  );
}

/** A bordered specimen frame with a caption underneath. */
export function Figure({
  caption,
  children,
  pad = 28,
  tone = 'surface',
  style,
}: {
  caption?: ReactNode;
  children: ReactNode;
  pad?: number;
  tone?: 'surface' | 'canvas' | 'bare';
  style?: CSSProperties;
}) {
  return (
    <figure className="m-0 flex flex-col gap-2.5">
      <div
        className="overflow-hidden rounded-xl border border-line"
        style={{
          padding: tone === 'bare' ? 0 : pad,
          background:
            tone === 'canvas' ? 'var(--canvas)' : tone === 'bare' ? 'transparent' : 'var(--surface-1)',
          ...style,
        }}
      >
        {children}
      </div>
      {caption ? (
        <figcaption className="max-w-[68ch] text-fg-3" style={{ fontSize: 12.5, lineHeight: 1.55 }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** A pulled-aside rule the reader should not miss. */
export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside
      className="flex max-w-[68ch] gap-3.5 rounded-lg border p-4"
      style={{ background: 'var(--action-weak)', borderColor: 'var(--action-weak-bd)' }}
    >
      <span className="mt-[1px] shrink-0 text-action" aria-hidden>
        <Icon name="shield" size={17} />
      </span>
      <div className="flex flex-col gap-1.5">
        <strong className="text-fg-1" style={{ fontSize: 13.5, fontWeight: 650 }}>
          {title}
        </strong>
        <div className="text-fg-2" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          {children}
        </div>
      </div>
    </aside>
  );
}

/* ----------------------------------------------------------------- table - */

export interface SpecRow {
  name: string;
  value: string;
  use: string;
}

/** Token name / literal value / what it is for. */
export function SpecTable({ rows, head = ['Token', 'Value', 'Use'] }: {
  rows: SpecRow[];
  head?: [string, string, string];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
      <table className="w-full" style={{ minWidth: 520 }}>
        <thead>
          <tr className="border-b border-line">
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-2.5 text-left text-fg-3 uppercase"
                style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.11em' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-line-faint last:border-b-0">
              <th
                scope="row"
                className="px-4 py-3 text-left font-mono text-fg-1"
                style={{ fontSize: 12, fontWeight: 400, whiteSpace: 'nowrap' }}
              >
                {r.name}
              </th>
              <td className="px-4 py-3 font-mono text-fg-2" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>
                {r.value}
              </td>
              <td className="px-4 py-3 text-fg-2" style={{ fontSize: 13, lineHeight: 1.5 }}>
                {r.use}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------------- colour - */

export function Swatch({
  name,
  value,
  role,
  onDark = false,
}: {
  name: string;
  value: string;
  role?: string;
  onDark?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-1">
      <div
        className="h-16 w-full border-b border-line-faint"
        style={{
          background: onDark
            ? `linear-gradient(90deg, var(--fg-1) 50%, var(--surface-1) 50%)`
            : undefined,
        }}
      >
        <div className="h-full w-full" style={{ background: value }} />
      </div>
      <div className="flex flex-col gap-0.5 px-3 py-2.5">
        <span className="text-fg-1" style={{ fontSize: 12.5, fontWeight: 550 }}>
          {name}
        </span>
        <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
          {value}
        </span>
        {role ? (
          <span className="mt-1 text-fg-2" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
            {role}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function SwatchGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
}

/* ------------------------------------------------------------- specimens - */

export function SpecimenCard({
  eyebrow,
  title,
  meta,
  children,
}: {
  eyebrow: string;
  title?: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface-1 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        {meta ? (
          <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
            {meta}
          </span>
        ) : null}
      </div>
      {title ? (
        <p className="m-0 text-fg-2" style={{ fontSize: 13, lineHeight: 1.55 }}>
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- do / dont - */

export interface DoDontItem {
  label: string;
  reason: string;
  children: ReactNode;
}

/** A single "don't" tile: the failure rendered, with the reason under it. */
export function Dont({ label, reason, children }: DoDontItem) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface-1">
      <div
        className="relative grid h-[136px] place-items-center overflow-hidden border-b border-line"
        style={{ background: 'var(--canvas)' }}
      >
        {children}
        <span
          aria-hidden
          className="absolute top-2.5 right-2.5 grid h-6 w-6 place-items-center rounded-full"
          style={{ background: 'var(--danger-weak)', color: 'var(--danger)' }}
        >
          <Icon name="x" size={13} />
        </span>
      </div>
      <div className="flex flex-col gap-1 px-4 py-3.5">
        <span className="text-fg-1" style={{ fontSize: 13, fontWeight: 650 }}>
          {label}
        </span>
        <span className="text-fg-2" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          {reason}
        </span>
      </div>
    </div>
  );
}

export function DontGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

/** Paired copy examples — the shape voice guidance needs. */
export function DoDont({ write, avoid, why }: { write: string; avoid: string; why: string }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-surface-1 sm:grid-cols-2">
      <div className="flex flex-col gap-2 p-4 sm:p-5" style={{ background: 'var(--brand-weak)' }}>
        <Eyebrow>We write</Eyebrow>
        <p className="m-0 text-fg-1" style={{ fontSize: 14, lineHeight: 1.55 }}>
          {write}
        </p>
      </div>
      <div className="flex flex-col gap-2 p-4 sm:p-5" style={{ background: 'var(--danger-weak)' }}>
        <Eyebrow>We don&rsquo;t write</Eyebrow>
        <p className="m-0 text-fg-2" style={{ fontSize: 14, lineHeight: 1.55 }}>
          {avoid}
        </p>
      </div>
      <p
        className="m-0 border-t border-line px-4 py-3 text-fg-2 sm:col-span-2 sm:px-5"
        style={{ fontSize: 12.5, lineHeight: 1.55 }}
      >
        {why}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------- contrast - */

const KIND_LABEL: Record<string, string> = {
  text: 'Body text',
  'large-text': 'Large text',
  'non-text': 'Non-text',
};

export function ContrastTable({ pairs }: { pairs: MeasuredPair[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface-1">
      <table className="w-full" style={{ minWidth: 640 }}>
        <caption className="sr-only">
          Measured WCAG 2.1 contrast ratios for the palette&rsquo;s key foreground and background pairs
        </caption>
        <thead>
          <tr className="border-b border-line">
            {['Pair', 'Use', 'Applies to', 'Ratio', 'Result'].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-2.5 text-left text-fg-3 uppercase"
                style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.11em' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pairs.map((p) => (
            <tr key={`${p.fgName}-${p.bgName}-${p.use}`} className="border-b border-line-faint last:border-b-0">
              <th scope="row" className="px-4 py-3 text-left" style={{ fontWeight: 400 }}>
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="grid h-7 w-7 shrink-0 place-items-center rounded border border-line font-display"
                    style={{ background: p.bg, color: p.fg, fontSize: 13, fontWeight: 600 }}
                  >
                    K
                  </span>
                  <span className="font-mono text-fg-1" style={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>
                    {p.fgName}
                    <span className="text-fg-3"> on </span>
                    {p.bgName}
                  </span>
                </span>
              </th>
              <td className="px-4 py-3 text-fg-2" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                {p.use}
              </td>
              <td className="px-4 py-3 text-fg-3" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                {KIND_LABEL[p.kind ?? 'text']}
              </td>
              <td className="px-4 py-3 font-mono text-fg-1" style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>
                {formatRatio(p.value)}
              </td>
              <td className="px-4 py-3">
                <span
                  className="inline-block rounded-full px-2.5 py-1 font-mono"
                  style={{
                    fontSize: 10.5,
                    background: p.passes ? 'var(--brand-weak)' : 'var(--danger-weak)',
                    color: p.passes ? 'var(--brand)' : 'var(--danger)',
                    border: `1px solid ${p.passes ? 'var(--brand-weak-bd)' : 'var(--danger-weak-bd)'}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.passes ? p.grade : 'Fail'}
                </span>
                {p.note ? (
                  <span className="mt-1.5 block text-fg-2" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
                    {p.note}
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------- downloads - */

export function DownloadList({ group }: { group: AssetGroup }) {
  return (
    <section className="flex flex-col gap-3.5" aria-label={group.label}>
      <div className="flex flex-col gap-1.5">
        <H3>{group.label}</H3>
        <p className="m-0 max-w-[68ch] text-fg-2" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          {group.note}
        </p>
      </div>
      <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {group.files.map((f) => (
          <li key={f.path}>
            <a
              href={f.path}
              download
              className="flex items-center gap-3 rounded-lg border border-line bg-surface-1 px-3.5 py-3 no-underline"
              style={{ minHeight: 44 }}
            >
              <span className="shrink-0 text-action" aria-hidden>
                <Icon name="file" size={16} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span
                  className="truncate font-mono text-fg-1"
                  style={{ fontSize: 11.5 }}
                  title={f.name}
                >
                  {f.name}
                </span>
                <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
                  {f.size}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
