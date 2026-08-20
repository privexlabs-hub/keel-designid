/**
 * Vertical story — full-bleed image fill fading into the ground.
 *
 * Rendering risk covered: an image fill under a transparency (the scrim is a
 * `linear-gradient(... , transparent)`, never an opacity modifier or a
 * `backdrop-filter`), plus the story safe areas — content must clear 220px of
 * account chrome at the top and 280px of reply UI at the bottom.
 */
import {
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
  id: 'story-launch',
  name: 'Story — launch',
  description: 'Full-bleed image, gradient scrim, and an announcement inside the story safe area.',
  category: 'story',
  canvas: CANVASES.story1920,
  layout: { id: 'stack', options: { gap: 1.6, justify: 'end' } },
  colorways: ['teal', 'radial', 'ink', 'inverted'],
  schemaVersion: 1,
  fields: [
    {
      key: 'image',
      kind: 'image',
      label: 'Background image',
      group: 'Media',
      aspect: 1080 / 1920,
      hint: 'Covers the full 1080x1920 frame. Anything important must sit clear of the scrim.',
    },
    { key: 'scrim', kind: 'boolean', label: 'Fade into the ground', group: 'Media' },
    { key: 'badge', kind: 'text', label: 'Badge', group: 'Content', max: 28 },
    { key: 'headline', kind: 'text', label: 'Headline', group: 'Content', max: 80 },
    { key: 'subhead', kind: 'longtext', label: 'Subhead', group: 'Content', rows: 3, max: 200 },
    { key: 'cta', kind: 'text', label: 'Call to action', group: 'Content', max: 40 },
    { key: 'footerLeft', kind: 'text', label: 'Footer left', group: 'Footer', max: 40 },
  ],
  defaults: {
    image: '/assets/logo/png/keel-mark-cream-1024.png',
    scrim: true,
    badge: 'New',
    headline: 'Corrective actions, from raised to verified',
    subhead:
      'Every action now carries an owner, a due date and the evidence that closed it. Nothing shuts without proof.',
    cta: 'Read the release note',
    footerLeft: 'Keel · Management system',
  },
  compose(fields: FieldValues, ctx: ComposeCtx): LayerNode[] {
    const { t } = ctx;
    return [
      layer(
        layerId('backdrop'),
        'splitPanel',
        {
          image: str(fields, 'image') || undefined,
          scrim: fields.scrim !== false,
          scrimFrom: 'bottom',
          fill: true,
          pad: 0,
        },
        { slot: 'bleed', locked: true },
      ),
      layer(layerId('badge'), 'badge', { text: str(fields, 'badge'), size: t.small, tone: 'accent' }, { slot: 'body' }),
      layer(layerId('headline'), 'headline', { text: str(fields, 'headline'), size: t.h1 }, { slot: 'body' }),
      layer(
        layerId('subhead'),
        'subhead',
        { text: str(fields, 'subhead'), size: t.lead, maxWidth: 820 },
        { slot: 'body' },
      ),
      layer(
        layerId('cta'),
        'badge',
        { text: str(fields, 'cta'), size: t.small, icon: 'chevronRight', tone: 'outline', uppercase: false },
        { slot: 'body' },
      ),
      layer(
        layerId('footer'),
        'footerBar',
        { left: str(fields, 'footerLeft'), rule: true, markSize: t.unit * 1.5 },
        { slot: 'footer', locked: true },
      ),
    ];
  },
};

export default def;
