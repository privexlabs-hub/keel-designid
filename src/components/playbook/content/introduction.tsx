import Link from 'next/link';
import { Icon } from '@/brand/icons';
import { KeelLockup } from '@/brand/Logo';
import { PALETTE } from '@/brand/tokens';
import { COMPANY } from '@/data/demo';
import { SECTIONS, href } from '../sections';
import { Block, Callout, Figure, P, Rules, H3 } from '../ui';

export function IntroductionContent() {
  return (
    <>
      <Block
        id="what-keel-is"
        title="What Keel is"
        intro={
          <>
            Keel is a management-system platform for small and mid-sized businesses that hold ISO
            certifications — 9001, 14001, 27001 and the rest of that family. It holds the processes,
            risks, controls, controlled documents, evidence, audits and corrective actions that an
            auditor will ask to see, and keeps the links between them intact so nobody has to
            reconstruct the chain the week before a surveillance visit.
          </>
        }
      >
        <P>
          The demo workspace throughout this document is {COMPANY.name}, a roastery certified to{' '}
          {COMPANY.standards.join(' and ')}. It is a useful stand-in for the real customer: forty
          people, one quality manager who also does half a dozen other jobs, and a certificate that
          has to survive an annual audit.
        </P>
        <P>
          That customer shapes every decision here. They are not buying software because they enjoy
          software. They are buying an hour back and the confidence that the answer they give an
          auditor is the answer the system would give. An identity that shouts, or that decorates,
          gets in the way of that.
        </P>
      </Block>

      <Block
        id="what-the-identity-has-to-do"
        title="What the identity has to achieve"
        intro="Four jobs, in priority order. Where two of them conflict, the earlier one wins."
      >
        <Rules
          ordered
          items={[
            <>
              <strong>Read as credible.</strong> The product sits next to certificates, audit reports
              and legal obligations. It has to look like something a certification body would not
              blink at. That is where the serif, the restrained palette and the near-absence of
              decoration come from.
            </>,
            <>
              <strong>Stay legible under load.</strong> A dense evidence register at 12px on a laptop
              screen at the end of a long day is the real design brief. Contrast, tracking and
              spacing are tuned for that view first and the marketing site second.
            </>,
            <>
              <strong>Feel calm.</strong> Compliance work is anxious work. Warm cream rather than
              clinical white, deep teal rather than alarm red, and motion measured in fractions of a
              second are all deliberate attempts to lower the temperature.
            </>,
            <>
              <strong>Be reproducible by anyone.</strong> A brand that only its author can apply is
              not a brand. Everything here resolves to a named token, so a contractor with this
              document and the asset files can produce work that matches without asking.
            </>,
          ]}
        />
      </Block>

      <Block
        id="the-shape-of-it"
        title="The shape of it"
        intro="Three decisions carry most of the identity. The rest of this document is their consequences."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Figure
            pad={0}
            caption="A hull cutting a waterline. Two strokes, one idea: the thing that keeps a business upright and pointed."
          >
            <div
              className="grid h-[150px] place-items-center"
              style={{ background: PALETTE.action, color: PALETTE.actionFg }}
            >
              <KeelLockup size={30} subtitle={null} />
            </div>
          </Figure>
          <Figure
            pad={0}
            caption="Deep teal on warm cream. Not corporate blue, not startup black — a colour with some sea in it."
          >
            <div className="grid h-[150px] grid-cols-2">
              <span style={{ background: PALETTE.canvas }} />
              <span style={{ background: PALETTE.action }} />
            </div>
          </Figure>
          <Figure
            pad={0}
            caption="A serif for headings, a grotesk for the interface, a mono for anything an auditor will read back to you."
          >
            <div
              className="flex h-[150px] flex-col items-center justify-center gap-1"
              style={{ background: PALETTE.surface1 }}
            >
              <span className="font-display text-fg-1" style={{ fontSize: 26, fontWeight: 600 }}>
                Keel
              </span>
              <span className="text-fg-2" style={{ fontSize: 13 }}>
                Management system
              </span>
              <span className="font-mono text-fg-3" style={{ fontSize: 11.5 }}>
                RSK-014
              </span>
            </div>
          </Figure>
        </div>
      </Block>

      <Block
        id="how-to-use-this"
        title="How to use this document"
        intro="Read it once end to end. After that, treat it as a reference and come back for the specifics."
      >
        <Rules
          items={[
            <>
              <strong>Every value shown is read from the source, not retyped.</strong> The hexes,
              sizes, easing curves and asset sizes on these pages are pulled from{' '}
              <Link href="/foundation/" className="text-action">
                the token layer
              </Link>{' '}
              at build time. If a number here disagrees with the code, the code has moved and this
              page will move with it.
            </>,
            <>
              <strong>Where a rule has a reason, the reason is given.</strong> Rules you understand
              survive contact with a deadline; rules you have merely been handed do not.
            </>,
            <>
              <strong>Where something fails, it says so.</strong> The colour section publishes
              measured contrast ratios including the pairs that do not pass, and says where those
              pairs may still be used.
            </>,
          ]}
        />

        <Callout title="One rule that will bite you first">
          The bundled font subsets contain no arrow or check-mark glyphs. Typing{' '}
          <span className="font-mono">U+2192</span> or <span className="font-mono">U+2713</span> as a
          text character does not throw — it silently falls back to a system font and rasterises
          wrongly into every exported image. Use the <span className="font-mono">chevronRight</span>,{' '}
          <span className="font-mono">arrowUp</span>, <span className="font-mono">arrowDown</span> and{' '}
          <span className="font-mono">clipCheck</span> icons instead. See{' '}
          <Link href={href('typography')} className="text-action">
            Typography
          </Link>
          .
        </Callout>
      </Block>

      <Block id="contents" title="What is in here">
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
          {SECTIONS.slice(1).map((s, i) => (
            <li key={s.slug}>
              <Link
                href={href(s.slug)}
                className="flex h-full items-start gap-3 rounded-xl border border-line bg-surface-1 px-4 py-3.5 no-underline"
              >
                <span className="mt-[2px] shrink-0 font-mono text-fg-3" style={{ fontSize: 11 }}>
                  {String(i + 2).padStart(2, '0')}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-fg-1" style={{ fontSize: 14, fontWeight: 600 }}>
                    {s.title}
                  </span>
                  <span className="text-fg-2" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                    {s.summary}
                  </span>
                </span>
                <span className="mt-[3px] shrink-0 text-action" aria-hidden>
                  <Icon name="chevronRight" size={15} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <H3>Out of scope</H3>
        <P>
          This is the identity, not the product specification. Component behaviour, data model and
          copy for individual screens live with the product team. Where this document touches a
          component it is to show the identity applied, not to define the component.
        </P>
      </Block>
    </>
  );
}
