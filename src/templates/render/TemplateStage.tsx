'use client';

/**
 * Renders a TemplateDef at EXACT design pixels.
 *
 * Contract with the exporter:
 *  - `data-stage` marks the node to rasterise / measure. It is exactly
 *    `canvas.w x canvas.h` CSS px and is never itself transformed (see
 *    ScaledStage — the scale lives on a wrapper).
 *  - `data-colorway` is on the stage node ITSELF, never an ancestor, because
 *    export clones this subtree and an ancestor-scoped slot would resolve to
 *    nothing in the clone.
 *  - every composed layer is wrapped in a `[data-layer="<id>"]` box, so the SVG
 *    pass can measure a layer's geometry by id without knowing the block.
 */
import type { CSSProperties, ReactNode, Ref } from 'react';
import type { ColorwayId } from '@/brand/tokens';
import { BLOCKS, CONTAINER_BLOCKS } from '../blocks';
import { FONT_VAR, SLOT_VAR, TEXT_SLOT_CLASS } from '../blocks/primitives';
import { LAYOUTS, type LayoutSlots } from '../layouts';
import { rampFor } from '../ramp';
import { StageContextProvider } from '../ramp-context';
import type {
  ComposeCtx,
  ExtraTextLayer,
  LayerNode,
  LayerOverride,
  Overrides,
  TemplateDef,
  FieldValues,
} from '../types';

export interface TemplateStageProps {
  template: TemplateDef;
  /** Field values; falls back to `template.defaults` when omitted. */
  fields?: FieldValues;
  colorway?: ColorwayId;
  /** 1-based slide for multi-slide templates. */
  slide?: number;
  overrides?: Overrides;
  extraText?: ExtraTextLayer[];
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

/** Applies one layer's user overrides. Blocks never see this object. */
function overrideStyle(o: LayerOverride | undefined): CSSProperties {
  if (!o) return {};
  const parts: string[] = [];
  if (o.dx || o.dy) parts.push(`translate(${o.dx ?? 0}px, ${o.dy ?? 0}px)`);
  if (o.scale && o.scale !== 1) parts.push(`scale(${o.scale})`);
  const css: CSSProperties = {
    transform: parts.length ? parts.join(' ') : undefined,
    transformOrigin: parts.length ? 'top left' : undefined,
    textAlign: o.align,
    zIndex: o.z,
    position: o.z === undefined ? undefined : 'relative',
  };
  if (o.fontSize !== undefined) {
    // Text blocks resolve their size through this var, so a size override
    // needs no cooperation from the block itself.
    (css as Record<string, string | number>)['--layer-font-size'] = `${o.fontSize}px`;
  }
  if (o.colorSlot !== undefined) {
    // Remap the slot for this subtree rather than setting `color`: blocks paint
    // with the t-* utilities, which would win over an inherited colour.
    const v = SLOT_VAR[o.colorSlot];
    (css as Record<string, string | number>)['--t-fg'] = v;
    (css as Record<string, string | number>)['--t-fg-muted'] = v;
  }
  return css;
}

function renderNode(node: LayerNode, overrides: Overrides | undefined): ReactNode {
  const o = overrides?.[node.id];
  if (o?.hidden) return null;

  // Indexing BLOCKS by the BlockId union erases the block/props correlation
  // that `LayerNode<K>` carries, leaving React a component union and a props
  // union it cannot pair up. Widening the component to an unknown-props
  // function confines the unsoundness here; `compose()` is still checked
  // against the correlated LayerNode<K> where templates are authored.
  const Block = BLOCKS[node.block] as (p: Record<string, unknown>) => ReactNode;
  const kids = node.children?.map((c) => renderNode(c, overrides));

  const base = node.props as Record<string, unknown>;
  const props = CONTAINER_BLOCKS.has(node.block) ? { ...base, children: kids } : base;

  return (
    <div key={node.id} data-layer={node.id} data-block={node.block} style={overrideStyle(o)}>
      <Block {...props} />
    </div>
  );
}

function ExtraText({ layer }: { layer: ExtraTextLayer }) {
  return (
    <div
      data-layer={layer.id}
      data-block="extraText"
      style={{
        position: 'absolute',
        left: layer.x,
        top: layer.y,
        width: layer.w,
        fontFamily: FONT_VAR[layer.font ?? 'ui'],
        fontSize: layer.size,
        fontWeight: layer.weight ?? 400,
        letterSpacing: layer.tracking === undefined ? undefined : `${layer.tracking}em`,
        textAlign: layer.align,
        lineHeight: 1.25,
        whiteSpace: 'pre-wrap',
      }}
      className={TEXT_SLOT_CLASS[layer.slot === 'accent' ? 'accent' : layer.slot === 'fgMuted' ? 'fgMuted' : 'fg']}
    >
      {layer.text}
    </div>
  );
}

export function TemplateStage({
  template,
  fields,
  colorway,
  slide,
  overrides,
  extraText,
  className,
  style,
  ref,
}: TemplateStageProps) {
  const { canvas } = template;
  const activeColorway = colorway ?? template.colorways[0];
  const t = rampFor(canvas);
  const ctx: ComposeCtx = {
    canvas,
    colorway: activeColorway,
    slide: template.slides ? (slide ?? 1) : undefined,
    t,
  };

  const nodes = template.compose(fields ?? template.defaults, ctx);

  const slots: LayoutSlots = {};
  for (const node of nodes) {
    const name = node.slot ?? 'body';
    const bucket = slots[name] ?? [];
    const rendered = renderNode(node, overrides);
    if (rendered !== null) bucket.push(rendered);
    slots[name] = bucket;
  }

  const Layout = LAYOUTS[template.layout.id];

  const mask: CSSProperties =
    canvas.mask === 'circle'
      ? { borderRadius: '50%' }
      : canvas.mask === 'rounded'
        ? { borderRadius: Math.round(Math.min(canvas.w, canvas.h) * 0.06) }
        : {};

  return (
    <div
      ref={ref}
      data-stage=""
      data-colorway={activeColorway}
      data-template={template.id}
      data-canvas={canvas.id}
      data-slide={ctx.slide}
      className={`bg-t-bg text-t-fg ${className ?? ''}`}
      style={{
        position: 'relative',
        width: canvas.w,
        height: canvas.h,
        flex: `0 0 ${canvas.w}px`,
        overflow: 'hidden',
        backgroundImage: 'var(--t-bg-image)',
        ...mask,
        ...style,
      }}
    >
      <StageContextProvider value={{ t, canvas, slide: ctx.slide }}>
        <Layout canvas={canvas} t={t} options={template.layout.options} slots={slots} />
        {extraText?.length ? (
          <div style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
            {extraText.map((l) => (
              <ExtraText key={l.id} layer={l} />
            ))}
          </div>
        ) : null}
      </StageContextProvider>
    </div>
  );
}
