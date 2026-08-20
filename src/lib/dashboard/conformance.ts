/** Conformance model — a port of `buildConformance`. */
import { CLAUSES } from '@/data/demo';
import { clauseBadge, pctColor, type BadgeSpec } from './tone';
import { relChip, type RelChip } from './detail';

export interface ClauseRow {
  id: string;
  code: string;
  title: string;
  pctText: string;
  barColor: string;
  status: BadgeSpec;
  links: RelChip[];
}

export const OVERALL_TEXT = '91%';

export const STANDARD_STATUS = [
  { code: 'ISO 9001:2015', status: 'Certified' },
  { code: 'ISO 22000:2018', status: 'Certified' },
];

export const CLAUSE_ROWS: ClauseRow[] = CLAUSES.map((c) => ({
  id: c.id,
  code: c.code,
  title: c.title,
  pctText: `${c.pct}%`,
  barColor: pctColor(c.pct),
  status: clauseBadge(c.status),
  links: c.links.map(([t, id]) => relChip(t, id)).filter((x): x is RelChip => x !== null),
}));
