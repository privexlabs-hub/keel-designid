import { KeelLockup, KeelMark } from '@/brand/Logo';
import { PALETTE } from '@/brand/tokens';
import { Block, Callout, Dont, DontGrid, Figure, P, Rules } from '../ui';

/**
 * Every tile below is the real lockup component with a CSS transform or a
 * colour override applied — not a screenshot and not a description. If the mark
 * changes, these break the same way the real misuse would.
 */
/**
 * Deliberately off-palette. This is the one hex in the playbook that is not a
 * brand token, and it is here because the failure it demonstrates is "a colour
 * that is not a brand token".
 */
const OFF_PALETTE = '#7B3FA0';

export function MisuseContent() {
  return (
    <>
      <Block
        id="the-rule"
        title="One rule"
        intro="The mark is a fixed object. Scale it and place it. Do not redraw it, restyle it, or rearrange it."
      >
        <P>
          Everything on this page follows from that. The specific failures below are the ones that
          actually turn up — in decks, in supplier artwork, in a well-meant attempt to make the logo
          fit a space it was not given enough room for.
        </P>
        <Figure caption="For reference: the horizontal lockup, correct. Compare anything doubtful against this.">
          <div className="grid min-h-[112px] place-items-center text-action">
            <KeelLockup size={30} />
          </div>
        </Figure>
      </Block>

      <Block
        id="dont"
        title="Do not"
        intro="Nine failures, rendered rather than described."
      >
        <DontGrid>
          <Dont
            label="Stretch or squash"
            reason="Non-uniform scaling changes the stroke weight on one axis. The waterline thickens, the hull thins, and the mark stops matching every other instance of it."
          >
            <span className="text-action" style={{ display: 'inline-block', transform: 'scaleX(1.6)' }}>
              <KeelMark size={54} />
            </span>
          </Dont>

          <Dont
            label="Rotate or tilt"
            reason="The waterline is horizontal because it is a waterline. At any other angle the mark reads as a checkmark with a slash through it."
          >
            <span className="text-action" style={{ display: 'inline-block', transform: 'rotate(-18deg)' }}>
              <KeelMark size={54} />
            </span>
          </Dont>

          <Dont
            label="Recolour off palette"
            reason="Four colourways are approved. A colour outside them breaks recognition, and a semantic colour — green, amber, red — reads as a status the logo is not reporting."
          >
            <span style={{ color: OFF_PALETTE }}>
              <KeelMark size={54} />
            </span>
          </Dont>

          <Dont
            label="Place at low contrast"
            reason="Below 3:1 against its ground the mark stops being an identifier and becomes a watermark. Measure, then pick the variant that clears the threshold."
          >
            <span style={{ color: PALETTE.surface3 }}>
              <KeelMark size={54} />
            </span>
          </Dont>

          <Dont
            label="Add a shadow, glow or bevel"
            reason="The mark is a stroke on a ground. Elevation belongs to the surface the mark sits on, never to the mark. Effects also fail to rasterise consistently in export."
          >
            <span
              className="text-action"
              style={{ display: 'inline-block', filter: `drop-shadow(0 3px 5px ${PALETTE.scrim})` }}
            >
              <KeelMark size={54} />
            </span>
          </Dont>

          <Dont
            label="Set on a busy ground"
            reason="Detail behind the strokes destroys the silhouette. If the image has no even area, put the lockup on a solid panel instead of fighting it."
          >
            <span
              className="absolute inset-0 grid place-items-center"
              style={{
                backgroundImage: `repeating-linear-gradient(48deg, ${PALETTE.warn} 0 10px, ${PALETTE.brand} 10px 20px, ${PALETTE.danger} 20px 30px)`,
              }}
            >
              <span style={{ color: PALETTE.actionFg }}>
                <KeelMark size={54} />
              </span>
            </span>
          </Dont>

          <Dont
            label="Reproportion the lockup"
            reason="The wordmark is 21 units per 24 of mark, at a fixed gap. Resizing one part relative to the other makes it a different logo."
          >
            <span
              className="flex items-center text-action"
              style={{ gap: 26 }}
            >
              <KeelMark size={30} />
              <span
                className="font-display"
                style={{ fontSize: 40, fontWeight: 600, letterSpacing: '0.14em' }}
              >
                Keel
              </span>
            </span>
          </Dont>

          <Dont
            label="Substitute the wordmark type"
            reason="The wordmark is Newsreader 600. Any other face — including another serif — is a different brand wearing the mark."
          >
            <span className="flex items-center gap-3 text-action">
              <KeelMark size={30} />
              <span className="font-mono" style={{ fontSize: 26, fontWeight: 500 }}>
                Keel
              </span>
            </span>
          </Dont>

          <Dont
            label="Crowd it"
            reason="Six stroke widths of clear space, minimum, on every side. A rule, a caption or a page edge inside that zone counts as crowding."
          >
            <span className="flex items-center gap-1.5 text-action">
              <span className="h-[46px] w-px" style={{ background: PALETTE.borderStrong }} />
              <KeelLockup size={24} subtitle={null} />
              <span className="h-[46px] w-px" style={{ background: PALETTE.borderStrong }} />
            </span>
          </Dont>
        </DontGrid>
      </Block>

      <Block id="also" title="Also not allowed" intro="Less common, equally wrong.">
        <Rules
          items={[
            'Outlining the mark, or filling the chevron to make a solid shape. There is no filled version.',
            'Using the mark as a bullet, a checkbox, or a decorative motif in body copy. It is an identifier, not an ornament.',
            'Cropping the mark, or letting it bleed off an edge. The waterline needs both of its round caps.',
            'Reconstructing the lockup by typing "Keel" next to a downloaded mark. Use the lockup files.',
            'Animating the mark on load. The identity does not perform.',
          ]}
        />
        <Callout title="If you are unsure">
          Compare against the reference lockup at the top of this page at the same size, side by side.
          Almost every misuse is obvious in that comparison and almost none of them are obvious
          without it.
        </Callout>
      </Block>
    </>
  );
}
