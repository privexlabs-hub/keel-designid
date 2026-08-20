/**
 * Square post — one number, carried by the radial gradient ground.
 *
 * Rendering risk covered: a gradient background (the `radial` colorway's
 * `--t-bg-image`) under a shadowed surface card, plus the inline SVG mark in
 * the footer. Shadows and gradients are the two things DOM-snapshot export gets
 * wrong most often, so a pilot has to exercise both together.
 */
import {
  bool,
  layer,
  layerId,
  str,
  type ComposeCtx,
  type FieldValues,
  type LayerNode,
  type TemplateDef,
} from '../types';
import { CANVASES } from '../canvases';

const def: TemplateDef = {
  id: 'square-big-stat',
  name: 'Big stat',
  description: 'A single conformance number on the gradient ground, with a shadowed card and the mark.',
  category: 'square',
  canvas: CANVASES.square1080,
  layout: { id: 'centeredHero', options: { gap: 1.6 } },
  colorways: ['radial', 'teal', 'ink', 'cream'],
  schemaVersion: 1,
  fields: [
    { key: 'eyebrow', kind: 'text', label: 'Eyebrow', group: 'Content', max: 42 },
    { key: 'value', kind: 'text', label: 'Value', group: 'Content', max: 6, hint: 'Keep it short — this is set at ramp `stat`.' },
    { key: 'unit', kind: 'text', label: 'Unit', group: 'Content', max: 8 },
    { key: 'label', kind: 'text', label: 'Label', group: 'Content', max: 60 },
    { key: 'support', kind: 'longtext', label: 'Supporting line', group: 'Content', rows: 3, max: 180 },
    { key: 'footerLeft', kind: 'text', label: 'Footer left', group: 'Footer', max: 40 },
    { key: 'footerRight', kind: 'text', label: 'Footer right', group: 'Footer', max: 40 },
    { key: 'card', kind: 'boolean', label: 'Card behind the stat', group: 'Style' },
    { key: 'shadow', kind: 'boolean', label: 'Drop shadow', group: 'Style' },
  ],
  defaults: {
    eyebrow: 'Audit readiness',
    value: '94',
    unit: '%',
    label: 'of ISO 9001 clauses evidenced and in date',
    support:
      'Keel tracks every clause against live evidence, so the number on the wall is the number an auditor would find.',
    footerLeft: 'Keel · Management system',
    footerRight: 'ISO 9001:2015',
    card: true,
    shadow: true,
  },
  compose(fields: FieldValues, ctx: ComposeCtx): LayerNode[] {
    const { t } = ctx;
    return [
      layer(layerId('eyebrow'), 'eyebrow', { text: str(fields, 'eyebrow'), rule: true, align: 'center' }, { slot: 'header' }),
      layer(
        layerId('stat'),
        'statBig',
        {
          value: str(fields, 'value'),
          unit: str(fields, 'unit'),
          label: str(fields, 'label'),
          align: 'center',
          card: bool(fields, 'card', true),
          shadow: bool(fields, 'shadow', true),
          pad: t.unit * 2.2,
          radius: t.unit,
          labelSize: t.subhead,
        },
        { slot: 'body' },
      ),
      layer(
        layerId('support'),
        'subhead',
        { text: str(fields, 'support'), align: 'center', size: t.lead, maxWidth: 760 },
        { slot: 'body' },
      ),
      layer(
        layerId('footer'),
        'footerBar',
        { left: str(fields, 'footerLeft'), right: str(fields, 'footerRight'), rule: true, markSize: t.unit * 1.6 },
        { slot: 'footer', locked: true },
      ),
    ];
  },
  /**
   * The `radial` colorway paints its ground with a CSS radial-gradient, which
   * the SVG pass cannot read off a computed style. It is emitted as a def here
   * and referenced as the stage background fill.
   */
  svg(_fields: FieldValues, ctx: ComposeCtx) {
    if (ctx.colorway !== 'radial') return {};
    return {
      defs:
        '<radialGradient id="t-ground" cx="30%" cy="10%" r="120%">' +
        '<stop offset="0" stop-color="var(--action-hover)"/>' +
        '<stop offset="0.7" stop-color="var(--action-press)"/>' +
        '</radialGradient>',
      backgroundFill: 't-ground',
    };
  },
};

export default def;
