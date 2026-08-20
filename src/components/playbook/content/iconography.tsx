import { ICON_NAMES, ICON_SHAPES, Icon, type IconName } from '@/brand/icons';
import { Block, Callout, Figure, H3, Mono, P, Rules, SpecTable } from '../ui';

const USE: Record<IconName, string> = {
  gauge: 'Dashboard and overview navigation.',
  share2: 'The process map, and anything showing relationships between entities.',
  gitBranch: 'Process versions and document revision history.',
  alert: 'Risks, and any warning that needs to be noticed before it is read.',
  shield: 'Controls — the thing standing between a risk and an incident.',
  file: 'Controlled documents, downloads, attachments.',
  clipCheck: 'Evidence, and the completed state of any checklist. The check-mark replacement.',
  trending: 'KPIs and any measured series.',
  clipList: 'Audits and audit programmes.',
  wrench: 'Corrective actions — work to be done.',
  layers: 'Standards and clause coverage; stacked structures generally.',
  chevronRight: 'Forward navigation, disclosure, breadcrumbs. The arrow replacement.',
  search: 'Search and filter entry points.',
  arrowUp: 'A metric moving up. Direction only — never a value judgement on its own.',
  arrowDown: 'A metric moving down. Same rule.',
  minus: 'A flat trend, and the indeterminate state of a checkbox.',
  x: 'Dismiss, close, remove. Never used to mean failure — that is a labelled status.',
};

const SIZES = [14, 16, 18, 22, 28] as const;

export function IconographyContent() {
  const shapeCount = Object.values(ICON_SHAPES).reduce((n, s) => n + s.length, 0);

  return (
    <>
      <Block
        id="set"
        title={`The set — ${ICON_NAMES.length} icons`}
        intro={
          <>
            One icon per concept in the product, and no more. The set is closed by design: an
            eighteenth icon is a decision about the product, not a decision about a drawing.
          </>
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ICON_NAMES.map((name) => (
            <div
              key={name}
              className="flex items-start gap-3.5 rounded-lg border border-line bg-surface-1 px-4 py-3.5"
            >
              <span className="mt-[1px] shrink-0 text-action">
                <Icon name={name} size={20} />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-mono text-fg-1" style={{ fontSize: 11.5 }}>
                  {name}
                </span>
                <span className="text-fg-2" style={{ fontSize: 12, lineHeight: 1.45 }}>
                  {USE[name]}
                </span>
              </span>
            </div>
          ))}
        </div>
      </Block>

      <Block
        id="construction"
        title="Construction"
        intro={`Every icon is drawn on the same grid to the same spec — ${shapeCount} shapes across ${ICON_NAMES.length} icons, and not one of them is filled.`}
      >
        <SpecTable
          head={['Property', 'Value', 'Why']}
          rows={[
            { name: 'viewBox', value: '0 0 24 24', use: 'Square, and the same grid the logo mark uses, so an icon and the mark align optically at the same size.' },
            { name: 'stroke-width', value: '1.75', use: 'Set against the interface face at 13px. Thinner disappears in the table; thicker fights the text.' },
            { name: 'stroke-linecap', value: 'round', use: 'Matches the logo. Square caps make the set look technical rather than calm.' },
            { name: 'stroke-linejoin', value: 'round', use: 'Same reason. Applied even where no join is visible, so future icons inherit it.' },
            { name: 'fill', value: 'none', use: 'The whole set is stroked. There is no filled or duotone variant.' },
            { name: 'stroke', value: 'currentColor', use: 'An icon takes the colour of the text it sits beside. It is never coloured directly.' },
            { name: 'default size', value: '18px', use: 'The size used inline with 13px UI text.' },
          ]}
        />
        <Figure caption="The stroke is constant across sizes. It is a stroke width in grid units, so it scales with the icon rather than being restated per size.">
          <div className="flex flex-wrap items-end gap-8 text-fg-1">
            {SIZES.map((size) => (
              <span key={size} className="flex flex-col items-center gap-2.5">
                <Icon name="shield" size={size} />
                <span className="font-mono text-fg-3" style={{ fontSize: 10 }}>
                  {size}px
                </span>
              </span>
            ))}
          </div>
        </Figure>
        <Callout title="Icons are components, not files">
          The set is rendered inline as SVG from <Mono>src/brand/icons.tsx</Mono>. That is what lets
          them inherit <Mono>currentColor</Mono> and rasterise during export with no network fetch.
          There is no icon font and there will not be one.
        </Callout>
      </Block>

      <Block
        id="sizing"
        title="Sizing and alignment"
        intro="Four sizes, each tied to the text it accompanies."
      >
        <SpecTable
          head={['Size', 'Pairs with', 'Notes']}
          rows={[
            { name: '14px', value: 'Caption, 12px', use: 'Metadata rows and inline hints. The floor — below this the round caps merge.' },
            { name: '16px', value: 'UI, 13px', use: 'Table cells, chips, dense toolbars.' },
            { name: '18px', value: 'Body, 14.5px', use: 'The default. Buttons, list items, navigation.' },
            { name: '22px', value: 'Heading, 15px+', use: 'Section markers and empty states.' },
            { name: '28px+', value: 'Feature use', use: 'Empty states and marketing. Above 32px, consider whether the logo mark is what you want instead.' },
          ]}
        />
        <Rules
          items={[
            'Align an icon to the cap height of its neighbouring text, not to the line box. In practice that is a 1px optical nudge upward at most sizes.',
            'The gap between an icon and its label is 8px at 18px, 6px at 16px and below.',
            'A tappable icon-only control needs a 44px hit area regardless of the icon size inside it.',
            'Never scale an icon non-uniformly, and never rotate one except chevronRight, which may be rotated in 90-degree steps for back and disclosure states.',
          ]}
        />
        <Figure caption="An icon inline with each of the four text sizes it pairs with. The stroke is intentionally the same weight as the text stem at every step.">
          <div className="flex flex-col gap-3.5">
            {[
              { icon: 'file', size: 14, text: 12, label: 'Roasting work instruction, rev 4' },
              { icon: 'clipCheck', size: 16, text: 13, label: 'Calibration certificate on file' },
              { icon: 'shield', size: 18, text: 14.5, label: 'Allergen segregation control is effective' },
              { icon: 'clipList', size: 22, text: 15, label: 'Internal audit programme' },
            ].map((row) => (
              <span key={row.icon} className="flex items-center gap-2.5 text-fg-1">
                <span className="text-action">
                  <Icon name={row.icon as IconName} size={row.size} />
                </span>
                <span style={{ fontSize: row.text, fontWeight: row.text >= 15 ? 650 : 400 }}>
                  {row.label}
                </span>
              </span>
            ))}
          </div>
        </Figure>
      </Block>

      <Block
        id="icon-or-text"
        title="An icon, or a word"
        intro="The default answer is a word. An icon earns its place by being faster to recognise than the word it replaces, and only a handful are."
      >
        <Rules
          items={[
            <>
              <strong>Use an icon alone</strong> only where the meaning is universal and the space is
              genuinely constrained: close, search, expand. Everything else gets a label.
            </>,
            <>
              <strong>Use an icon with a label</strong> for navigation and for entity types, where the
              icon becomes a landmark on a page the user visits daily. This is the most common case.
            </>,
            <>
              <strong>Use text alone</strong> for anything with legal or audit weight. A status of
              &ldquo;Gap&rdquo; is a word. A due date is a date. Nothing an auditor reads should be
              encoded in a picture.
            </>,
            <>
              <strong>Never use an icon as the only carrier of state.</strong> Colour plus icon is
              still not enough — every status in the product is a word, optionally accompanied by a
              chip and an icon.
            </>,
            <>
              <strong>Never use an icon decoratively.</strong> If it does not identify something, it
              is noise on a screen that already has a lot of it.
            </>,
          ]}
        />
        <H3>Accessible labelling</H3>
        <P>
          An icon beside a visible label is decorative and is marked{' '}
          <Mono>aria-hidden</Mono> — which the <Mono>Icon</Mono> component does by default. An
          icon-only control needs an accessible name on the control, and passing{' '}
          <Mono>aria-label</Mono> to the icon switches it out of the hidden state for the cases where
          the graphic itself is the content.
        </P>
      </Block>
    </>
  );
}
