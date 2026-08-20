import { Icon } from '@/brand/icons';
import { FONT_FAMILIES, FONT_STACKS, PALETTE } from '@/brand/tokens';
import { KPIS, RISKS } from '@/data/demo';
import { Block, Callout, Figure, H3, Mono, P, Rules, SpecTable, SpecimenCard } from '../ui';

const SAMPLE = 'Northbound Coffee Roasters';
const PANGRAM = 'The quick brown fox jumps over the lazy dog';

/** The ramp as the product uses it. Sizes are px, matching the source. */
const RAMP: {
  name: string;
  size: number;
  weight: number;
  lineHeight: number;
  tracking: string;
  family: keyof typeof FONT_STACKS;
  use: string;
}[] = [
  { name: 'Display', size: 42, weight: 600, lineHeight: 1.1, tracking: '-0.01em', family: 'display', use: 'Page titles. One per page.' },
  { name: 'Title', size: 25, weight: 600, lineHeight: 1.2, tracking: '-0.006em', family: 'display', use: 'Section headings.' },
  { name: 'Subtitle', size: 19, weight: 500, lineHeight: 1.5, tracking: '0', family: 'display', use: 'Standfirsts and pull quotes.' },
  { name: 'Heading', size: 15, weight: 650, lineHeight: 1.35, tracking: '-0.002em', family: 'ui', use: 'Card titles, subheads, table captions.' },
  { name: 'Body', size: 14.5, weight: 400, lineHeight: 1.65, tracking: '0', family: 'ui', use: 'Running copy.' },
  { name: 'UI', size: 13, weight: 400, lineHeight: 1.5, tracking: '0', family: 'ui', use: 'Controls, table cells, secondary copy.' },
  { name: 'Caption', size: 12, weight: 400, lineHeight: 1.5, tracking: '0', family: 'ui', use: 'Helper text and figure captions.' },
  { name: 'Eyebrow', size: 10.5, weight: 600, lineHeight: 1.3, tracking: '0.12em', family: 'ui', use: 'Uppercase labels above a block.' },
  { name: 'Data', size: 12, weight: 400, lineHeight: 1.45, tracking: '0', family: 'mono', use: 'Codes, IDs, hexes, dates, measured values.' },
];

const TRACKING = [
  { size: 9, value: '0.12em' },
  { size: 10.5, value: '0.11em' },
  { size: 12, value: '0.09em' },
  { size: 14, value: '0.08em' },
  { size: 18, value: '0.07em' },
];

export function TypographyContent() {
  const risk = RISKS[0];
  const kpi = KPIS[0];

  return (
    <>
      <Block
        id="three-families"
        title="Three families, three jobs"
        intro="Each family earns its place by doing something the other two cannot. If a piece of text does not clearly belong to one of these jobs, it is body copy."
      >
        <div className="flex flex-col gap-4">
          <SpecimenCard
            eyebrow="Display"
            meta={`${FONT_FAMILIES.display} · variable`}
            title="A transitional serif with a low contrast and a generous x-height. It carries the credibility the product needs and reads as a document rather than an app. Headings only — it is not a body face at 13px."
          >
            <p
              className="m-0 text-fg-1"
              style={{ fontFamily: FONT_STACKS.display, fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.12 }}
            >
              {SAMPLE}
            </p>
            <p
              className="m-0 text-fg-3"
              style={{ fontFamily: FONT_STACKS.display, fontSize: 15, lineHeight: 1.5 }}
            >
              {PANGRAM}
            </p>
          </SpecimenCard>

          <SpecimenCard
            eyebrow="Interface"
            meta={`${FONT_FAMILIES.ui} · variable`}
            title="A neutral grotesk with open apertures and unambiguous digits. It is the workhorse: every control, every table cell, every paragraph of running copy. Chosen for how it behaves at 12 and 13px, not for how it looks at 48."
          >
            <p
              className="m-0 text-fg-1"
              style={{ fontFamily: FONT_STACKS.ui, fontSize: 'clamp(24px, 4.5vw, 34px)', fontWeight: 600, letterSpacing: '-0.012em' }}
            >
              {SAMPLE}
            </p>
            <p
              className="m-0 text-fg-3"
              style={{ fontFamily: FONT_STACKS.ui, fontSize: 15, lineHeight: 1.5 }}
            >
              {PANGRAM}
            </p>
          </SpecimenCard>

          <SpecimenCard
            eyebrow="Data"
            meta={`${FONT_FAMILIES.mono} · 400 / 500`}
            title="Fixed width, with a slashed zero and a clearly distinct one, l and I. Used for anything a person will read back to someone else: entity codes, clause references, dates, hex values, file names."
          >
            <p
              className="m-0 text-fg-1"
              style={{ fontFamily: FONT_STACKS.mono, fontSize: 'clamp(19px, 3.6vw, 26px)', fontWeight: 500 }}
            >
              {risk.code} · {kpi.id.toUpperCase()} · 0123456789
            </p>
            <p
              className="m-0 text-fg-3"
              style={{ fontFamily: FONT_STACKS.mono, fontSize: 13, lineHeight: 1.5 }}
            >
              Il1 O0 · {PALETTE.action} · rgba(40,33,20,0.13)
            </p>
          </SpecimenCard>
        </div>

        <P>
          All three are self-hosted from <Mono>/assets/fonts/</Mono> under the SIL Open Font Licence,
          with Latin and Latin-Extended as separate subsets. They are deliberately not loaded through{' '}
          <Mono>next/font</Mono>: the SVG and PDF renderers do not share the DOM&rsquo;s font context
          and need stable, unhashed family names.
        </P>
      </Block>

      <Block
        id="missing-glyphs"
        title="The glyphs that are not there"
        intro="This is the single most likely way to break an export, so it is documented before the ramp rather than after it."
      >
        <Callout title="No arrows, no check marks — as characters">
          The bundled subsets have no glyph for the arrows at{' '}
          <Mono>U+2190</Mono>&ndash;<Mono>U+2193</Mono> or the check mark at <Mono>U+2713</Mono>.
          This was verified against the font cmaps, not the declared{' '}
          <Mono>unicode-range</Mono>, which over-promises. Typing one does not throw an error. The
          browser silently substitutes a system face, and that substitution rasterises into every
          exported PNG, SVG and PDF as a shape that does not match anything else on the page.
        </Callout>
        <P>
          Use the icons instead. They are vector, they inherit <Mono>currentColor</Mono>, and they
          rasterise identically everywhere. <Mono>npm run lint:glyphs</Mono> fails the build if a
          banned character appears anywhere under <Mono>src/</Mono>.
        </P>
        <Figure caption="The four replacements. Set them at the cap height of the text they sit beside, not at its font size.">
          <div className="flex flex-wrap gap-x-10 gap-y-5">
            {(['chevronRight', 'arrowUp', 'arrowDown', 'clipCheck'] as const).map((name) => (
              <span key={name} className="flex items-center gap-2.5">
                <span className="text-action">
                  <Icon name={name} size={18} />
                </span>
                <span className="font-mono text-fg-2" style={{ fontSize: 12 }}>
                  {name}
                </span>
              </span>
            ))}
          </div>
        </Figure>
        <P>
          Characters that <em>are</em> safe and are used freely: the middle dot, en and em dashes,
          the multiplication sign, the bullet, and curly quotes. Prefer the middle dot to a slash or
          a pipe when separating metadata.
        </P>
      </Block>

      <Block
        id="ramp"
        title="The ramp"
        intro="Nine steps, rendered here at the size they are specified at. There is no step between Body and Heading, and adding one is how a type system starts to blur."
      >
        <div className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-1">
          {RAMP.map((step) => (
            <div key={step.name} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-baseline sm:gap-6">
              <div className="flex shrink-0 flex-col gap-1" style={{ width: 132 }}>
                <span className="text-fg-1" style={{ fontSize: 12.5, fontWeight: 650 }}>
                  {step.name}
                </span>
                <span className="font-mono text-fg-3" style={{ fontSize: 10.5, lineHeight: 1.5 }}>
                  {step.size}px / {step.weight}
                  <br />
                  {step.lineHeight} · {step.tracking}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="m-0 truncate text-fg-1"
                  style={{
                    fontFamily: FONT_STACKS[step.family],
                    fontSize: step.size,
                    fontWeight: step.weight,
                    lineHeight: step.lineHeight,
                    letterSpacing: step.tracking,
                    textTransform: step.name === 'Eyebrow' ? 'uppercase' : undefined,
                  }}
                >
                  {step.name === 'Data' ? `${risk.code} · 2026-03-14` : SAMPLE}
                </p>
                <p className="m-0 mt-1.5 text-fg-3" style={{ fontSize: 11.5 }}>
                  {step.use}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block
        id="weights"
        title="Weights in use"
        intro="Both text families are variable, which makes it tempting to use the whole axis. Five weights are in use and that is the list."
      >
        <SpecTable
          head={['Weight', 'Family', 'Where']}
          rows={[
            { name: '400', value: 'Regular', use: 'All running copy, table cells, captions, mono data.' },
            { name: '500', value: 'Medium', use: 'Mono at emphasis; the subtitle step in Newsreader.' },
            { name: '550', value: 'Demi', use: 'Swatch and token labels — a nudge, used where 600 would shout.' },
            { name: '600', value: 'Semibold', use: 'The wordmark, all display headings, eyebrows, badge labels.' },
            { name: '650', value: 'Semibold+', use: 'Interface headings in Hanken Grotesk, where 600 sits too close to body.' },
          ]}
        />
        <Rules
          items={[
            'No 700 and above. At the sizes this product renders, bold reads as shouting and thickens the page.',
            'No italics in the interface. Newsreader italic is available for a pull quote in editorial work and nowhere else.',
            'Never fake a weight with text-shadow or stroke.',
          ]}
        />
      </Block>

      <Block
        id="tracking"
        title="Tracking on uppercase eyebrows"
        intro="Uppercase set solid is a wall. Every uppercase label in this system is tracked between 0.07em and 0.12em, and the smaller it is, the more it gets."
      >
        <P>
          Capitals have no ascenders or descenders to open up the line, so the counters do all the
          work of separating letters — and counters shrink faster than the tracking that compensates
          for them. The scale below is the one to use; interpolate between the steps rather than
          inventing a value.
        </P>
        <Figure caption="Fixed text, five sizes, tracking increasing as the size drops. The 18px setting at 0.12em would look loose; the 9px setting at 0.07em would look jammed.">
          <div className="flex flex-col gap-4">
            {TRACKING.map((t) => (
              <div key={t.size} className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <span
                  className="text-fg-1 uppercase"
                  style={{ fontSize: t.size, fontWeight: 600, letterSpacing: t.value }}
                >
                  Evidence register
                </span>
                <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
                  {t.size}px · {t.value}
                </span>
              </div>
            ))}
          </div>
        </Figure>
        <Rules
          items={[
            'The lockup descriptor is tracked to 0.09em at 10 units. That value is part of the logo and is not on this scale.',
            'Sentence-case text is never tracked. If a heading needs air, change its size or its weight.',
            'Mono is never tracked. It is already monospaced; adding tracking breaks column alignment.',
          ]}
        />
      </Block>

      <Block
        id="line-height-and-measure"
        title="Line height and measure"
        intro="Line height falls as size rises. Measure is capped at 68 characters for body copy and 62 for the display face."
      >
        <SpecTable
          head={['Context', 'Line height', 'Why']}
          rows={[
            { name: 'Display, 25px+', value: '1.08 – 1.2', use: 'Large type needs less leading; at 1.5 a two-line title falls apart into two titles.' },
            { name: 'Standfirst, 19px', value: '1.5', use: 'Long enough to be a paragraph, large enough to want air.' },
            { name: 'Body, 14.5px', value: '1.65', use: 'The setting for anything read in quantity. This is the most important number on the page.' },
            { name: 'UI, 12 – 13px', value: '1.45 – 1.55', use: 'Tight enough that a table row stays one row high.' },
            { name: 'Table cells', value: '1.4', use: 'Density matters more than comfort in a register of two hundred rows.' },
            { name: 'Eyebrow', value: '1.3', use: 'Single line by definition.' },
          ]}
        />
        <Rules
          items={[
            'Body measure: 68ch maximum. Beyond that the eye loses the line return.',
            'Display measure: 62ch. Larger type covers ground faster and needs a shorter line.',
            'Never justify. Ragged right, no hyphenation, in every context.',
            'Numbers in a column are mono and right-aligned. Numbers in a sentence are the interface face.',
          ]}
        />
      </Block>

      <Block
        id="pairing"
        title="Pairing rules"
        intro="The three families are not interchangeable and mixing them within one unit of text is the fastest way to make the page look borrowed."
      >
        <Rules
          items={[
            <>
              <strong>One family per line.</strong> A serif heading with a mono code embedded in it is
              two voices in one sentence. Put the code on its own line, or set the whole line in mono.
            </>,
            <>
              <strong>Serif above, grotesk below.</strong> A display heading is followed by interface
              copy, never the reverse. Newsreader below Hanken Grotesk reads as a caption on a
              headline.
            </>,
            <>
              <strong>Mono is a signal, not a texture.</strong> If more than about a fifth of a block
              is mono, the block wants to be a table.
            </>,
            <>
              <strong>The eyebrow belongs to the block below it.</strong> Set it in the interface face
              at 10.5px, tracked, in fg-3, with no more than 6px between it and its heading.
            </>,
          ]}
        />
        <H3>The pairing, assembled</H3>
        <Figure caption="Eyebrow, display heading, standfirst, body, and a mono value — the full stack as it appears on a real page.">
          <div className="flex max-w-[52ch] flex-col gap-2.5">
            <span
              className="text-fg-3 uppercase"
              style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em' }}
            >
              Risk register
            </span>
            <h4
              className="m-0 font-display text-fg-1"
              style={{ fontSize: 27, fontWeight: 600, letterSpacing: '-0.008em', lineHeight: 1.18 }}
            >
              {risk.name}
            </h4>
            <p className="m-0 font-display text-fg-2" style={{ fontSize: 17, lineHeight: 1.5 }}>
              Owned by {risk.owner}. Severity {risk.sev}, likelihood {risk.lik}.
            </p>
            <p className="m-0 text-fg-2" style={{ fontSize: 14.5, lineHeight: 1.65 }}>
              Rated {risk.level} and reviewed at every management review. The controls attached to
              this risk are evidenced quarterly; where evidence lapses, the risk returns to the
              register at its untreated rating.
            </p>
            <p className="m-0 font-mono text-fg-3" style={{ fontSize: 12 }}>
              {risk.code} · {risk.clauses.join(' · ')}
            </p>
          </div>
        </Figure>
      </Block>
    </>
  );
}
