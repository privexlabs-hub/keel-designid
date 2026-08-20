/** Overview model — a port of `buildOverview` minus the lens panel (see lens.ts). */
import { ACTIONS, CLAUSES, DATA, EVIDENCE, KPIS } from '@/data/demo';
import { dueColorOf, evBadge, kpiBadge, priBadge, type BadgeSpec } from './tone';

export interface StatTile {
  label: string;
  value: string;
  unit: string;
  sub: string;
  color: string;
}

export const HEALTH = {
  score: '82',
  /** Verbatim from the source. */
  ring: 'conic-gradient(var(--action) 0% 82%, var(--surface-3) 82% 100%)',
  word: 'Steady',
  label: '3 items need attention',
} as const;

export const TILES: StatTile[] = [
  { label: 'Conformance', value: '91', unit: '%', sub: 'ISO 9001 + ISO 22000', color: 'var(--action)' },
  { label: 'Open actions', value: '4', unit: '', sub: '2 due this week', color: 'var(--warn)' },
  { label: 'Next audit', value: '42', unit: ' days', sub: 'ISO 22000 surveillance · NQA', color: 'var(--fg-1)' },
];

export interface KpiRow {
  id: string;
  code: string;
  name: string;
  valueText: string;
  target: string;
  status: BadgeSpec;
}

export const KPI_ROWS: KpiRow[] = KPIS.map((k) => ({
  id: k.id,
  code: k.code,
  name: k.name,
  valueText: `${k.value}${k.unit}`,
  target: k.target,
  status: kpiBadge(k.status),
}));

export interface LoopStage {
  label: string;
  signal: string;
  tone: 'good' | 'warn';
}

export const LOOP: LoopStage[] = [
  { label: 'Understand', signal: '6 processes mapped', tone: 'good' },
  { label: 'Identify', signal: '8 risks · 3 high', tone: 'warn' },
  { label: 'Design', signal: '8 controls · 2 gaps', tone: 'warn' },
  { label: 'Implement', signal: '10 documents · 2 review-due', tone: 'warn' },
  { label: 'Measure', signal: '7 KPIs · 1 off-target', tone: 'warn' },
  { label: 'Improve', signal: '4 actions open', tone: 'warn' },
];

export interface OpenActionRow {
  id: string;
  code: string;
  title: string;
  owner: string;
  sourceText: string;
  priority: BadgeSpec;
  dueText: string;
  dueColor: string;
}

export const OPEN_ACTIONS: OpenActionRow[] = ACTIONS.filter((a) => a.status !== 'closed')
  .slice()
  .sort((a, b) => a.due.localeCompare(b.due))
  .map((a) => ({
    id: a.id,
    code: a.code,
    title: a.name,
    owner: a.owner,
    sourceText: a.source,
    priority: priBadge(a.priority),
    dueText: a.due,
    dueColor: dueColorOf(a.dueTone),
  }));

export interface EvidenceRow {
  id: string;
  code: string;
  name: string;
  dateText: string;
  status: BadgeSpec;
}

export const RECENT_EVIDENCE: EvidenceRow[] = EVIDENCE.slice()
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 5)
  .map((e) => ({ id: e.id, code: e.code, name: e.name, dateText: e.date, status: evBadge(e.status) }));

export const COUNTS = {
  kpis: DATA.kpis.length,
  clauses: CLAUSES.length,
  openActions: OPEN_ACTIONS.length,
};
