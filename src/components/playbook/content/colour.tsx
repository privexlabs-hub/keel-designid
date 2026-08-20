import { KeelLockup } from '@/brand/Logo';
import { COLORWAYS, COLORWAY_IDS, PALETTE, SLOT_IDS } from '@/brand/tokens';
import { flatten, measureAll, type Pair } from '../contrast';
import { Block, Callout, ContrastTable, Figure, H3, Mono, P, Rules, Swatch, SwatchGrid } from '../ui';

/** The palette organised the way it is used, rather than the way it is stored. */
const ROLES: {
  id: string;
  title: string;
  purpose: string;
  entries: { name: string; token: keyof typeof PALETTE; role: string }[];
}[] = [
  {
    id: 'surfaces',
    title: 'Surfaces',
    purpose:
      'Four warm neutrals in a fixed stacking order. Depth in this system is expressed by moving down the list, not by adding shadow: canvas is the page, surface-1 is a card on it, surface-2 is a header or a well inside that card, surface-3 is the deepest recess.',
    entries: [
      { name: 'canvas', token: 'canvas', role: 'The page ground. Everything else sits on this.' },
      { name: 'surface-1', token: 'surface1', role: 'Cards, panels, tables, anything raised off the page.' },
      { name: 'surface-2', token: 'surface2', role: 'Table headers, inset wells, hovered rows.' },
      { name: 'surface-3', token: 'surface3', role: 'Deepest recess: scroll thumbs, disabled fills, progress tracks.' },
      { name: 'overlay', token: 'overlay', role: 'Modals and popovers only — the one pure white in the system, used to lift a floating layer clear of the warm stack.' },
      { name: 'scrim', token: 'scrim', role: 'Behind a modal. Warm-tinted rather than neutral black so it does not grey the page.' },
    ],
  },
  {
    id: 'foreground',
    title: 'Foreground',
    purpose:
      'Three weights of text, and the rule is that they are a hierarchy rather than a set of options. If a piece of text needs to be noticed, move it up a step; do not reach for colour.',
    entries: [
      { name: 'fg-1', token: 'fg1', role: 'Primary text: headings, values, anything the reader came for.' },
      { name: 'fg-2', token: 'fg2', role: 'Secondary text: body copy, descriptions, supporting detail.' },
      { name: 'fg-3', token: 'fg3', role: 'Tertiary: labels, units, timestamps, placeholders. Never load-bearing text.' },
    ],
  },
  {
    id: 'action',
    title: 'Action',
    purpose:
      'Deep teal is the only interactive colour. Every link, primary button, focused field and selected row is this hue. Because it is reserved, a reader can scan a dense screen for teal and find every place they can act.',
    entries: [
      { name: 'action', token: 'action', role: 'Primary buttons, links, active navigation, the brand colour itself.' },
      { name: 'action-hover', token: 'actionHover', role: 'Hover state. One step deeper, not lighter.' },
      { name: 'action-press', token: 'actionPress', role: 'Pressed state, and the surface colour under the teal colorway.' },
      { name: 'action-fg', token: 'actionFg', role: 'Text on a teal fill. Cream, not white — the system has no pure white foreground.' },
      { name: 'action-weak', token: 'actionWeak', role: 'Tinted ground for selected rows, callouts and secondary buttons.' },
      { name: 'action-weak-bd', token: 'actionWeakBd', role: 'The border that goes with action-weak.' },
      { name: 'focus-ring', token: 'focusRing', role: 'The 2px focus outline, offset 2px. Never removed, never restyled per component.' },
    ],
  },
  {
    id: 'semantic',
    title: 'Semantic',
    purpose:
      'Four status hues, each with a weak fill and a weak border so a badge never needs an opacity modifier. These colours mean something: green is a control that works, red is a finding. Do not borrow them for decoration.',
    entries: [
      { name: 'brand / success', token: 'brand', role: 'Effective controls, valid evidence, closed actions, covered clauses.' },
      { name: 'brand-weak', token: 'brandWeak', role: 'Badge and chip ground for the above.' },
      { name: 'info', token: 'info', role: 'Neutral information: scheduled audits, informational notices.' },
      { name: 'info-weak', token: 'infoWeak', role: 'Badge ground for informational states.' },
      { name: 'warn', token: 'warn', role: 'Attention, not failure: evidence expiring, a document review due, a KPI on watch.' },
      { name: 'warn-weak', token: 'warnWeak', role: 'Badge ground for attention states.' },
      { name: 'danger', token: 'danger', role: 'A gap, an overdue item, a destructive action. Used sparingly enough to still mean something.' },
      { name: 'danger-weak', token: 'dangerWeak', role: 'Badge ground for failure states.' },
    ],
  },
  {
    id: 'lines',
    title: 'Lines',
    purpose:
      'Three border weights, all warm-tinted translucent black so they darken correctly over any surface in the stack. Structure in this system comes from lines, which is why there are so few shadows.',
    entries: [
      { name: 'border-faint', token: 'borderFaint', role: 'Row separators inside a table. Present, barely.' },
      { name: 'border', token: 'border', role: 'The default: card edges, input outlines, section rules.' },
      { name: 'border-strong', token: 'borderStrong', role: 'Emphasis and the monochrome colorway, where the line does the work colour normally would.' },
    ],
  },
];

/**
 * The pairs worth measuring: every one is a combination the product actually
 * renders. Ratios are computed at build time by ../contrast.ts, translucent
 * colours composited onto their real ground first.
 */
const PAIRS: Pair[] = [
  { use: 'Body copy on the page ground', fgName: 'fg-2', fg: PALETTE.fg2, bgName: 'canvas', bg: PALETTE.canvas },
  { use: 'Headings and values on a card', fgName: 'fg-1', fg: PALETTE.fg1, bgName: 'surface-1', bg: PALETTE.surface1 },
  { use: 'Body copy on a card', fgName: 'fg-2', fg: PALETTE.fg2, bgName: 'surface-1', bg: PALETTE.surface1 },
  {
    use: 'Labels, units, timestamps',
    fgName: 'fg-3',
    fg: PALETTE.fg3,
    bgName: 'surface-1',
    bg: PALETTE.surface1,
    note: 'Below 4.5:1. Permitted only for non-essential labelling that is duplicated elsewhere on the screen — never for values, error text, or the only copy of an instruction.',
  },
  { use: 'Links and button labels on a card', fgName: 'action', fg: PALETTE.action, bgName: 'surface-1', bg: PALETTE.surface1 },
  { use: 'Text on a primary button', fgName: 'action-fg', fg: PALETTE.actionFg, bgName: 'action', bg: PALETTE.action },
  { use: 'Link text on a selected row', fgName: 'action', fg: PALETTE.action, bgName: 'action-weak on surface-1', bg: flatten(PALETTE.actionWeak, PALETTE.surface1) },
  {
    use: 'Success badge text',
    fgName: 'brand',
    fg: PALETTE.brand,
    bgName: 'surface-1',
    bg: PALETTE.surface1,
    note: 'Below 4.5:1. Clears the threshold for large text only. Use it for badge labels, which are always accompanied by an explicit status word in the same row, and never for running text or for a control whose only label it would be.',
  },
  {
    use: 'Warning badge text',
    fgName: 'warn',
    fg: PALETTE.warn,
    bgName: 'surface-1',
    bg: PALETTE.surface1,
    note: 'Below 4.5:1, and the weakest of the four status hues. Badge labels only, at 12px semibold or heavier. Warning copy that has to be read — an expiry date, an instruction — is set in fg-1 with the colour carried by the chip beside it.',
  },
  { use: 'Danger badge text', fgName: 'danger', fg: PALETTE.danger, bgName: 'surface-1', bg: PALETTE.surface1 },
  { use: 'Informational badge text', fgName: 'info', fg: PALETTE.info, bgName: 'surface-1', bg: PALETTE.surface1 },
  {
    use: 'Card and input borders',
    fgName: 'border',
    fg: PALETTE.border,
    bgName: 'surface-1',
    bg: PALETTE.surface1,
    kind: 'non-text',
    note: 'Below 3:1. Decorative separation only. Where a border is the sole indicator of a control — an input outline, a selected state — pair it with border-strong or a fill.',
  },
  {
    use: 'Emphasised borders',
    fgName: 'border-strong',
    fg: PALETTE.borderStrong,
    bgName: 'surface-1',
    bg: PALETTE.surface1,
    kind: 'non-text',
    note: 'Also below 3:1. A border is never the sole indicator of a control or a state anywhere in the product; pair it with a fill, a label, or an icon.',
  },
  {
    use: 'The focus ring against the page ground',
    fgName: 'focus-ring',
    fg: PALETTE.focusRing,
    bgName: 'canvas',
    bg: PALETTE.canvas,
    kind: 'non-text',
    note: 'Below 3:1 against canvas. The ring is 2px at 2px offset, so most of its perceived contrast comes from the control it surrounds rather than the page. Where a focusable control sits directly on the page ground with no surface behind it, set the outline to action at full strength instead.',
  },
  { use: 'The mark on the page ground', fgName: 'action', fg: PALETTE.action, bgName: 'canvas', bg: PALETTE.canvas, kind: 'non-text' },
  { use: 'Body copy on the ink colorway', fgName: 'ink fg-muted', fg: COLORWAYS.ink.slots.fgMuted, bgName: 'ink bg', bg: COLORWAYS.ink.slots.bg },
  { use: 'Accent text on the ink colorway', fgName: 'ink accent', fg: COLORWAYS.ink.slots.accent, bgName: 'ink bg', bg: COLORWAYS.ink.slots.bg },
  { use: 'Body copy on the teal flood', fgName: 'teal fg-muted', fg: COLORWAYS.teal.slots.fgMuted, bgName: 'teal bg', bg: COLORWAYS.teal.slots.bg },
  { use: 'Headings on the teal flood', fgName: 'teal fg', fg: COLORWAYS.teal.slots.fg, bgName: 'teal bg', bg: COLORWAYS.teal.slots.bg },
];

const MEASURED = measureAll(PAIRS);
const FAILING = MEASURED.filter((p) => !p.passes);

export function ColourContent() {
  return (
    <>
      <Block
        id="the-idea"
        title="The idea"
        intro="A warm neutral ground, one reserved interactive hue, and four status colours that are never used for anything else."
      >
        <P>
          The palette is built on a cream page rather than white because the product is read for long
          stretches. Warm neutrals lower the luminance of a full screen without dimming the text, and
          they make the deep teal read as considered rather than corporate. Every value below comes
          from the imported source; none of it was picked here.
        </P>
        <Figure
          pad={0}
          caption="The whole system in one line: page, card, header, text, and the one colour you can click."
        >
          <div className="flex h-16">
            {[PALETTE.canvas, PALETTE.surface1, PALETTE.surface2, PALETTE.fg1, PALETTE.action].map(
              (c) => (
                <span key={c} className="flex-1" style={{ background: c }} />
              ),
            )}
          </div>
        </Figure>
      </Block>

      {ROLES.map((group) => (
        <Block key={group.id} id={group.id} title={group.title} intro={group.purpose}>
          <SwatchGrid>
            {group.entries.map((e) => (
              <Swatch key={e.name} name={e.name} value={PALETTE[e.token]} role={e.role} />
            ))}
          </SwatchGrid>
        </Block>
      ))}

      <Block
        id="weak-variants"
        title="Why every colour has a -weak"
        intro="Because opacity modifiers are not available to us."
      >
        <P>
          A tinted badge ground would normally be written as a 12% alpha of its hue. In this codebase
          that compiles to <Mono>color-mix()</Mono>, and the DOM-snapshot library that rasterises
          templates for export mangles it. So the token set ships explicit{' '}
          <Mono>-weak</Mono> fills and <Mono>-weak-bd</Mono> borders for every semantic colour, and
          those are what you use.
        </P>
        <Figure caption="The four semantic badges as they render in the product, each built from its weak fill, its weak border and its full-strength text.">
          <div className="flex flex-wrap gap-2.5">
            <Badge fg={PALETTE.brand} bg={PALETTE.brandWeak} bd={PALETTE.brandWeakBd} label="Effective" />
            <Badge fg={PALETTE.info} bg={PALETTE.infoWeak} bd={PALETTE.infoWeakBd} label="Scheduled" />
            <Badge fg={PALETTE.warn} bg={PALETTE.warnWeak} bd={PALETTE.warnWeakBd} label="Review due" />
            <Badge fg={PALETTE.danger} bg={PALETTE.dangerWeak} bd={PALETTE.dangerWeakBd} label="Gap" />
            <Badge fg={PALETTE.action} bg={PALETTE.actionWeak} bd={PALETTE.actionWeakBd} label="ISO 9001:2015" />
          </div>
        </Figure>
      </Block>

      <Block
        id="colorways"
        title="The seven colorways"
        intro="Seven named grounds, each a remapping of the same seven slots. This is what stops a template library from multiplying by seven."
      >
        <P>
          A template does not name a colour. It names a slot — <Mono>bg</Mono>, <Mono>surface</Mono>,{' '}
          <Mono>fg</Mono>, <Mono>fgMuted</Mono>, <Mono>accent</Mono>, <Mono>accentFg</Mono>,{' '}
          <Mono>line</Mono> — and the colorway on the stage node decides what those resolve to. Pick
          the colorway for the medium: cream and canvas for documents, teal and radial for campaign
          work, ink for dark UI, mono for single-colour print, inverted where you want a dark ground
          with a warm accent.
        </P>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLORWAY_IDS.map((id) => {
            const cw = COLORWAYS[id];
            return (
              <div
                key={id}
                data-colorway={id}
                className="flex flex-col gap-4 rounded-xl border border-line bg-t-bg p-5 text-t-fg"
                style={{ backgroundImage: cw.bgImage }}
              >
                <div className="flex items-center justify-between gap-3">
                  <KeelLockup size={20} subtitle={null} />
                  <span
                    className="rounded-full px-2.5 py-1 font-mono"
                    style={{ fontSize: 10, background: 'var(--t-accent)', color: 'var(--t-accent-fg)' }}
                  >
                    {id}
                  </span>
                </div>
                <p className="m-0 text-t-fg-muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  {cw.label} — {cw.dark ? 'dark ground' : 'light ground'}.
                </p>
                <div className="flex gap-1.5">
                  {SLOT_IDS.map((s) => (
                    <span
                      key={s}
                      title={`${s}: ${cw.slots[s]}`}
                      className="h-7 flex-1 rounded"
                      style={{ background: cw.slots[s], border: '1px solid var(--t-line)' }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <Callout title="Where the colorway attribute goes">
          <Mono>data-colorway</Mono> belongs on the exported node itself, never on an ancestor.
          Export clones the subtree, and a slot defined on a parent resolves to nothing in the clone.
        </Callout>
      </Block>

      <Block
        id="accessibility"
        title="Accessibility"
        intro={
          <>
            Every ratio below was computed from the token values at build time, translucent colours
            composited onto the ground they actually sit on. {FAILING.length} of {MEASURED.length}{' '}
            pairs do not meet their threshold; they are listed with the others and with the
            restriction that applies.
          </>
        }
      >
        <ContrastTable pairs={MEASURED} />

        <H3>What fails, and where it may still be used</H3>
        <Rules
          items={FAILING.map((p) => (
            <>
              <strong>
                {p.fgName} on {p.bgName}
              </strong>{' '}
              — {p.formatted}. {p.note}
            </>
          ))}
        />
        <P>
          None of these are rounding problems and none of them are being quietly tolerated. Two are
          hairlines, tuned to structure a dense table without ruling it into a grid. One is a
          tertiary label colour tuned to recede. Two are status hues whose lightness is set by the
          badge fills they sit in rather than by body-text legibility. Each is safe in the role it
          was drawn for and unsafe outside it, so the restriction is written down rather than the
          value quietly changed — changing them would move the brand, and the brand is not this
          document&rsquo;s to move.
        </P>
        <Rules
          items={[
            'Never signal state with colour alone. Every semantic colour in the product is paired with a label, an icon, or both.',
            'The focus ring is not optional and is not restyled per component. It is a 2px outline in focus-ring at 2px offset, applied globally.',
            'Text over the radial colorway is measured against the darkest stop of the gradient, not its average.',
            'When you add a colour pair, add it to the table in this file. The measurement is three lines and it is the only way the number stays honest.',
          ]}
        />
      </Block>
    </>
  );
}

function Badge({ label, fg, bg, bd }: { label: string; fg: string; bg: string; bd: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1.5"
      style={{ background: bg, color: fg, border: `1px solid ${bd}`, fontSize: 12, fontWeight: 600 }}
    >
      {label}
    </span>
  );
}
