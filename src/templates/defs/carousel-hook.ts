/**
 * Ten-slide carousel — hook, eight body slides driven by one repeater, CTA.
 *
 * Rendering risk covered: the most complex repeater in the pilot set. One
 * `points` list feeds both the body slides (item n-2 on slide n) and the
 * recap checklist on slide 10, so the SAME item appears under two different
 * layer roles. Ids therefore have to be role + slide + item key; an index-keyed
 * id would move a user's nudge from one point to another the moment the list is
 * reordered, and would collide outright between the two roles.
 */
import {
  icon,
  itemKey,
  layer,
  layerId,
  list,
  str,
  type ChecklistItem,
  type ComposeCtx,
  type FieldValues,
  type LayerNode,
  type ListItemValue,
  type TemplateDef,
} from '../types';
import { CANVASES } from '../canvases';

const TOTAL = 10;

function pointAt(items: ListItemValue[], slide: number): ListItemValue | undefined {
  // Slide 2 shows the first point, slide 9 the eighth.
  return items[slide - 2];
}

const def: TemplateDef = {
  id: 'carousel-hook',
  name: 'Carousel — clause by clause',
  description: 'Ten slides: a hook, eight repeater-driven points and a close, with a slide index throughout.',
  category: 'carousel',
  canvas: CANVASES.carousel1080,
  layout: { id: 'stack', options: { gap: 1.5, justify: 'center' } },
  colorways: ['ink', 'cream', 'teal', 'canvas'],
  slides: TOTAL,
  schemaVersion: 1,
  fields: [
    { key: 'kicker', kind: 'text', label: 'Kicker', group: 'Slide 1', slide: 1, max: 40 },
    { key: 'hook', kind: 'text', label: 'Hook', group: 'Slide 1', slide: 1, max: 90 },
    { key: 'hookSub', kind: 'longtext', label: 'Hook subhead', group: 'Slide 1', slide: 1, rows: 3, max: 200 },
    {
      key: 'points',
      kind: 'list',
      label: 'Points',
      group: 'Slides 2-9',
      hint: 'One point per slide, in order. Fewer than eight simply ends the deck earlier.',
      min: 1,
      max: 8,
      labelKey: 'title',
      fields: [
        { key: 'title', kind: 'text', label: 'Title', max: 60 },
        { key: 'body', kind: 'longtext', label: 'Body', rows: 4, max: 260 },
        { key: 'metric', kind: 'text', label: 'Metric', max: 8 },
        { key: 'metricLabel', kind: 'text', label: 'Metric label', max: 48 },
        { key: 'icon', kind: 'icon', label: 'Icon', options: ['clipCheck', 'shield', 'gauge', 'file', 'layers', 'wrench'] },
      ],
    },
    { key: 'ctaTitle', kind: 'text', label: 'Close headline', group: 'Slide 10', slide: 10, max: 70 },
    { key: 'ctaBody', kind: 'longtext', label: 'Close copy', group: 'Slide 10', slide: 10, rows: 3, max: 200 },
    { key: 'ctaAction', kind: 'text', label: 'Call to action', group: 'Slide 10', slide: 10, max: 40 },
  ],
  defaults: {
    kicker: 'ISO 9001 · Clause coverage',
    hook: 'Eight places a surveillance audit actually goes wrong',
    hookSub: 'None of them are the standard. All of them are record-keeping.',
    points: [
      {
        _k: 'p-scope', title: 'Scope drifts', icon: 'layers',
        body: 'The certificate says one thing and the business does another. Add a product line, open a second site, and the scope statement quietly stops being true.',
        metric: '4.3', metricLabel: 'Context of the organisation',
      },
      {
        _k: 'p-doc', title: 'Documents go stale', icon: 'file',
        body: 'A procedure with a two-year review date and no reviewer is a finding waiting to be written up. Review dates need an owner, not a folder.',
        metric: '7.5', metricLabel: 'Documented information',
      },
      {
        _k: 'p-evid', title: 'Evidence expires quietly', icon: 'clipCheck',
        body: 'Calibration certificates, training records and supplier approvals all age out. Nobody notices until the auditor asks for the current one.',
        metric: '7.1', metricLabel: 'Resources and monitoring',
      },
      {
        _k: 'p-risk', title: 'Risk is a one-off exercise', icon: 'shield',
        body: 'Risks assessed once at certification and never revisited read as paperwork. Dates on the register are what make it look alive.',
        metric: '6.1', metricLabel: 'Risks and opportunities',
      },
      {
        _k: 'p-kpi', title: 'Objectives without measures', icon: 'gauge',
        body: 'An objective that is not measured monthly cannot be shown to be monitored. Pick fewer, and record them on a schedule.',
        metric: '6.2', metricLabel: 'Quality objectives',
      },
      {
        _k: 'p-nc', title: 'Actions close without proof', icon: 'wrench',
        body: 'Corrective actions marked done with no verification step are the most common repeat finding. Close-out needs evidence attached.',
        metric: '10.2', metricLabel: 'Nonconformity and corrective action',
      },
      {
        _k: 'p-int', title: 'Internal audits bunch up', icon: 'clipCheck',
        body: 'Three internal audits in the month before the external visit is a schedule, not a programme. Spread them across the year.',
        metric: '9.2', metricLabel: 'Internal audit',
      },
      {
        _k: 'p-mr', title: 'Management review misses inputs', icon: 'layers',
        body: 'The standard lists the required inputs. Working from a template that mirrors that list turns the review from an essay into a checklist.',
        metric: '9.3', metricLabel: 'Management review',
      },
    ],
    ctaTitle: 'All eight are record-keeping problems',
    ctaBody: 'Keel keeps the clause, the control, the evidence and the corrective action in one place, dated and owned.',
    ctaAction: 'See how the register works',
  },
  compose(fields: FieldValues, ctx: ComposeCtx): LayerNode[] {
    const { t } = ctx;
    const slide = ctx.slide ?? 1;
    const points = list(fields, 'points');

    const index = layer(
      layerId('slideIndex', { slide }),
      'slideIndex',
      { index: slide, total: TOTAL, size: t.small, style: 'both' },
      { slot: 'footer', locked: true },
    );

    if (slide === 1) {
      return [
        layer(layerId('kicker', { slide }), 'eyebrow', { text: str(fields, 'kicker'), rule: true }, { slot: 'header' }),
        layer(layerId('hook', { slide }), 'headline', { text: str(fields, 'hook'), size: t.h1 }, { slot: 'body' }),
        layer(
          layerId('hookSub', { slide }),
          'subhead',
          { text: str(fields, 'hookSub'), size: t.lead, maxWidth: 780 },
          { slot: 'body' },
        ),
        index,
      ];
    }

    if (slide === TOTAL) {
      const recap: ChecklistItem[] = points.map((item) => ({
        key: itemKey(item, 'title'),
        text: typeof item.title === 'string' ? item.title : '',
      }));
      return [
        layer(layerId('ctaTitle', { slide }), 'headline', { text: str(fields, 'ctaTitle'), size: t.h2 }, { slot: 'header' }),
        layer(
          layerId('ctaRecap', { slide }),
          'checklist',
          { items: recap, size: t.small * 1.15, icon: 'clipCheck', gap: t.unit * 0.5 },
          { slot: 'body' },
        ),
        layer(
          layerId('ctaBody', { slide }),
          'body',
          { text: str(fields, 'ctaBody'), size: t.body, maxWidth: 820 },
          { slot: 'body' },
        ),
        layer(
          layerId('ctaAction', { slide }),
          'badge',
          { text: str(fields, 'ctaAction'), size: t.small, icon: 'chevronRight', tone: 'accent', uppercase: false },
          { slot: 'body' },
        ),
        index,
      ];
    }

    const point = pointAt(points, slide);
    if (!point) {
      // Deck shorter than ten slides: render the index alone rather than
      // throwing, so the gallery and the exporter agree on the slide count.
      return [index];
    }
    const key = itemKey(point, 'title');
    const iconName = icon(point, 'icon', 'clipCheck');

    return [
      layer(
        layerId('pointIcon', { slide, key }),
        'iconGlyph',
        { name: iconName, size: t.h3, boxed: true },
        { slot: 'header' },
      ),
      layer(
        layerId('pointTitle', { slide, key }),
        'headline',
        { text: typeof point.title === 'string' ? point.title : '', size: t.h2 },
        { slot: 'body' },
      ),
      layer(
        layerId('pointBody', { slide, key }),
        'body',
        { text: typeof point.body === 'string' ? point.body : '', size: t.lead * 0.92, maxWidth: 820 },
        { slot: 'body' },
      ),
      layer(
        layerId('pointMetric', { slide, key }),
        'splitPanel',
        { surface: true, border: true, radius: t.unit * 0.8, pad: t.unit * 1.2, fill: false },
        {
          slot: 'body',
          children: [
            layer(
              layerId('pointMetricValue', { slide, key }),
              'statBig',
              {
                value: typeof point.metric === 'string' ? point.metric : '',
                label: typeof point.metricLabel === 'string' ? point.metricLabel : '',
                size: t.statSmall,
                labelSize: t.small,
              },
            ),
          ],
        },
      ),
      index,
    ];
  },
};

export default def;
