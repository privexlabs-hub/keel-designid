import { COMPANY } from '@/data/demo';
import { Block, Callout, DoDont, H3, P, Rules } from '../ui';

export function VoiceContent() {
  return (
    <>
      <Block
        id="who-we-are-talking-to"
        title="Who we are talking to"
        intro="A quality manager at a forty-person business who did not choose to become a compliance professional and has four other jobs."
      >
        <P>
          They are competent and short of time. They know their standard better than we do. What they
          do not have is patience for software that explains itself at length, congratulates them, or
          hedges. When something is wrong they need to know what it is, where it is, and what happens
          if they leave it. When something is fine they need one line confirming it and nothing more.
        </P>
        <P>
          The second reader matters too: an external auditor, looking over a shoulder at{' '}
          {COMPANY.name}&rsquo;s screen. Everything the product says should be something you would be
          comfortable having read aloud in that room.
        </P>
      </Block>

      <Block
        id="principles"
        title="Five principles"
        intro="In order. Where two conflict, the earlier one wins."
      >
        <Rules
          ordered
          items={[
            <>
              <strong>Say the thing.</strong> Lead with the fact, then the consequence, then the
              action. No preamble, no throat-clearing, no restating the question.
            </>,
            <>
              <strong>Be specific or be silent.</strong> &ldquo;Three documents are past their review
              date&rdquo; is useful. &ldquo;Some items need attention&rdquo; is a notification we
              should not have sent.
            </>,
            <>
              <strong>Never oversell.</strong> No exclamation marks, no superlatives, no
              &ldquo;powerful&rdquo; or &ldquo;seamless&rdquo;, no emoji. The product&rsquo;s
              credibility is the product.
            </>,
            <>
              <strong>Use the reader&rsquo;s vocabulary.</strong> They say nonconformity, clause,
              surveillance audit, corrective action. Use those words precisely and do not invent
              synonyms for them.
            </>,
            <>
              <strong>Own the system&rsquo;s failures, not the user&rsquo;s.</strong> If we could not
              save something, say so plainly. If a control lapsed, report it without adjectives — it
              is a fact, not an accusation.
            </>,
          ]}
        />
      </Block>

      <Block
        id="examples"
        title="We write / we don’t write"
        intro="Real strings from the domain. The right-hand column is not invented — it is the sort of thing that gets written when nobody is holding the line."
      >
        <div className="flex flex-col gap-4">
          <DoDont
            write="Three controlled documents are past their review date. The oldest, QMS-04, was due 62 days ago."
            avoid="Heads up! It looks like some of your documents might need a little attention."
            why="Counts, names and elapsed time are what let someone act without opening anything. Softening language costs the reader a click to find out whether it matters."
          />
          <DoDont
            write="Evidence for CTL-07 expires on 14 March. Without it the control reverts to untested at the next review."
            avoid="Don't forget to renew your evidence to stay compliant and audit-ready!"
            why="State the consequence rather than the imperative. The reader decides what to do; our job is to make sure they are deciding with the facts."
          />
          <DoDont
            write="No controls are mapped to clause 8.5.1."
            avoid="Uh oh — we found a compliance gap in your management system."
            why="A gap is a normal finding, not a crisis. Alarm in the copy makes the product feel unreliable and makes real problems harder to distinguish."
          />
          <DoDont
            write="Audit A-03 closed with two minor nonconformities. Both have corrective actions open."
            avoid="Great news — your audit is complete! 🎉"
            why="Two nonconformities is not great news, and it is not bad news either. It is the result. Report it."
          />
          <DoDont
            write="We couldn't save this change. Your edits are still here — try again, or copy them somewhere safe first."
            avoid="An unexpected error occurred. Please try again later."
            why="Say what failed, what survived, and what the reader can do. An error message that tells the reader nothing is worse than no message."
          />
          <DoDont
            write="Keel keeps the link between a risk, the control that treats it, and the evidence that the control ran."
            avoid="Keel is a powerful, all-in-one platform that transforms compliance and unlocks growth."
            why="A concrete description of one mechanism is more persuasive to this buyer than any number of adjectives, and it survives contact with a demo."
          />
          <DoDont
            write="Delete RSK-014? Its two controls and their evidence stay in place, unlinked."
            avoid="Are you sure you want to delete this? This action cannot be undone."
            why="Name the object and describe what actually happens to everything attached to it. Generic confirmations train people to click through them."
          />
        </div>
      </Block>

      <Block id="mechanics" title="Mechanics" intro="The small decisions, settled once.">
        <Rules
          items={[
            'Sentence case everywhere — headings, buttons, table columns, navigation. Title Case is for proper nouns and standard names.',
            'No exclamation marks. There is no sentence this product needs to say that requires one.',
            'No emoji, in the interface or in marketing.',
            'Second person for instructions, first person plural when the product is the actor: "We couldn’t save this change."',
            'Dates are unambiguous: 14 March 2026, or 2026-03-14 in mono where columns must align. Never 03/14.',
            'Entity codes are mono and always shown with the name on first mention: RSK-014, Undeclared allergen in blend.',
            'Contractions are fine and preferred. "Cannot" reads as a legal document; "can’t" reads as a person.',
            'Buttons are verbs: Add control, Close finding, Export register. Not "Submit", not "OK".',
            'Numbers under ten are words in prose and digits in data. In a table they are always digits.',
          ]}
        />
        <H3>Words to avoid</H3>
        <P>
          Seamless, effortless, powerful, robust, leverage, unlock, empower, revolutionise,
          game-changing, best-in-class, simply, just, easily. Most of them make a promise the reader
          will test within a week. &ldquo;Simply&rdquo; and &ldquo;just&rdquo; are worse than the
          rest: they tell someone struggling that the task was supposed to be easy.
        </P>
        <Callout title="The test">
          Read the sentence back as if an auditor were in the room and the screen were on a
          projector. If it would sound like marketing, or like an apology, or like it was hiding
          something, rewrite it.
        </Callout>
      </Block>
    </>
  );
}
