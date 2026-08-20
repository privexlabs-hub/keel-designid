import { Icon } from '@/brand/icons';
import { KeelLockup, KeelMark } from '@/brand/Logo';
import { COLORWAYS } from '@/brand/tokens';
import { CLAUSES, COMPANY, KPIS } from '@/data/demo';
import { Block, Callout, Figure, H3, Mono, P, Rules } from '../ui';

/**
 * The system assembled. These are compositions built from the same tokens the
 * product uses — deliberately hand-built here rather than imported from the
 * template engine, so this section documents the system rather than depending
 * on the studio's catalogue.
 */
export function ApplicationContent() {
  return (
    <>
      <Block
        id="principles"
        title="The system in use"
        intro={
          <>
            Everything below is built from the same tokens: three families, one palette, seven
            colorway slots. Nothing is styled for the occasion. If a surface needs a value the system
            does not have, that is a gap in the system, not a licence to invent one.
          </>
        }
      >
        <Rules
          items={[
            'One accent per surface. The teal carries the action; the semantic colours report status and are never decorative.',
            'Cream grounds for anything that will be read at length. Ink and teal grounds for anything glanced at.',
            'Newsreader for the number or the claim, Hanken for everything explanatory, JetBrains Mono for anything a person might read out to a colleague — codes, dates, versions.',
            'The mark appears once per surface, and never twice at different sizes.',
          ]}
        />
      </Block>

      <Block
        id="product"
        title="Product surface"
        intro="The densest application, and the one that sets the constraints for everything else."
      >
        <Figure caption="A conformance row as it appears in the product: mono code, interface label, a bar carrying the measurement, and a status the user can read aloud.">
          <div className="flex flex-col gap-2.5">
            {CLAUSES.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-line bg-surface-1 px-4 py-3"
              >
                <span className="font-mono text-fg-3" style={{ fontSize: 11.5, minWidth: 42 }}>
                  {c.code}
                </span>
                <span className="min-w-0 flex-1 text-fg-1" style={{ fontSize: 13.5, fontWeight: 550 }}>
                  {c.title}
                </span>
                <span
                  className="h-1.5 overflow-hidden rounded-full bg-surface-3"
                  style={{ flexBasis: 120, flexGrow: 1, maxWidth: 160 }}
                >
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${c.pct}%`,
                      background: c.status === 'covered' ? 'var(--brand)' : 'var(--warn)',
                    }}
                  />
                </span>
                <span className="font-mono text-fg-2" style={{ fontSize: 11.5, minWidth: 34 }}>
                  {c.pct}%
                </span>
                <span
                  className="rounded-full px-2.5 py-1"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: c.status === 'covered' ? 'var(--brand)' : 'var(--warn)',
                    background: c.status === 'covered' ? 'var(--brand-weak)' : 'var(--warn-weak)',
                    border: `1px solid ${c.status === 'covered' ? 'var(--brand-weak-bd)' : 'var(--warn-weak-bd)'}`,
                  }}
                >
                  {c.status === 'covered' ? 'Covered' : 'Partial'}
                </span>
              </div>
            ))}
          </div>
        </Figure>
        <Callout title="Status is always a word">
          The chip carries colour, but the word carries the meaning. Someone reading this in
          greyscale, or with a colour vision deficiency, loses nothing.
        </Callout>
      </Block>

      <Block
        id="social"
        title="Social and marketing"
        intro="Louder than the product, built from the same parts. A stat card in two colorways."
      >
        <Figure caption="The same composition on the teal flood and on cream. Only the colorway slots change — the layout, the type ramp and the lockup placement are identical.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(['teal', 'cream'] as const).map((id) => (
              <div
                key={id}
                data-colorway={id}
                className="flex aspect-square flex-col justify-between rounded-xl border border-line bg-t-bg p-7 text-t-fg"
                style={{ backgroundImage: COLORWAYS[id].bgImage }}
              >
                <span
                  className="font-ui uppercase text-t-accent"
                  style={{ fontSize: 10.5, letterSpacing: '0.11em', fontWeight: 600 }}
                >
                  Audit readiness
                </span>
                <span className="flex flex-col gap-3">
                  <span
                    className="font-display text-t-fg"
                    style={{ fontSize: 68, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em' }}
                  >
                    94%
                  </span>
                  <span className="text-t-fg-muted" style={{ fontSize: 14, lineHeight: 1.4 }}>
                    of Keel customers clear surveillance audit with no major nonconformities.
                  </span>
                </span>
                <span className="text-t-accent">
                  <KeelLockup size={20} subtitle={null} />
                </span>
              </div>
            ))}
          </div>
        </Figure>
      </Block>

      <Block
        id="documents"
        title="Documents"
        intro="Controlled documents leave the product and get printed, emailed and filed. The header has to survive all three."
      >
        <Figure caption="A document header. The rule under the wordmark is the only ornament, and the metadata is mono so a version number is never misread.">
          <div className="rounded-lg border border-line bg-surface-1 p-7">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
              <KeelLockup size={24} subtitle={null} />
              <span className="font-mono text-fg-3" style={{ fontSize: 10.5, letterSpacing: '0.06em' }}>
                SOP-01 &middot; v3.1 &middot; reviewed 2026-02-10
              </span>
            </div>
            <h3
              className="mt-5 mb-2 font-display text-fg-1"
              style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.005em' }}
            >
              Supplier approval procedure
            </h3>
            <p className="m-0 text-fg-2" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
              {COMPANY.name} &middot; {COMPANY.standards.join(' and ')}
            </p>
          </div>
        </Figure>
      </Block>

      <Block
        id="avatars"
        title="Avatars"
        intro="A 400px square, cropped to a circle by every platform that shows it. The mark only — the wordmark is illegible at this size."
      >
        <Figure caption="Five approved avatar colourways. The mark sits at 46% of the frame so it survives circular cropping with room to spare.">
          <div className="flex flex-wrap gap-5">
            {(['teal', 'ink', 'cream', 'radial', 'mono'] as const).map((id) => (
              <span key={id} className="flex flex-col items-center gap-2.5">
                <span
                  data-colorway={id}
                  className="flex items-center justify-center rounded-full bg-t-bg text-t-accent"
                  style={{
                    width: 84,
                    height: 84,
                    backgroundImage: COLORWAYS[id].bgImage,
                    border: '1px solid var(--border)',
                  }}
                >
                  <KeelMark size={39} />
                </span>
                <span className="font-mono text-fg-3" style={{ fontSize: 10 }}>
                  {id}
                </span>
              </span>
            ))}
          </div>
        </Figure>
        <Rules
          items={[
            'The mark only. No wordmark, no initials, no tagline.',
            'Centre optically, not mathematically — the mark reads slightly high because its mass sits below the waterline.',
            'Keep the ground flat or a single soft radial. No photographs behind the mark.',
          ]}
        />
      </Block>

      <Block
        id="data"
        title="Data and measurement"
        intro="Keel is mostly numbers. How they are set matters more than any other single decision."
      >
        <Figure caption="KPI tiles. The value is Newsreader, the unit and target are mono, and the status word does the reporting.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {KPIS.slice(0, 3).map((k) => {
              const tone =
                k.status === 'good' ? 'brand' : k.status === 'watch' ? 'warn' : 'danger';
              return (
                <div key={k.id} className="rounded-xl border border-line bg-surface-1 p-5">
                  <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
                    {k.code}
                  </span>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span
                      className="font-display text-fg-1"
                      style={{ fontSize: 33, fontWeight: 600, letterSpacing: '-0.01em' }}
                    >
                      {k.value}
                    </span>
                    <span className="font-mono text-fg-2" style={{ fontSize: 12 }}>
                      {k.unit}
                    </span>
                  </div>
                  <p className="mt-1.5 mb-3 text-fg-2" style={{ fontSize: 12.5, lineHeight: 1.4 }}>
                    {k.name}
                  </p>
                  <span className="flex items-center gap-2">
                    <span style={{ color: `var(--${tone})` }}>
                      <Icon
                        name={k.trend === 'up' ? 'arrowUp' : k.trend === 'down' ? 'arrowDown' : 'minus'}
                        size={13}
                      />
                    </span>
                    <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
                      target {k.target}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </Figure>
        <P>
          Trend direction is an icon because the arrow characters do not exist in the bundled font
          subsets — see <Mono>Typography</Mono>. Direction is never the whole story, so the target is
          always shown beside it.
        </P>
        <H3>Rounding</H3>
        <Rules
          items={[
            'Percentages to one decimal place at most, and only where the extra digit changes a decision.',
            'Never pad a number to look more precise than the measurement behind it.',
            'Currency and counts are never abbreviated in the product. In marketing, abbreviate only above four digits.',
          ]}
        />
      </Block>
    </>
  );
}
