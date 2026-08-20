/**
 * X / Twitter header — 1500x500 with a very small ramp.
 *
 * Rendering risk covered: the shallow-canvas end of the ramp. At ramp 0.62 the
 * `h1` step is 60px, not 96px, and the safe area keeps everything clear of the
 * avatar that overlaps the lower left. This is the canvas that proves a single
 * scaled ramp works without per-canvas block variants.
 */
import {
  itemKey,
  layer,
  layerId,
  list,
  str,
  type ComposeCtx,
  type FieldValues,
  type LayerNode,
  type StatRowItem,
  type TemplateDef,
} from '../types';
import { CANVASES } from '../canvases';

const def: TemplateDef = {
  id: 'x-header-banner',
  name: 'X header',
  description: 'Profile banner with the mark in an accent band, a positioning line and three figures.',
  category: 'cover',
  canvas: CANVASES.xheader1500,
  layout: { id: 'edgeBand', options: { edge: 'left', band: 3.6, gap: 1.4, justify: 'center' } },
  colorways: ['mono', 'cream', 'canvas', 'ink'],
  schemaVersion: 1,
  fields: [
    { key: 'headline', kind: 'text', label: 'Headline', group: 'Content', max: 64 },
    { key: 'subhead', kind: 'text', label: 'Subhead', group: 'Content', max: 90 },
    {
      key: 'figures',
      kind: 'list',
      label: 'Figures',
      group: 'Content',
      min: 0,
      max: 3,
      labelKey: 'label',
      fields: [
        { key: 'value', kind: 'text', label: 'Value', max: 8 },
        { key: 'label', kind: 'text', label: 'Label', max: 32 },
      ],
    },
    { key: 'markSize', kind: 'number', label: 'Mark size', group: 'Style', min: 24, max: 160, step: 4 },
  ],
  defaults: {
    headline: 'The management system, kept current',
    subhead: 'Clause coverage, evidence and corrective actions for SMBs holding ISO certification.',
    figures: [
      { _k: 'f-clauses', value: '10', label: 'ISO 9001 clauses tracked' },
      { _k: 'f-evidence', value: '1', label: 'Register for every record' },
      { _k: 'f-prep', value: '0', label: 'Nights spent rebuilding the file' },
    ],
    markSize: 76,
  },
  compose(fields: FieldValues, ctx: ComposeCtx): LayerNode[] {
    const { t } = ctx;
    const figures: StatRowItem[] = list(fields, 'figures').map((item) => ({
      key: itemKey(item, 'label'),
      value: typeof item.value === 'string' ? item.value : '',
      label: typeof item.label === 'string' ? item.label : '',
    }));

    const nodes: LayerNode[] = [
      layer(
        layerId('mark'),
        'logoLockup',
        { variant: 'mark', size: typeof fields.markSize === 'number' ? fields.markSize : 76, slot: 'accentFg' },
        { slot: 'header', locked: true },
      ),
      layer(layerId('headline'), 'headline', { text: str(fields, 'headline'), size: t.h1 }, { slot: 'body' }),
      layer(
        layerId('rule'),
        'ruleLine',
        { width: 220, thickness: 2, slot: 'accent' },
        { slot: 'body' },
      ),
      layer(
        layerId('subhead'),
        'subhead',
        { text: str(fields, 'subhead'), size: t.body, maxWidth: 760 },
        { slot: 'body' },
      ),
    ];

    if (figures.length > 0) {
      nodes.push(
        layer(layerId('figures'), 'statRow', { items: figures, size: t.h3, labelSize: t.micro, dividers: true }, { slot: 'body' }),
      );
    }

    return nodes;
  },
};

export default def;
