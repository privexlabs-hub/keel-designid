/**
 * Semantic tone table — ported verbatim from the source's `TONE` map plus its
 * `*Tone` / `*Badge` helper families.
 *
 * Colours are `var()` references, never literals, so the token layer stays the
 * single source of truth (CONVENTIONS rule 1).
 */
import type {
  ActionStatus,
  ClauseStatus,
  ControlStatus,
  DocumentStatus,
  EntityType,
  EvidenceStatus,
  KpiStatus,
  Priority,
  RiskLevel,
  Tone,
} from '@/data/demo';

export interface ToneSpec {
  /** Foreground / dot colour. */
  c: string;
  /** Weak background. */
  b: string;
  /** Weak border. */
  d: string;
}

export const TONE: Record<Tone, ToneSpec> = {
  good: { c: 'var(--brand)', b: 'var(--brand-weak)', d: 'var(--brand-weak-bd)' },
  warn: { c: 'var(--warn)', b: 'var(--warn-weak)', d: 'var(--warn-weak-bd)' },
  bad: { c: 'var(--danger)', b: 'var(--danger-weak)', d: 'var(--danger-weak-bd)' },
  info: { c: 'var(--info)', b: 'var(--info-weak)', d: 'var(--info-weak-bd)' },
  neutral: { c: 'var(--fg-2)', b: 'var(--surface-2)', d: 'var(--border)' },
};

export function toneSpec(tone: Tone): ToneSpec {
  return TONE[tone] ?? TONE.neutral;
}

export function toneColor(tone: Tone): string {
  return toneSpec(tone).c;
}

/** Due-date colour, from `dueColorOf`. */
export function dueColorOf(tone: Tone): string {
  return tone === 'bad' ? 'var(--danger)' : tone === 'warn' ? 'var(--warn)' : 'var(--fg-3)';
}

export const riskTone = (l: RiskLevel): Tone => (l === 'high' ? 'bad' : l === 'medium' ? 'warn' : 'neutral');
export const ctrlTone = (s: ControlStatus): Tone => (s === 'effective' ? 'good' : s === 'monitor' ? 'warn' : 'bad');
export const docTone = (s: DocumentStatus): Tone => (s === 'current' ? 'good' : s === 'review-due' ? 'warn' : 'neutral');
export const evTone = (s: EvidenceStatus): Tone => (s === 'valid' ? 'good' : s === 'expiring' ? 'warn' : 'bad');
export const kpiTone = (s: KpiStatus): Tone => (s === 'good' ? 'good' : s === 'watch' ? 'warn' : 'bad');
export const actTone = (s: ActionStatus): Tone => (s === 'open' ? 'warn' : s === 'in-progress' ? 'info' : 'good');
export const priTone = (p: Priority): Tone => (p === 'high' ? 'bad' : p === 'medium' ? 'warn' : 'neutral');
export const clauseTone = (s: ClauseStatus): Tone => (s === 'covered' ? 'good' : s === 'partial' ? 'warn' : 'bad');

/** A badge is (label, tone). Rendering lives in `<Badge>`. */
export interface BadgeSpec {
  label: string;
  tone: Tone;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const riskBadge = (l: RiskLevel): BadgeSpec => ({ label: cap(l), tone: riskTone(l) });
export const ctrlBadge = (s: ControlStatus): BadgeSpec => ({
  label: { effective: 'Effective', monitor: 'Monitor', gap: 'Gap' }[s],
  tone: ctrlTone(s),
});
export const docBadge = (s: DocumentStatus): BadgeSpec => ({
  label: { current: 'Current', 'review-due': 'Review due', draft: 'Draft' }[s],
  tone: docTone(s),
});
export const evBadge = (s: EvidenceStatus): BadgeSpec => ({
  label: { valid: 'Valid', expiring: 'Expiring', overdue: 'Overdue' }[s],
  tone: evTone(s),
});
export const kpiBadge = (s: KpiStatus): BadgeSpec => ({
  label: { good: 'On target', watch: 'Watch', bad: 'Off target' }[s],
  tone: kpiTone(s),
});
export const actBadge = (s: ActionStatus): BadgeSpec => ({
  label: { open: 'Open', 'in-progress': 'In progress', closed: 'Closed' }[s],
  tone: actTone(s),
});
export const priBadge = (p: Priority): BadgeSpec => ({ label: cap(p), tone: priTone(p) });
export const auditBadge = (s: 'scheduled' | 'closed'): BadgeSpec => ({
  label: s === 'closed' ? 'Closed' : 'Scheduled',
  tone: s === 'closed' ? 'good' : 'info',
});
export const clauseBadge = (s: ClauseStatus): BadgeSpec => ({
  label: s === 'covered' ? 'Conformant' : s === 'partial' ? 'Partial' : 'Gap',
  tone: clauseTone(s),
});

/** Percentage-driven bar colour, used by conformance and the standard lens. */
export function pctColor(pct: number): string {
  return pct >= 90 ? 'var(--brand)' : pct >= 75 ? 'var(--warn)' : 'var(--danger)';
}

/** Icon name per entity type, from `buildDetail`'s `icons` map. */
export const ENTITY_ICON = {
  process: 'gitBranch',
  risk: 'alert',
  control: 'shield',
  document: 'file',
  evidence: 'clipCheck',
  kpi: 'trending',
  action: 'wrench',
  audit: 'clipList',
  clause: 'layers',
} as const satisfies Record<EntityType, string>;

/** Human label per entity type, from `buildDetail`'s `typeLabels` map. */
export const ENTITY_LABEL: Record<EntityType, string> = {
  process: 'Process',
  risk: 'Risk',
  control: 'Control',
  document: 'Document',
  evidence: 'Evidence',
  kpi: 'KPI',
  action: 'Corrective action',
  audit: 'Audit',
  clause: 'Clause',
};
