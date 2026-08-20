/**
 * YouTube thumbnail — read at ~360px wide, so the ramp is 1.35x.
 *
 * Rendering risk covered: deliberate overflow. The oversized clause numeral in
 * the bleed slot runs past the right edge on purpose and is cropped by the
 * stage's `overflow: hidden`, and the headline is clamped to two lines so a
 * long edit truncates instead of reflowing the composition. Both need the crop
 * to survive rasterisation identically, which is the thing that breaks when a
 * preview transform leaks onto the stage node.
 */
import {
  layer,
  layerId,
  num,
  str,
  type ComposeCtx,
  type FieldValues,
  type LayerNode,
  type TemplateDef,
} from '../types';
import { CANVASES } from '../canvases';

const def: TemplateDef = {
  id: 'thumbnail-audit',
  name: 'Thumbnail — clause number',
  description: 'A cropped oversize numeral behind a two-line headline, with a bottom bar.',
  category: 'thumbnail',
  canvas: CANVASES.thumb1280,
  layout: { id: 'heroBottomBar', options: { band: 3.2, gap: 1, justify: 'end' } },
  colorways: ['inverted', 'ink', 'teal', 'mono'],
  schemaVersion: 1,
  fields: [
    { key: 'numeral', kind: 'text', label: 'Backdrop numeral', group: 'Style', max: 5, hint: 'Set oversize and cropped by the frame. Two or three characters read best.' },
    { key: 'numeralOffsetX', kind: 'number', label: 'Numeral offset X', group: 'Style', min: -600, max: 600, step: 10 },
    { key: 'badge', kind: 'text', label: 'Badge', group: 'Content', max: 24 },
    { key: 'headline', kind: 'text', label: 'Headline', group: 'Content', max: 64, hint: 'Clamped to two lines.' },
    { key: 'barLeft', kind: 'text', label: 'Bar text', group: 'Footer', max: 48 },
    { key: 'duration', kind: 'text', label: 'Duration', group: 'Footer', max: 12 },
  ],
  defaults: {
    numeral: '10.2',
    numeralOffsetX: 120,
    badge: 'Walkthrough',
    headline: 'Closing a corrective action so it stays closed',
    barLeft: 'Keel · Management system',
    duration: '8 min',
  },
  compose(fields: FieldValues, ctx: ComposeCtx): LayerNode[] {
    const { t } = ctx;
    return [
      layer(
        layerId('numeral'),
        'textLayer',
        {
          text: str(fields, 'numeral'),
          size: t.display * 2.6,
          slot: 'fgMuted',
          font: 'display',
          weight: 600,
          leading: 0.8,
          tracking: -0.04,
          offsetX: num(fields, 'numeralOffsetX', 0),
          offsetY: -t.display * 0.35,
        },
        { slot: 'bleed' },
      ),
      layer(layerId('badge'), 'badge', { text: str(fields, 'badge'), size: t.small, tone: 'accent' }, { slot: 'header' }),
      layer(
        layerId('headline'),
        'headline',
        { text: str(fields, 'headline'), size: t.h1, clamp: 2, maxWidth: 900 },
        { slot: 'body' },
      ),
      layer(
        layerId('barLeft'),
        'textLayer',
        { text: str(fields, 'barLeft'), size: t.small, slot: 'fgMuted', weight: 500 },
        { slot: 'footer', locked: true },
      ),
      layer(
        layerId('duration'),
        'badge',
        { text: str(fields, 'duration'), size: t.micro, tone: 'outline', uppercase: false },
        { slot: 'footer' },
      ),
    ];
  },
};

export default def;
