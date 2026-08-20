'use client';

import { useState } from 'react';
import { EASING } from '@/brand/tokens';
import { Icon } from '@/brand/icons';
import { Block, Callout, Figure, Mono, P, Rules, SpecTable } from '../ui';

/**
 * Motion is the one section that has to demonstrate itself. Each figure
 * replays on demand rather than looping — a looping animation in a reference
 * document is a distraction, and it also defeats prefers-reduced-motion.
 */

const KEYFRAMES = [
  {
    name: 'kf-fade',
    from: 'opacity 0, translateY(4px)',
    to: 'opacity 1, none',
    use: 'Content arriving in place: a view swapping, a list rendering, a panel filling in.',
    duration: 180,
  },
  {
    name: 'kf-scrim',
    from: 'opacity 0',
    to: 'opacity 1',
    use: 'The backdrop behind a drawer or dialog. Nothing but opacity — a scrim that moves reads as a bug.',
    duration: 160,
  },
  {
    name: 'kf-drawer',
    from: 'translateX(28px), opacity 0',
    to: 'none, opacity 1',
    use: 'The detail drawer entering from the right. On phones the same idea runs vertically as a bottom sheet.',
    duration: 220,
  },
] as const;

export function MotionContent() {
  return (
    <>
      <Block
        id="principles"
        title="What motion is for"
        intro={
          <>
            Keel is a system of record. People open it to find out whether something is overdue, and
            they open it often. Motion here has one job — to explain where a thing came from — and it
            has to do that job without ever making someone wait.
          </>
        }
      >
        <Rules
          items={[
            <>
              <strong>Motion explains origin.</strong> A drawer slides from the right because that is
              where it lives. A scrim fades because it is a change in light, not an object.
            </>,
            <>
              <strong>Nothing animates on first paint.</strong> The dashboard renders finished. Entry
              animations are for things the user just caused.
            </>,
            <>
              <strong>Numbers never animate.</strong> A conformance figure does not count up. It is a
              measurement, and animating it implies a precision the data does not have.
            </>,
            <>
              <strong>Nothing loops.</strong> There are no spinners on the dashboard; loading states
              are skeletons that hold the final layout.
            </>,
            <>
              <strong>If it is not caused by a click, it should not move.</strong> No parallax, no
              scroll-triggered reveals, no attention-seeking.
            </>,
          ]}
        />
      </Block>

      <Block
        id="curves"
        title="Two curves"
        intro="Both are imported from the source. There is no third, and no linear."
      >
        <SpecTable
          head={['Token', 'Value', 'Use']}
          rows={[
            {
              name: '--ease',
              value: EASING.ease,
              use: 'The default. Slight ease-in, decisive ease-out. Everything that changes state in place — hovers, colour, borders, small position shifts.',
            },
            {
              name: '--ease-out',
              value: EASING.easeOut,
              use: 'Strongly decelerating. Anything entering the viewport: drawers, sheets, popovers. It arrives fast and settles, which reads as responsive rather than slow.',
            },
          ]}
        />
        <Figure caption="The same 28px travel on each curve. Ease-out covers most of the distance immediately, which is why it suits things that enter.">
          <CurveDemo />
        </Figure>
        <Callout title="Never use a linear curve">
          Linear motion has no physical analogue, and at these durations it reads as mechanical.
          Where a transition is defined without a curve, it inherits <Mono>--ease</Mono>.
        </Callout>
      </Block>

      <Block
        id="durations"
        title="Durations"
        intro="Short enough that nobody waits; long enough that the eye can follow."
      >
        <SpecTable
          head={['Duration', 'Applies to', 'Notes']}
          rows={[
            { name: '90ms', value: 'Colour and border only', use: 'Hover and focus on buttons, rows, chips. Fast enough to feel instantaneous while still smoothing the change.' },
            { name: '160ms', value: 'Scrims, fades, disclosure', use: 'Opacity-only changes, and small expansions such as an accordion.' },
            { name: '180ms', value: 'Content entering in place', use: 'View transitions and list rendering.' },
            { name: '220ms', value: 'Drawers and sheets', use: 'The longest duration in the system. Travel is greater, so the eye needs slightly longer.' },
            { name: '0ms', value: 'Everything, under reduced motion', use: 'Not a shortened duration — removed entirely.' },
          ]}
        />
        <P>
          Nothing in Keel animates for longer than 220ms. If a transition seems to need more time,
          the travel distance is wrong, not the duration.
        </P>
      </Block>

      <Block
        id="keyframes"
        title="The three keyframes"
        intro="Defined once globally and reused. Adding a fourth should feel like a significant decision."
      >
        <div className="flex flex-col gap-4">
          {KEYFRAMES.map((kf) => (
            <KeyframeDemo key={kf.name} {...kf} />
          ))}
        </div>
      </Block>

      <Block
        id="reduced-motion"
        title="Reduced motion"
        intro="A preference, not a downgrade. The interface loses nothing but the movement."
      >
        <P>
          Every animation and transition is reduced to effectively zero under{' '}
          <Mono>prefers-reduced-motion: reduce</Mono>, globally, in{' '}
          <Mono>src/app/globals.css</Mono>. Because motion in Keel only ever explains origin and
          never carries information, removing it costs nothing — the drawer still appears, it simply
          appears immediately.
        </P>
        <Rules
          items={[
            'Never gate meaning behind an animation. If a state change is only legible while it moves, the state is not designed.',
            'Do not re-enable motion for a component you consider important. The preference is not negotiable per component.',
            'Auto-scrolling, carousels that advance on their own, and parallax are not used at all, so there is nothing to disable.',
          ]}
        />
      </Block>
    </>
  );
}

function CurveDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      {(['--ease', '--ease-out'] as const).map((token) => (
        <div key={token} className="flex items-center gap-4">
          <span className="w-24 shrink-0 font-mono text-fg-3" style={{ fontSize: 10.5 }}>
            {token}
          </span>
          <span className="relative h-8 flex-1 rounded-md border border-line bg-surface-2">
            <span
              key={run}
              className="absolute top-1/2 h-4 w-4 rounded-full bg-action"
              style={{
                left: 6,
                marginTop: -8,
                animation: run ? `pb-travel 700ms var(${token}) both` : undefined,
              }}
            />
          </span>
        </div>
      ))}
      <ReplayButton onClick={() => setRun((n) => n + 1)} />
      <style>{`@keyframes pb-travel { from { transform: none; } to { transform: translateX(28px); } }`}</style>
    </div>
  );
}

function KeyframeDemo({
  name,
  from,
  to,
  use,
  duration,
}: {
  name: string;
  from: string;
  to: string;
  use: string;
  duration: number;
}) {
  const [run, setRun] = useState(0);

  return (
    <div className="rounded-lg border border-line bg-surface-1 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-mono text-fg-1" style={{ fontSize: 12.5 }}>
          {name}
        </span>
        <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
          {duration}ms
        </span>
      </div>
      <p className="mt-2 mb-4 text-fg-2" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
        {use}
      </p>

      <div className="relative h-24 overflow-hidden rounded-md border border-line bg-surface-2">
        <div
          key={run}
          className="absolute inset-3 flex items-center gap-2.5 rounded-md bg-surface-1 px-4"
          style={{
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            animation: run ? `${name} ${duration}ms var(--ease-out) both` : undefined,
          }}
        >
          <span className="text-action">
            <Icon name="shield" size={16} />
          </span>
          <span className="text-fg-1" style={{ fontSize: 13 }}>
            Allergen segregation check
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="flex flex-wrap items-center gap-1.5 font-mono text-fg-3" style={{ fontSize: 10.5 }}>
          {from}
          {/* An icon, not an arrow character — the bundled subsets have no U+2192. */}
          <Icon name="chevronRight" size={11} />
          {to}
        </span>
        <ReplayButton onClick={() => setRun((n) => n + 1)} />
      </div>
    </div>
  );
}

function ReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 self-start rounded-md border border-action-weak-bd bg-action-weak px-3 py-2 text-action transition-colors"
      style={{ fontSize: 12.5, fontWeight: 550, minHeight: 36 }}
    >
      <Icon name="chevronRight" size={14} />
      Replay
    </button>
  );
}
