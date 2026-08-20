import type { Metadata } from 'next';
import { KeelLockup, KeelMark } from '@/brand/Logo';
import { Icon, ICON_NAMES } from '@/brand/icons';
import { COLORWAYS, COLORWAY_IDS, PALETTE, SHADOWS, SLOT_IDS } from '@/brand/tokens';

export const metadata: Metadata = {
  title: 'Foundation',
  description: 'Every brand token, icon, and logo variant rendered from the imported source.',
};

/**
 * The Phase 0 milestone page: proves the token layer, the colorway slot
 * remapping, the self-hosted fonts, the icon set and the logo all render from
 * a single source of truth.
 */
export default function FoundationPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-14 md:px-10">
      <header className="mb-14">
        <KeelLockup size={30} />
        <h1
          className="mt-8 font-display text-fg-1"
          style={{ fontSize: 42, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.1 }}
        >
          Foundation
        </h1>
        <p className="mt-3 max-w-[62ch] text-fg-2" style={{ fontSize: 16, lineHeight: 1.55 }}>
          Every value on this page resolves from the imported design source. Nothing here is
          hand-authored colour.
        </p>
      </header>

      <Section title="Typography" note="Newsreader, Hanken Grotesk and JetBrains Mono, self-hosted.">
        <div className="flex flex-col gap-6">
          <Specimen role="display" stack="var(--font-display)" label="Newsreader · display" />
          <Specimen role="ui" stack="var(--font-ui)" label="Hanken Grotesk · interface" />
          <Specimen role="mono" stack="var(--font-mono)" label="JetBrains Mono · data" />
        </div>
      </Section>

      <Section title="Palette" note="The imported :root block, verbatim.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(PALETTE).map(([name, value]) => (
            <div
              key={name}
              className="overflow-hidden rounded-lg border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
            >
              <div
                className="h-16 w-full border-b"
                style={{ background: value, borderColor: 'var(--border-faint)' }}
              />
              <div className="px-3 py-2.5">
                <div style={{ fontSize: 12.5, fontWeight: 550 }}>{name}</div>
                <div className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Colorways"
        note="Seven slots remapped seven ways — the mechanism that keeps 130 templates from becoming 910."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLORWAY_IDS.map((id) => {
            const cw = COLORWAYS[id];
            return (
              <div
                key={id}
                data-colorway={id}
                className="rounded-xl border bg-t-bg p-5 text-t-fg"
                style={{
                  borderColor: 'var(--border)',
                  backgroundImage: cw.bgImage,
                  boxShadow: SHADOWS.sm,
                }}
              >
                <div className="flex items-center justify-between">
                  <KeelLockup size={22} subtitle={null} />
                  <span
                    className="rounded-full px-2.5 py-1 font-mono"
                    style={{
                      fontSize: 10,
                      background: 'var(--t-accent)',
                      color: 'var(--t-accent-fg)',
                    }}
                  >
                    {id}
                  </span>
                </div>
                <p className="mt-4 text-t-fg-muted" style={{ fontSize: 13, lineHeight: 1.45 }}>
                  {cw.label} — {cw.dark ? 'dark ground' : 'light ground'}.
                </p>
                <div className="mt-4 flex gap-1.5">
                  {SLOT_IDS.map((s) => (
                    <span
                      key={s}
                      title={`${s}: ${cw.slots[s]}`}
                      className="h-6 flex-1 rounded"
                      style={{ background: cw.slots[s], border: '1px solid var(--t-line)' }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="The mark" note="Geometry verbatim from the source: a hull cutting a waterline.">
        <div className="flex flex-wrap items-end gap-8">
          {(['cream', 'canvas', 'teal', 'ink'] as const).map((id) => (
            <div
              key={id}
              data-colorway={id}
              className="flex min-w-[168px] flex-col items-center gap-4 rounded-xl border bg-t-bg px-6 py-7 text-t-accent"
              style={{ borderColor: 'var(--border)', backgroundImage: COLORWAYS[id].bgImage }}
            >
              <KeelMark size={52} />
              <span className="font-mono text-t-fg-muted" style={{ fontSize: 10.5 }}>
                {id}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-10">
          <KeelLockup size={26} />
          <KeelLockup size={26} variant="stacked" />
          <KeelLockup size={26} subtitle={null} />
        </div>
      </Section>

      <Section title="Icons" note={`${ICON_NAMES.length} icons, path data lifted from the source.`}>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
          {ICON_NAMES.map((name) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2.5 rounded-lg border py-4"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
            >
              <span className="text-action">
                <Icon name={name} size={22} />
              </span>
              <span className="font-mono text-fg-3" style={{ fontSize: 10 }}>
                {name}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-fg-2" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
          Arrows and check marks are icons, never text characters — the bundled font subsets have
          no glyphs for them, and a silent system fallback would rasterise into every export.
        </p>
      </Section>

      <Section title="Elevation" note="Three shadows, from the source.">
        <div className="flex flex-wrap gap-5">
          {Object.entries(SHADOWS).map(([name, value]) => (
            <div
              key={name}
              className="flex h-24 w-40 items-center justify-center rounded-xl"
              style={{ background: 'var(--surface-1)', boxShadow: value }}
            >
              <span className="font-mono text-fg-2" style={{ fontSize: 11 }}>
                shadow-{name}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="mb-5 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        <h2
          className="font-display text-fg-1"
          style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.005em' }}
        >
          {title}
        </h2>
        {note ? (
          <p className="mt-1.5 text-fg-2" style={{ fontSize: 13, lineHeight: 1.5 }}>
            {note}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Specimen({ role, stack, label }: { role: string; stack: string; label: string }) {
  return (
    <div className="rounded-lg border px-5 py-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-fg-3" style={{ fontSize: 10, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span className="font-mono text-fg-3" style={{ fontSize: 10 }}>
          --font-{role}
        </span>
      </div>
      <div style={{ fontFamily: stack, fontSize: 34, lineHeight: 1.2, color: 'var(--fg-1)' }}>
        Seaworthy by design
      </div>
      <div style={{ fontFamily: stack, fontSize: 13.5, marginTop: 8, color: 'var(--fg-2)' }}>
        ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 — · % × “ ” ’
      </div>
    </div>
  );
}
