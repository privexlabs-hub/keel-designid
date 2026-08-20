import { Icon } from '@/brand/icons';
import { PALETTE, SHADOWS } from '@/brand/tokens';
import { CONTROLS, DOCUMENTS, EVIDENCE } from '@/data/demo';
import { Block, Callout, Figure, H3, Mono, P, Rules, SpecTable } from '../ui';

/** The spacing steps in use, in px. A 4px base with a 2px half-step for optics. */
const SPACING = [2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 56] as const;

/** Radii, from the source. Seven values, each with one job. */
const RADII = [
  { value: 4, name: 'rounded', use: 'Swatch chips, inline code, the smallest tinted blocks.' },
  { value: 6, name: 'rounded-md', use: 'Navigation items and other hit areas inside a panel.' },
  { value: 7, name: '7px', use: 'Inputs and buttons. The one odd number, and it is odd because it was drawn that way.' },
  { value: 8, name: 'rounded-lg', use: 'Cards inside cards, swatch tiles, callouts.' },
  { value: 12, name: 'rounded-xl', use: 'The default panel. Most bordered surfaces in the product are this.' },
  { value: 14, name: '14px', use: 'Modals and drawers — the layer above the page.' },
  { value: 999, name: 'rounded-full', use: 'Badges, chips, avatars, scroll thumbs. Anything that reads as a pill.' },
] as const;

export function LayoutContent() {
  const control = CONTROLS[0];
  const controlDoc = DOCUMENTS.find((d) => d.id === control.doc);
  const evidence = EVIDENCE[0];

  return (
    <>
      <Block
        id="spacing"
        title="Spacing"
        intro="A 4px base, with a 2px half-step available for optical corrections and nothing smaller."
      >
        <P>
          Spacing in this system is doing structural work, because there is very little else doing
          it — few shadows, no dividers where whitespace will serve. The steps below are what the
          product uses. Anything between them is a mistake or a nudge, and a nudge should be
          commented.
        </P>
        <Figure caption="The scale at true size. The jump from 16 to 20 to 24 is where most layout decisions actually happen.">
          <div className="flex flex-wrap items-end gap-4">
            {SPACING.map((s) => (
              <span key={s} className="flex flex-col items-center gap-2">
                <span
                  className="block rounded"
                  style={{ width: s, height: s, background: PALETTE.action, minWidth: 2 }}
                />
                <span className="font-mono text-fg-3" style={{ fontSize: 10 }}>
                  {s}
                </span>
              </span>
            ))}
          </div>
        </Figure>
        <SpecTable
          head={['Step', 'Used for', 'Note']}
          rows={[
            { name: '2 – 6', value: 'Inside a component', use: 'Gap between an icon and its label, between a label and its value.' },
            { name: '8 – 12', value: 'Between components', use: 'Stacked form fields, list items, chips in a row.' },
            { name: '14 – 24', value: 'Panel padding', use: '20px is the default card padding; 24 – 28 on wide screens.' },
            { name: '28 – 40', value: 'Between blocks', use: 'One section to the next inside a page.' },
            { name: '56+', value: 'Between page regions', use: 'Masthead to content, content to footer.' },
          ]}
        />
      </Block>

      <Block
        id="radii"
        title="Radii"
        intro="Seven values. Each is tied to a kind of object, and the pattern is that the higher the layer, the larger the radius."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {RADII.map((r) => (
            <div key={r.value} className="flex flex-col items-center gap-2.5">
              <span
                className="grid h-16 w-full place-items-center border"
                style={{
                  borderRadius: r.value,
                  background: PALETTE.actionWeak,
                  borderColor: PALETTE.actionWeakBd,
                }}
              />
              <span className="font-mono text-fg-1" style={{ fontSize: 11 }}>
                {r.value === 999 ? '999' : r.value}
              </span>
            </div>
          ))}
        </div>
        <SpecTable
          head={['Radius', 'Utility', 'Applied to']}
          rows={RADII.map((r) => ({ name: `${r.value}px`, value: r.name, use: r.use }))}
        />
        <Rules
          items={[
            'A radius is a property of the object, not of the design. Two cards side by side always have the same radius.',
            'Nested corners: the inner radius is the outer radius minus the padding between them, floored at 4. A 12px card with 8px padding takes 4px inner corners.',
            'Never mix 999 with a rectangular sibling in the same row of controls.',
          ]}
        />
      </Block>

      <Block
        id="borders-and-elevation"
        title="Borders and elevation"
        intro="Structure comes from lines. Shadow is reserved for things that genuinely float, and there are only three of them."
      >
        <P>
          A warm cream page cannot take much shadow before it looks grubby, and every shadow is one
          more thing that has to survive rasterisation into an exported PNG. So the system separates
          surfaces with a hairline and a one-step change in the surface ramp, and keeps the three
          shadows for layers that are actually above the page.
        </P>
        <Figure caption="The three shadows at true value. shadow-sm is the only one that appears on a resting surface; md is a popover or a hover lift; lg is a modal.">
          <div className="flex flex-wrap gap-5">
            {Object.entries(SHADOWS).map(([name, value]) => (
              <div
                key={name}
                className="grid h-24 w-40 place-items-center rounded-xl"
                style={{ background: PALETTE.surface1, boxShadow: value }}
              >
                <span className="font-mono text-fg-2" style={{ fontSize: 11 }}>
                  shadow-{name}
                </span>
              </div>
            ))}
          </div>
        </Figure>
        <SpecTable
          head={['Level', 'Treatment', 'Examples']}
          rows={[
            { name: 'Page', value: 'canvas, no border', use: 'The ground. Nothing sits at this level except the background.' },
            { name: 'Panel', value: 'surface-1 + border + 12px', use: 'Cards, tables, sidebars. No shadow at rest.' },
            { name: 'Inset', value: 'surface-2 + border-faint', use: 'Table headers, wells, code blocks. Recedes rather than lifts.' },
            { name: 'Hover', value: 'surface-2 fill, no shadow', use: 'A row or item under the cursor. The surface changes; nothing moves.' },
            { name: 'Floating', value: 'overlay + shadow-md + 14px', use: 'Popovers, menus, tooltips.' },
            { name: 'Modal', value: 'overlay + shadow-lg + 14px + scrim', use: 'Dialogs and drawers only.' },
          ]}
        />
        <Callout title="No backdrop-filter in exported work">
          Blur behind a surface does not survive rasterisation — the export library flattens the DOM
          and the frosted layer comes out as a flat fill. It is fine in the dashboard, which is never
          exported. It is banned in anything under <Mono>src/templates</Mono>.
        </Callout>
      </Block>

      <Block
        id="grid"
        title="Grid and columns"
        intro="Twelve columns where a grid is needed, but most of the product is a two-column shell with a content stack inside it."
      >
        <SpecTable
          head={['Breakpoint', 'Width', 'Shell']}
          rows={[
            { name: 'base', value: '< 640px', use: 'Single column. Navigation collapses to a disclosure. 20px page gutters.' },
            { name: 'sm', value: '640px', use: 'Two-up card grids. 32px gutters.' },
            { name: 'md', value: '768px', use: 'The sidebar appears and becomes sticky. Content gets its own scroll context.' },
            { name: 'lg', value: '1024px', use: 'Three-up grids; detail drawer opens beside the list rather than over it.' },
            { name: 'xl', value: '1280px', use: 'Full density. Above this the dashboard is pixel-identical to the source.' },
          ]}
        />
        <Rules
          items={[
            'Content columns are capped: 860px for a document page, 1100px for a reference page, 1400px for the dashboard. Beyond that, add columns rather than width.',
            'Page gutters are 20px at base, 32px from sm, 48px from md. They never shrink below 20px.',
            'Touch targets are 44px minimum at every breakpoint, including on desktop where a control might be used with a stylus.',
            'Use dvh rather than vh for anything full-height. Mobile browser chrome makes vh wrong for the first scroll.',
          ]}
        />
      </Block>

      <Block
        id="density"
        title="Density"
        intro="Two densities: reading and register. Do not invent a third, and do not mix them on one screen."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Figure caption="Reading density — 20px padding, 1.65 line height, generous gaps. For anything a person reads in sequence.">
            <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface-1 p-5">
              <span className="flex items-center gap-2.5 text-action">
                <Icon name="shield" size={18} />
                <span className="text-fg-1" style={{ fontSize: 15, fontWeight: 650 }}>
                  {control.name}
                </span>
              </span>
              <p className="m-0 text-fg-2" style={{ fontSize: 14.5, lineHeight: 1.65 }}>
                A {control.type.toLowerCase()} control, currently {control.status}, defined by{' '}
                {controlDoc ? `${controlDoc.code} ${controlDoc.name.toLowerCase()}` : 'a controlled document'}
                . Evidence is attached each time it runs and the result is reported at management
                review.
              </p>
              <span className="font-mono text-fg-3" style={{ fontSize: 12 }}>
                {control.code}
              </span>
            </div>
          </Figure>
          <Figure
            pad={0}
            caption="Register density — 10px vertical padding, 1.4 line height, mono codes right-aligned. For anything scanned rather than read."
          >
            <table className="w-full">
              <thead>
                <tr style={{ background: PALETTE.surface2 }}>
                  {['Code', 'Evidence', 'Status'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-2 text-left text-fg-3 uppercase"
                      style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.11em' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EVIDENCE.slice(0, 5).map((e) => (
                  <tr key={e.id} className="border-b border-line-faint last:border-b-0">
                    <td className="px-4 py-2.5 font-mono text-fg-2" style={{ fontSize: 11.5 }}>
                      {e.code}
                    </td>
                    <td className="px-4 py-2.5 text-fg-1" style={{ fontSize: 12.5, lineHeight: 1.4 }}>
                      {e.name}
                    </td>
                    <td className="px-4 py-2.5 text-fg-2" style={{ fontSize: 12 }}>
                      {e.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Figure>
        </div>
        <H3>Choosing</H3>
        <P>
          If the reader arrived to find one specific row, it is a register. If they arrived to
          understand one thing, it is reading density. The detail view for{' '}
          <Mono>{evidence.code}</Mono> is reading density even though it was reached from a register,
          because the job changed at the click.
        </P>
      </Block>
    </>
  );
}
