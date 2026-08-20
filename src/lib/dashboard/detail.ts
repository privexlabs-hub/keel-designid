/**
 * The detail drawer model — a port of `relChip`, `entityToneColor` and
 * `buildDetail`. Pure data: the drawer component owns all rendering.
 */
import {
  ACTIONS,
  CONTROLS,
  DATA,
  EVIDENCE,
  KPIS,
  RISKS,
  findEntity,
  processName,
  type EntityType,
} from '@/data/demo';
import type { IconName } from '@/brand/icons';
import {
  ENTITY_ICON,
  ENTITY_LABEL,
  actBadge,
  auditBadge,
  ctrlBadge,
  ctrlTone,
  docBadge,
  docTone,
  evBadge,
  evTone,
  kpiBadge,
  kpiTone,
  priBadge,
  riskBadge,
  riskTone,
  toneColor,
  actTone,
  type BadgeSpec,
} from './tone';

export interface RelChip {
  type: EntityType;
  id: string;
  code: string;
  label: string;
  dotColor: string;
}

/** Tone colour for an entity's own status field. */
export function entityToneColor(type: EntityType, e: unknown): string {
  if (type === 'risk') return toneColor(riskTone((e as { level: 'high' | 'medium' | 'low' }).level));
  if (type === 'control') return toneColor(ctrlTone((e as { status: 'effective' | 'monitor' | 'gap' }).status));
  if (type === 'document') return toneColor(docTone((e as { status: 'current' | 'review-due' | 'draft' }).status));
  if (type === 'evidence') return toneColor(evTone((e as { status: 'valid' | 'expiring' | 'overdue' }).status));
  if (type === 'kpi') return toneColor(kpiTone((e as { status: 'good' | 'watch' | 'bad' }).status));
  if (type === 'action') return toneColor(actTone((e as { status: 'open' | 'in-progress' | 'closed' }).status));
  return 'var(--fg-3)';
}

export function relChip(type: EntityType, id: string): RelChip | null {
  const e = findEntity(type, id) as { code: string; name: string } | undefined;
  if (!e) return null;
  return { type, id, code: e.code, label: e.name, dotColor: entityToneColor(type, e) };
}

export interface DetailField {
  label: string;
  /** Either a plain value or a badge. */
  value?: string;
  badge?: BadgeSpec;
  mono?: boolean;
}

export interface RelatedGroup {
  label: string;
  items: RelChip[];
}

export interface DetailModel {
  type: EntityType;
  id: string;
  typeLabel: string;
  icon: IconName;
  code: string;
  title: string;
  subtitle: string;
  status: BadgeSpec | null;
  fields: DetailField[];
  related: RelatedGroup[];
}

const fTxt = (label: string, value: string, mono = false): DetailField => ({ label, value, mono });
const fEl = (label: string, badge: BadgeSpec): DetailField => ({ label, badge });
const grp = (label: string, items: (RelChip | null)[]): RelatedGroup => ({
  label,
  items: items.filter((x): x is RelChip => x !== null),
});

/** Build the drawer model for any entity, or null when the id does not resolve. */
export function buildDetail(type: EntityType, id: string): DetailModel | null {
  const raw = findEntity(type, id);
  if (!raw) return null;

  const base = {
    type,
    id,
    typeLabel: ENTITY_LABEL[type],
    icon: ENTITY_ICON[type] as IconName,
    status: null as BadgeSpec | null,
    subtitle: '',
    fields: [] as DetailField[],
    related: [] as RelatedGroup[],
  };

  if (type === 'process') {
    const e = raw as (typeof DATA.processes)[number];
    return {
      ...base,
      code: e.code,
      title: e.name,
      subtitle: `Owned by ${e.owner}`,
      fields: [fTxt('Function', e.fn), fTxt('Owner', e.owner), fTxt('Process ID', e.code, true)],
      related: [
        grp('Risks', RISKS.filter((r) => r.process === id).map((r) => relChip('risk', r.id))),
        grp('KPIs', KPIS.filter((k) => k.process === id).map((k) => relChip('kpi', k.id))),
      ],
    };
  }

  if (type === 'risk') {
    const e = raw as (typeof DATA.risks)[number];
    return {
      ...base,
      code: e.code,
      title: e.name,
      subtitle: `in ${processName(e.process)}`,
      status: riskBadge(e.level),
      fields: [
        fEl('Level', riskBadge(e.level)),
        fTxt('Severity × likelihood', `${e.sev} × ${e.lik}`, true),
        fTxt('Owner', e.owner),
        fTxt('ISO clauses', e.clauses.join(', '), true),
      ],
      related: [
        grp('Controls', CONTROLS.filter((c) => c.risk === id).map((c) => relChip('control', c.id))),
        grp(
          'Open actions',
          ACTIONS.filter((a) => a.risk === id && a.status !== 'closed').map((a) => relChip('action', a.id)),
        ),
        grp('Process', [relChip('process', e.process)]),
      ],
    };
  }

  if (type === 'control') {
    const e = raw as (typeof DATA.controls)[number];
    const mitigated = findEntity('risk', e.risk) as { name: string } | undefined;
    return {
      ...base,
      code: e.code,
      title: e.name,
      subtitle: `mitigates ${mitigated?.name ?? e.risk}`,
      status: ctrlBadge(e.status),
      fields: [
        fTxt('Type', e.type),
        fEl('Status', ctrlBadge(e.status)),
        fTxt('Mitigates', e.risk, true),
        fTxt('Document', e.doc, true),
      ],
      related: [
        grp('Risk', [relChip('risk', e.risk)]),
        grp('Document', [relChip('document', e.doc)]),
        grp('Evidence', EVIDENCE.filter((v) => v.control === id).map((v) => relChip('evidence', v.id))),
      ],
    };
  }

  if (type === 'document') {
    const e = raw as (typeof DATA.documents)[number];
    return {
      ...base,
      code: e.code,
      title: e.name,
      subtitle: 'Controlled document',
      status: docBadge(e.status),
      fields: [
        fTxt('Version', e.version, true),
        fTxt('Owner', e.owner),
        fEl('Status', docBadge(e.status)),
        fTxt('Last reviewed', e.reviewed, true),
      ],
      related: [
        grp('Controls', CONTROLS.filter((c) => c.doc === e.code).map((c) => relChip('control', c.id))),
        grp('Evidence', EVIDENCE.filter((v) => v.doc === e.code).map((v) => relChip('evidence', v.id))),
      ],
    };
  }

  if (type === 'evidence') {
    const e = raw as (typeof DATA.evidence)[number];
    return {
      ...base,
      code: e.code,
      title: e.name,
      subtitle: 'Record',
      status: evBadge(e.status),
      fields: [fTxt('Recorded', e.date, true), fTxt('Recorded by', e.by), fEl('Status', evBadge(e.status))],
      related: [grp('Control', [relChip('control', e.control)]), grp('Document', [relChip('document', e.doc)])],
    };
  }

  if (type === 'kpi') {
    const e = raw as (typeof DATA.kpis)[number];
    return {
      ...base,
      code: e.code,
      title: e.name,
      subtitle: processName(e.process),
      status: kpiBadge(e.status),
      fields: [
        fTxt('Current value', `${e.value}${e.unit}`, true),
        fTxt('Target', e.target, true),
        fTxt('Process', e.process, true),
        fTxt('Trend', e.trend),
      ],
      related: [grp('Process', [relChip('process', e.process)])],
    };
  }

  if (type === 'action') {
    const e = raw as (typeof DATA.actions)[number];
    return {
      ...base,
      code: e.code,
      title: e.name,
      subtitle: 'Corrective action',
      status: actBadge(e.status),
      fields: [
        fEl('Status', actBadge(e.status)),
        fEl('Priority', priBadge(e.priority)),
        fTxt('Owner', e.owner),
        fTxt('Due', e.due, true),
        fTxt('Raised from', e.source),
      ],
      related: [grp('Risk', [relChip('risk', e.risk)])],
    };
  }

  if (type === 'audit') {
    const e = raw as (typeof DATA.audits)[number];
    return {
      ...base,
      code: e.code,
      title: e.name,
      subtitle: e.type,
      status: auditBadge(e.status),
      fields: [
        fTxt('Type', e.type),
        fTxt('Date', e.date, true),
        fEl('Status', auditBadge(e.status)),
        fTxt('Findings', e.findings),
      ],
      related: [],
    };
  }

  // Clauses are not reachable from the source drawer; render a minimal card so
  // a stray link never dead-ends.
  const e = raw as (typeof DATA.clauses)[number];
  return {
    ...base,
    code: e.code,
    title: e.title,
    subtitle: 'ISO 9001:2015 clause',
    fields: [fTxt('Coverage', `${e.pct}%`, true), fTxt('Status', e.status)],
    related: [grp('Related records', e.links.map(([t, rid]) => relChip(t, rid)))],
  };
}
