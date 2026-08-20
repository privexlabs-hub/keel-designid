/**
 * Engagement post — the before/after split.
 *
 * Rendering risk covered: dense multiline body copy on both sides at the same
 * time as a variable-length repeater (the comparison rows), which is where
 * column balance breaks first.
 */
import {
  itemKey,
  layer,
  layerId,
  list,
  str,
  type ComposeCtx,
  type ComparisonRow,
  type ChecklistItem,
  type FieldValues,
  type LayerNode,
  type TemplateDef,
} from '../types';
import { CANVASES } from '../canvases';

const def: TemplateDef = {
  id: 'engagement-problem-solution',
  name: 'Problem and solution',
  description: 'Two dense columns: how audit prep goes without a system, and with one.',
  category: 'engagement',
  canvas: CANVASES.square1080,
  layout: { id: 'splitH', options: { ratio: 0.46, gap: 2, justify: 'start' } },
  colorways: ['canvas', 'cream', 'mono', 'ink'],
  schemaVersion: 1,
  fields: [
    { key: 'eyebrow', kind: 'text', label: 'Eyebrow', group: 'Content', max: 42 },
    { key: 'headline', kind: 'text', label: 'Headline', group: 'Content', max: 70 },
    {
      key: 'intro',
      kind: 'longtext',
      label: 'Left column copy',
      group: 'Content',
      rows: 6,
      max: 460,
      hint: 'Blank lines become paragraphs.',
    },
    { key: 'colLeft', kind: 'text', label: 'Left column head', group: 'Table', max: 24 },
    { key: 'colRight', kind: 'text', label: 'Right column head', group: 'Table', max: 24 },
    {
      key: 'rows',
      kind: 'list',
      label: 'Comparison rows',
      group: 'Table',
      min: 2,
      max: 6,
      labelKey: 'left',
      fields: [
        { key: 'left', kind: 'text', label: 'Without Keel', max: 60 },
        { key: 'right', kind: 'text', label: 'With Keel', max: 60 },
      ],
    },
    {
      key: 'proof',
      kind: 'list',
      label: 'Closing points',
      group: 'Content',
      min: 0,
      max: 4,
      labelKey: 'text',
      fields: [{ key: 'text', kind: 'text', label: 'Point', max: 72 }],
    },
    { key: 'footerLeft', kind: 'text', label: 'Footer left', group: 'Footer', max: 40 },
    { key: 'footerRight', kind: 'text', label: 'Footer right', group: 'Footer', max: 40 },
  ],
  defaults: {
    eyebrow: 'Corrective actions',
    headline: 'Audit week should be a report, not a rescue',
    intro:
      'Most quality managers spend the fortnight before a surveillance visit chasing signatures, re-exporting spreadsheets and reconstructing what happened in March.\nThe evidence exists. It is just spread across four inboxes, a shared drive and one person’s memory.\nKeel keeps the clause, the control, the evidence and the action in one register, dated and owned.',
    colLeft: 'Spreadsheets',
    colRight: 'Keel',
    rows: [
      { _k: 'r-ev', left: 'Evidence found the week before', right: 'Evidence dated and linked as it is produced' },
      { _k: 'r-ca', left: 'Corrective actions in an email thread', right: 'Actions with an owner, a due date and a close-out' },
      { _k: 'r-cl', left: 'Clause coverage assumed', right: 'Clause coverage shown, gap by gap' },
      { _k: 'r-rv', left: 'Management review written from scratch', right: 'Management review assembled from the register' },
    ],
    proof: [
      { _k: 'p-1', text: 'Every record carries its own audit trail' },
      { _k: 'p-2', text: 'Nothing to reconcile the night before' },
    ],
    footerLeft: 'Keel · Management system',
    footerRight: 'ISO 9001:2015',
  },
  compose(fields: FieldValues, ctx: ComposeCtx): LayerNode[] {
    const { t } = ctx;

    const rows: ComparisonRow[] = list(fields, 'rows').map((item) => ({
      key: itemKey(item, 'left'),
      left: typeof item.left === 'string' ? item.left : '',
      right: typeof item.right === 'string' ? item.right : '',
    }));

    const proof: ChecklistItem[] = list(fields, 'proof').map((item) => ({
      key: itemKey(item, 'text'),
      text: typeof item.text === 'string' ? item.text : '',
    }));

    const nodes: LayerNode[] = [
      layer(layerId('eyebrow'), 'eyebrow', { text: str(fields, 'eyebrow'), rule: true }, { slot: 'header' }),
      layer(
        layerId('headline'),
        'headline',
        { text: str(fields, 'headline'), size: t.h2, maxWidth: 900 },
        { slot: 'header' },
      ),
      layer(
        layerId('intro'),
        'body',
        { text: str(fields, 'intro'), size: t.body, maxWidth: 460 },
        { slot: 'left' },
      ),
      layer(
        layerId('table'),
        'comparisonTable',
        {
          columns: [str(fields, 'colLeft', 'Before'), str(fields, 'colRight', 'After')],
          rows,
          size: t.small * 1.1,
          headSize: t.small,
          rightIcon: 'clipCheck',
          leftIcon: 'x',
        },
        { slot: 'right' },
      ),
    ];

    if (proof.length > 0) {
      nodes.push(
        layer(layerId('proof'), 'checklist', { items: proof, size: t.small * 1.05, icon: 'shield' }, { slot: 'right' }),
      );
    }

    nodes.push(
      layer(
        layerId('footer'),
        'footerBar',
        { left: str(fields, 'footerLeft'), right: str(fields, 'footerRight') },
        { slot: 'footer', locked: true },
      ),
    );

    return nodes;
  },
};

export default def;
