import {
  KeelLockup,
  KeelMark,
  MARK_HULL_PATH,
  MARK_STROKE_WIDTH,
  MARK_VIEWBOX,
  MARK_WATERLINE_PATH,
} from '@/brand/Logo';
import { COLORWAYS, PALETTE } from '@/brand/tokens';
import { ASSET_GROUPS } from '../assets';
import { formatRatio, ratio } from '../contrast';
import { Block, Callout, Figure, H3, Mono, P, Rules, SpecTable, DownloadList } from '../ui';

/** Clear space is six stroke widths — the only unit the mark carries with it. */
const CLEAR_UNITS = MARK_STROKE_WIDTH * 6;
const CLEAR_FRACTION = CLEAR_UNITS / 24;

const LOGO_GROUPS = ASSET_GROUPS.filter((g) => g.label.startsWith('Logo'));

export function LogoContent() {
  return (
    <>
      <Block
        id="construction"
        title="Construction and meaning"
        intro={
          <>
            The mark is two strokes on a {MARK_VIEWBOX.split(' ')[2]}-unit grid: a chevron that reads
            as a hull, and a horizontal that reads as a waterline. Nothing else. It is drawn, not
            filled, so it holds up at 16px and at a metre.
          </>
        }
      >
        <P>
          A keel is the spine of a hull. It is the part nobody sees and the reason the boat stays
          upright and holds a course in weather. That is the claim the product makes about a
          management system, so the mark makes it too — a structure below the line, doing the work.
        </P>

        <Figure caption="The two paths on the 24-unit grid. Round caps and joins throughout; the waterline crosses the hull rather than stopping at it, which is what keeps the form reading as one object rather than two.">
          <div className="flex flex-wrap items-center justify-center gap-10">
            <ConstructionGrid />
            <div className="text-fg-1">
              <KeelMark size={132} stroke={MARK_STROKE_WIDTH} />
            </div>
          </div>
        </Figure>

        <SpecTable
          head={['Property', 'Value', 'Note']}
          rows={[
            { name: 'viewBox', value: MARK_VIEWBOX, use: 'Square. The mark is centred optically, not mathematically.' },
            { name: 'hull', value: MARK_HULL_PATH, use: 'The chevron. Apex sits below centre so the form has weight.' },
            { name: 'waterline', value: MARK_WATERLINE_PATH, use: 'Crosses the full width, above the chevron apex.' },
            { name: 'stroke-width', value: String(MARK_STROKE_WIDTH), use: 'Grid units. Scales with the mark; never overridden per size.' },
            { name: 'linecap / linejoin', value: 'round', use: 'Both. Square caps make the mark read as a checkmark.' },
            { name: 'fill', value: 'none', use: 'The mark is stroked. There is no solid version.' },
          ]}
        />

        <Callout title="The mark inherits currentColor">
          <Mono>KeelMark</Mono> is rendered inline as SVG, not as an <Mono>&lt;img&gt;</Mono>, so it
          takes the colour of whatever it sits in and rasterises during export without a network
          fetch. The files under <Mono>/assets/logo/</Mono> are deliverables for people outside this
          codebase; they are not runtime dependencies.
        </Callout>
      </Block>

      <Block
        id="lockups"
        title="The three lockups"
        intro="One mark, three arrangements. Pick by the space available, not by preference."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Figure caption="Horizontal — the default. Product headers, email signatures, letterheads, anywhere the space is wider than it is tall.">
            <div className="grid min-h-[132px] place-items-center text-fg-1">
              <KeelLockup size={30} />
            </div>
          </Figure>
          <Figure caption="Stacked — for narrow or centred contexts: app splash, tote print, a slide's title card, a square social frame.">
            <div className="grid min-h-[132px] place-items-center text-fg-1">
              <KeelLockup variant="stacked" size={30} />
            </div>
          </Figure>
          <Figure caption="Mark only — favicons, avatars, app icons, and any surface where the wordmark would fall below its minimum size.">
            <div className="grid min-h-[132px] place-items-center text-fg-1">
              <KeelMark size={48} />
            </div>
          </Figure>
        </div>

        <P>
          The wordmark is Newsreader at 600, tracked a hair open at 0.005em, sized 21 units for every
          24 units of mark. The uppercase descriptor beneath it is Hanken Grotesk at 10 units tracked
          to 0.09em. Those proportions are fixed. Scale the lockup by scaling the mark; everything
          else follows.
        </P>

        <H3>The descriptor</H3>
        <P>
          &ldquo;Management system&rdquo; is the default descriptor and can be swapped for a
          product-area label — &ldquo;Audit&rdquo;, &ldquo;Evidence&rdquo; — or dropped entirely.
          Drop it below a 20px mark, where it stops being legible and becomes texture.
        </P>
        <Figure caption="Descriptor present, swapped, and omitted. All three are approved; the third is what belongs in a dense product header.">
          <div className="flex flex-wrap items-center gap-x-12 gap-y-6 text-fg-1">
            <KeelLockup size={26} />
            <KeelLockup size={26} subtitle="Evidence register" />
            <KeelLockup size={26} subtitle={null} />
          </div>
        </Figure>
      </Block>

      <Block
        id="clear-space"
        title="Clear space"
        intro={
          <>
            Clear space is six stroke widths — {CLEAR_UNITS.toFixed(1)} units on the 24-unit grid, or{' '}
            {Math.round(CLEAR_FRACTION * 100)}% of the mark&rsquo;s height. It is measured from the
            outer edge of the lockup, on all four sides, and it scales with the mark.
          </>
        }
      >
        <P>
          Six stroke widths rather than a round fraction because the stroke is the one measurement
          the mark carries into every medium. Reduce a logo to 40% and the stroke reduces with it;
          the clear space then reduces correctly without anyone recalculating anything.
        </P>
        <Figure caption={`At a 32px mark the exclusion zone is ${(32 * CLEAR_FRACTION).toFixed(1)}px on every side. Nothing enters it — not type, not rules, not the edge of the page, not another logo.`}>
          <ClearSpaceDiagram />
        </Figure>
        <Rules
          items={[
            'The exclusion zone is a minimum, not a target. On a page with room, give it more.',
            'Page and screen edges count. A lockup flush to a trim edge has zero clear space on that side.',
            'In a partner or certification lock-up, the divider rule sits outside the zone, not on its boundary.',
          ]}
        />
      </Block>

      <Block
        id="minimum-sizes"
        title="Minimum sizes"
        intro="Below these the waterline closes up against the hull and the mark turns into a smudge."
      >
        <SpecTable
          head={['Lockup', 'Minimum', 'Where the limit comes from']}
          rows={[
            { name: 'Mark only', value: '16px / 5mm', use: 'The favicon-32 render is the practical floor; below 16px the stroke drops under one device pixel on a 1x screen.' },
            { name: 'Horizontal lockup', value: '20px mark / 104px wide', use: 'Set by the descriptor, which stops resolving first. Drop the descriptor and the floor becomes 18px.' },
            { name: 'Stacked lockup', value: '24px mark / 72px wide', use: 'The stacked wordmark sits under the mark with no width to borrow, so it needs the extra height.' },
            { name: 'Embroidery / etch', value: '20mm mark', use: 'Round caps need thread or tool radius to survive. Use keel-mark-mono.svg.' },
          ]}
        />
        <Figure caption="The mark at 64, 32, 24 and 16px, rendered at true size. The 16px render is the last one where the waterline is still a separate stroke.">
          <div className="flex flex-wrap items-end gap-8 text-action">
            {[64, 32, 24, 16].map((size) => (
              <span key={size} className="flex flex-col items-center gap-2.5">
                <KeelMark size={size} />
                <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
                  {size}px
                </span>
              </span>
            ))}
          </div>
        </Figure>
      </Block>

      <Block
        id="colourways"
        title="Approved colourways"
        intro="Four. Anything outside this list is a misuse, including tints of the approved colours."
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <LogoTile
            label="Teal on cream"
            note="The default. Every light ground."
            fg={PALETTE.action}
            bg={PALETTE.surface1}
            file="keel-mark-teal.svg"
          />
          <LogoTile
            label="Cream on teal"
            note="The signature. Full-bleed brand ground."
            fg={PALETTE.actionFg}
            bg={PALETTE.action}
            file="keel-mark-cream.svg"
          />
          <LogoTile
            label="Ink on cream"
            note="Documents, contracts, anything monochrome-printed."
            fg={PALETTE.fg1}
            bg={PALETTE.surface1}
            file="keel-mark-ink.svg"
          />
          <LogoTile
            label="Cream on ink"
            note="Dark UI, cinema slides, dark-mode assets."
            fg={PALETTE.surface1}
            bg={PALETTE.fg1}
            file="keel-mark-cream.svg"
          />
        </div>
        <P>
          There is no reversed-out knockout version, no gradient version and no single-colour version
          in a semantic colour. Green, amber and red carry status meaning throughout the product; a
          green logo would read as a passing audit.
        </P>
      </Block>

      <Block
        id="grounds"
        title="Placement on light and dark grounds"
        intro="The rule is contrast, not preference: pick the variant that keeps the mark above 3:1 against whatever is behind it."
      >
        <Figure
          pad={0}
          caption="The four colorway grounds the mark is approved to sit on, each with the correct variant. The teal and radial grounds take the cream mark; cream and canvas take teal."
        >
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {(['cream', 'canvas', 'teal', 'ink'] as const).map((id) => {
              const cw = COLORWAYS[id];
              return (
                <div
                  key={id}
                  data-colorway={id}
                  className="flex min-h-[150px] flex-col items-center justify-center gap-4 bg-t-bg text-t-accent"
                  style={{ backgroundImage: cw.bgImage }}
                >
                  <KeelLockup size={24} subtitle={null} />
                  <span className="font-mono text-t-fg-muted" style={{ fontSize: 10.5 }}>
                    {cw.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Figure>
        <Rules
          items={[
            'On photography, the mark goes in an area of even tone. If no such area exists, put the lockup on a solid teal or cream panel rather than fighting the image.',
            <>
              The teal mark on the canvas ground measures{' '}
              {formatRatio(ratio(PALETTE.action, PALETTE.canvas))}, which clears the 3:1 non-text
              threshold comfortably. Below 24px the stroke is thin enough that perceived contrast
              drops faster than the number does, so use the ink variant there instead.
            </>,
            'On the teal ground the mark is cream, not white. The palette has no pure white foreground.',
          ]}
        />
      </Block>

      <Block
        id="files"
        title="Files"
        intro="The vector masters and their raster fallbacks. Every file listed exists in the repository."
      >
        {LOGO_GROUPS.map((group) => (
          <DownloadList key={group.label} group={group} />
        ))}
      </Block>
    </>
  );
}

function LogoTile({
  label,
  note,
  fg,
  bg,
  file,
}: {
  label: string;
  note: string;
  fg: string;
  bg: string;
  file: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface-1">
      <div className="grid h-[104px] place-items-center" style={{ background: bg, color: fg }}>
        <KeelMark size={38} />
      </div>
      <div className="flex flex-col gap-1 border-t border-line px-3.5 py-3">
        <span className="text-fg-1" style={{ fontSize: 12.5, fontWeight: 650 }}>
          {label}
        </span>
        <span className="text-fg-2" style={{ fontSize: 11.5, lineHeight: 1.45 }}>
          {note}
        </span>
        <span className="mt-0.5 font-mono text-fg-3" style={{ fontSize: 10 }}>
          {file}
        </span>
      </div>
    </div>
  );
}

/** The mark drawn over its construction grid, with the two paths called out. */
function ConstructionGrid() {
  const cells = [6, 12, 18];
  return (
    <svg width={132} height={132} viewBox={MARK_VIEWBOX} role="img" aria-label="The Keel mark on its 24-unit construction grid">
      <rect x={0} y={0} width={24} height={24} fill={PALETTE.surface2} />
      {cells.map((c) => (
        <g key={c} stroke={PALETTE.borderStrong} strokeWidth={0.15}>
          <line x1={c} y1={0} x2={c} y2={24} />
          <line x1={0} y1={c} x2={24} y2={c} />
        </g>
      ))}
      <circle cx={12} cy={12} r={9} fill="none" stroke={PALETTE.border} strokeWidth={0.15} />
      <path
        d={MARK_WATERLINE_PATH}
        stroke={PALETTE.fg3}
        strokeWidth={MARK_STROKE_WIDTH}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={MARK_HULL_PATH}
        stroke={PALETTE.action}
        strokeWidth={MARK_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Clear space shown rather than described: the zone drawn around a real lockup. */
function ClearSpaceDiagram() {
  const mark = 32;
  const pad = mark * CLEAR_FRACTION;
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <div
        className="relative"
        style={{ padding: pad, background: PALETTE.actionWeak, border: `1px dashed ${PALETTE.actionWeakBd}` }}
      >
        <div className="text-action" style={{ outline: `1px dashed ${PALETTE.borderStrong}` }}>
          <KeelLockup size={mark} />
        </div>
        <span
          aria-hidden
          className="absolute font-mono text-action"
          style={{ fontSize: 9.5, top: pad / 2 - 6, left: 6 }}
        >
          {pad.toFixed(1)}px
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {[
          ['Unit', `stroke-width × 6 = ${CLEAR_UNITS.toFixed(1)} grid units`],
          ['As a fraction', `${Math.round(CLEAR_FRACTION * 100)}% of mark height`],
          ['At a 24px mark', `${(24 * CLEAR_FRACTION).toFixed(1)}px`],
          ['At a 32px mark', `${(32 * CLEAR_FRACTION).toFixed(1)}px`],
          ['At a 96px mark', `${(96 * CLEAR_FRACTION).toFixed(1)}px`],
        ].map(([k, v]) => (
          <li key={k} className="flex gap-3">
            <span className="text-fg-3" style={{ fontSize: 12, width: 104 }}>
              {k}
            </span>
            <span className="font-mono text-fg-1" style={{ fontSize: 12 }}>
              {v}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
