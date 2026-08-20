'use client';

/**
 * Arrangement shells.
 *
 * A layout owns exactly three things: outer padding, the canvas safe area, and
 * where each slot's layers land. It never styles text and never paints colour
 * beyond the slot backgrounds it needs, so any template can be re-shelled by
 * changing one `layout.id`.
 *
 * Slots receive ARRAYS of already-rendered layers, because grid shells need to
 * distribute the body's layers across cells rather than nest them.
 */
import type { CSSProperties, ReactNode } from 'react';
import { insets } from '../canvases';
import type { CanvasSpec, TypeRamp } from '../types';
import type { LayoutId, LayoutOptions, SlotName } from './kinds';

export type { LayoutId, LayoutOptions, SlotName } from './kinds';

export type LayoutSlots = Partial<Record<SlotName, ReactNode[]>>;

export interface LayoutProps {
  canvas: CanvasSpec;
  t: TypeRamp;
  options?: LayoutOptions;
  slots: LayoutSlots;
}

function pick(slots: LayoutSlots, name: SlotName): ReactNode[] {
  return slots[name] ?? [];
}

function has(slots: LayoutSlots, name: SlotName): boolean {
  return pick(slots, name).length > 0;
}

function padding(canvas: CanvasSpec, o: LayoutOptions | undefined): CSSProperties {
  if (o?.ignoreSafe) {
    const p = o.pad ?? canvas.pad;
    return { padding: p };
  }
  const i = insets(canvas);
  if (o?.pad !== undefined) {
    const delta = o.pad - canvas.pad;
    return {
      paddingTop: i.top + delta,
      paddingRight: i.right + delta,
      paddingBottom: i.bottom + delta,
      paddingLeft: i.left + delta,
    };
  }
  return { paddingTop: i.top, paddingRight: i.right, paddingBottom: i.bottom, paddingLeft: i.left };
}

const JUSTIFY: Record<NonNullable<LayoutOptions['justify']>, CSSProperties['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
};
const ALIGN: Record<NonNullable<LayoutOptions['align']>, CSSProperties['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};

/** Full-bleed layers sit behind everything and ignore all padding. */
function Bleed({ slots }: { slots: LayoutSlots }) {
  if (!has(slots, 'bleed')) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>{pick(slots, 'bleed')}</div>
  );
}

function Frame({ canvas, options, slots, children }: LayoutProps & { children: ReactNode }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Bleed slots={slots} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          ...padding(canvas, options),
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Column({ items, gap, justify, align, grow }: {
  items: ReactNode[];
  gap: number;
  justify?: LayoutOptions['justify'];
  align?: LayoutOptions['align'];
  grow?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        flex: grow ? '1 1 auto' : '0 0 auto',
        minHeight: 0,
        justifyContent: justify ? JUSTIFY[justify] : undefined,
        alignItems: align ? ALIGN[align] : undefined,
      }}
    >
      {items}
    </div>
  );
}

/** header / body / footer, stacked. The default shell. */
export function Stack(props: LayoutProps) {
  const { t, options, slots } = props;
  const gap = (options?.gap ?? 1.5) * t.unit;
  return (
    <Frame {...props}>
      {has(slots, 'header') ? <Column items={pick(slots, 'header')} gap={gap * 0.6} align={options?.align} /> : null}
      <Column items={pick(slots, 'body')} gap={gap} grow justify={options?.justify ?? 'center'} align={options?.align} />
      {has(slots, 'footer') ? <Column items={pick(slots, 'footer')} gap={gap * 0.6} /> : null}
    </Frame>
  );
}

/** left | right side by side, with optional header above and footer below. */
export function SplitH(props: LayoutProps) {
  const { t, options, slots } = props;
  const gap = (options?.gap ?? 2) * t.unit;
  const ratio = options?.ratio ?? 0.5;
  return (
    <Frame {...props}>
      {has(slots, 'header') ? <Column items={pick(slots, 'header')} gap={gap * 0.5} /> : null}
      <div style={{ display: 'flex', gap, flex: '1 1 auto', minHeight: 0, paddingTop: has(slots, 'header') ? gap : 0 }}>
        <div
          style={{
            flex: `1 1 ${ratio * 100}%`,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: gap * 0.6,
            justifyContent: options?.justify ? JUSTIFY[options.justify] : 'flex-start',
          }}
        >
          {pick(slots, 'left')}
        </div>
        <div
          style={{
            flex: `1 1 ${(1 - ratio) * 100}%`,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: gap * 0.6,
            justifyContent: options?.justify ? JUSTIFY[options.justify] : 'flex-start',
          }}
        >
          {pick(slots, 'right')}
        </div>
      </div>
      {has(slots, 'footer') ? (
        <div style={{ paddingTop: gap }}>
          <Column items={pick(slots, 'footer')} gap={gap * 0.5} />
        </div>
      ) : null}
    </Frame>
  );
}

/** body on top, aside below, split by `ratio` of the height. */
export function SplitV(props: LayoutProps) {
  const { t, options, slots } = props;
  const gap = (options?.gap ?? 2) * t.unit;
  const ratio = options?.ratio ?? 0.6;
  return (
    <Frame {...props}>
      {has(slots, 'header') ? <Column items={pick(slots, 'header')} gap={gap * 0.5} /> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap, flex: '1 1 auto', minHeight: 0 }}>
        <div style={{ flex: `1 1 ${ratio * 100}%`, minHeight: 0, display: 'flex', flexDirection: 'column', gap: gap * 0.6 }}>
          {pick(slots, 'body')}
        </div>
        <div style={{ flex: `1 1 ${(1 - ratio) * 100}%`, minHeight: 0, display: 'flex', flexDirection: 'column', gap: gap * 0.6 }}>
          {pick(slots, 'aside')}
        </div>
      </div>
      {has(slots, 'footer') ? <Column items={pick(slots, 'footer')} gap={gap * 0.5} /> : null}
    </Frame>
  );
}

function GridN(props: LayoutProps & { columns: number }) {
  const { t, options, slots, columns } = props;
  const gap = (options?.gap ?? 1) * t.unit;
  return (
    <Frame {...props}>
      {has(slots, 'header') ? <Column items={pick(slots, 'header')} gap={gap * 0.5} /> : null}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap,
          flex: '1 1 auto',
          alignContent: options?.justify === 'center' ? 'center' : 'start',
          paddingTop: has(slots, 'header') ? gap : 0,
          paddingBottom: has(slots, 'footer') ? gap : 0,
          minHeight: 0,
        }}
      >
        {pick(slots, 'body')}
      </div>
      {has(slots, 'footer') ? <Column items={pick(slots, 'footer')} gap={gap * 0.5} /> : null}
    </Frame>
  );
}

export function Grid2(props: LayoutProps) {
  return <GridN {...props} columns={2} />;
}
export function Grid3(props: LayoutProps) {
  return <GridN {...props} columns={3} />;
}

/**
 * Content fills the frame; the footer becomes a full-bleed band pinned to the
 * bottom edge, painted with the surface slot. Thumbnails and OG cards use this.
 */
export function HeroBottomBar(props: LayoutProps) {
  const { canvas, t, options, slots } = props;
  const gap = (options?.gap ?? 1.2) * t.unit;
  const band = (options?.band ?? 3) * t.unit;
  const i = insets(canvas);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Bleed slots={slots} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: i.top,
          paddingLeft: i.left,
          paddingRight: i.right,
          paddingBottom: band + i.bottom,
        }}
      >
        {has(slots, 'header') ? <Column items={pick(slots, 'header')} gap={gap * 0.6} /> : null}
        <Column items={pick(slots, 'body')} gap={gap} grow justify={options?.justify ?? 'end'} align={options?.align} />
      </div>
      {has(slots, 'footer') ? (
        <div
          className="bg-t-surface border-t-line"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            minHeight: band,
            display: 'flex',
            alignItems: 'center',
            gap,
            paddingLeft: i.left,
            paddingRight: i.right,
            paddingTop: t.unit * 0.6,
            paddingBottom: t.unit * 0.6,
            borderTopWidth: 1,
            borderTopStyle: 'solid',
          }}
        >
          {pick(slots, 'footer')}
        </div>
      ) : null}
    </div>
  );
}

/** Everything centred on both axes. Avatars, podcast art, hero statements. */
export function CenteredHero(props: LayoutProps) {
  const { t, options, slots } = props;
  const gap = (options?.gap ?? 1.4) * t.unit;
  return (
    <Frame {...props}>
      {has(slots, 'header') ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Column items={pick(slots, 'header')} gap={gap * 0.5} align="center" />
        </div>
      ) : null}
      <div
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap,
        }}
      >
        {pick(slots, 'body')}
      </div>
      {has(slots, 'footer') ? (
        // Not centred-and-shrunk: footers carry full-width rules.
        <Column items={pick(slots, 'footer')} gap={gap * 0.5} />
      ) : null}
    </Frame>
  );
}

/**
 * A painted band along one edge carrying the `header` slot, with the `body`
 * beside it. Banners, X headers and email strips use this.
 */
export function EdgeBand(props: LayoutProps) {
  const { canvas, t, options, slots } = props;
  const edge = options?.edge ?? 'left';
  const gap = (options?.gap ?? 1.2) * t.unit;
  const thickness = (options?.band ?? 4) * t.unit;
  const vertical = edge === 'left' || edge === 'right';
  const i = insets(canvas);
  const bandStyle: CSSProperties = {
    flex: `0 0 ${thickness}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: vertical ? 'center' : 'flex-start',
    gap: gap * 0.5,
  };
  const bodyStyle: CSSProperties = {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: options?.justify ? JUSTIFY[options.justify] : 'center',
    alignItems: options?.align ? ALIGN[options.align] : 'flex-start',
    gap,
  };
  const bandNode = has(slots, 'header') ? (
    <div key="band" className="bg-t-accent" style={{ ...bandStyle, borderRadius: t.unit * 0.4, padding: gap * 0.6 }}>
      {pick(slots, 'header')}
    </div>
  ) : null;
  const bodyNode = (
    <div key="body" style={bodyStyle}>
      {pick(slots, 'body')}
      {pick(slots, 'footer')}
    </div>
  );
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Bleed slots={slots} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: vertical ? 'row' : 'column',
          gap,
          paddingTop: i.top,
          paddingRight: i.right,
          paddingBottom: i.bottom,
          paddingLeft: i.left,
        }}
      >
        {edge === 'left' || edge === 'top' ? [bandNode, bodyNode] : [bodyNode, bandNode]}
      </div>
    </div>
  );
}

export const LAYOUTS: Record<LayoutId, (props: LayoutProps) => ReactNode> = {
  stack: Stack,
  splitH: SplitH,
  splitV: SplitV,
  grid2: Grid2,
  grid3: Grid3,
  heroBottomBar: HeroBottomBar,
  centeredHero: CenteredHero,
  edgeBand: EdgeBand,
};

export const LAYOUT_IDS = Object.keys(LAYOUTS) as LayoutId[];
