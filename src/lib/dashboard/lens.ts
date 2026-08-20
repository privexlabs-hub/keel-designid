/**
 * The three-way lens.
 *
 * A lens does not filter data — it re-frames it. Ported from the source's
 * `buildNav`, the `framing` / `lensName` maps in `buildOverview`, the lens
 * panel branch, and the `actions` entry of `renderVals().titles`.
 */
import { ACTIONS, CLAUSES, DATA, PROCESSES, RISKS } from '@/data/demo';
import type { IconName } from '@/brand/icons';
import { pctColor, toneColor } from './tone';
import { REGISTER_TYPES, registerHref, type RegisterType } from './registers';

export const LENSES = ['process', 'risk', 'standard'] as const;
export type Lens = (typeof LENSES)[number];

export const LENS_LABEL: Record<Lens, string> = {
  process: 'Process',
  risk: 'Risk',
  standard: 'Standard',
};

export function isLens(v: string): v is Lens {
  return (LENSES as readonly string[]).includes(v);
}

/** Uppercase framing eyebrow on the overview hero: "{name} lens". */
export const LENS_NAME: Record<Lens, string> = {
  process: 'Operating',
  risk: 'Assurance',
  standard: 'Conformance',
};

export const LENS_FRAMING: Record<Lens, string> = {
  process: 'Operating view — the business as the processes you run every day.',
  risk: 'Assurance view — the business as a register of risks and the controls that hold them.',
  standard: 'Conformance view — the business mapped to ISO 9001 clauses and audit readiness.',
};

/** The Actions view is retitled under the standard lens. */
export function actionsTitle(lens: Lens): string {
  return lens === 'standard' ? 'Findings & actions' : 'Corrective actions';
}

// ---------------------------------------------------------------- navigation

export interface NavItem {
  kind: 'item';
  label: string;
  icon: IconName;
  href: string;
  count?: number;
}

export interface NavSection {
  kind: 'section';
  label: string;
}

export type NavEntry = NavItem | NavSection;

const openCount = () => ACTIONS.filter((a) => a.status !== 'closed').length;

const reg = (label: string, icon: IconName, type: RegisterType, count: number): NavItem => ({
  kind: 'item',
  label,
  icon,
  href: registerHref(type),
  count,
});

const view = (label: string, icon: IconName, href: string, count?: number): NavItem => ({
  kind: 'item',
  label,
  icon,
  href,
  count,
});

const sec = (label: string): NavSection => ({ kind: 'section', label });

const N = {
  process: PROCESSES.length,
  risk: RISKS.length,
  control: DATA.controls.length,
  document: DATA.documents.length,
  evidence: DATA.evidence.length,
  kpi: DATA.kpis.length,
  audit: DATA.audits.length,
  clause: CLAUSES.length,
};

/** Nav for a lens. Mirrors `buildNav` exactly, including ordering. */
export function navFor(lens: Lens): NavEntry[] {
  const top: NavEntry[] = [
    view('Overview', 'gauge', '/dashboard/'),
    view('System map', 'share2', '/dashboard/map/'),
  ];

  if (lens === 'process') {
    return top.concat([
      sec('Operate'),
      reg('Processes', 'gitBranch', 'process', N.process),
      reg('Risks', 'alert', 'risk', N.risk),
      reg('Controls', 'shield', 'control', N.control),
      reg('Documents', 'file', 'document', N.document),
      reg('Evidence', 'clipCheck', 'evidence', N.evidence),
      reg('KPIs', 'trending', 'kpi', N.kpi),
      sec('Assure'),
      view('Audits', 'clipList', '/dashboard/audits/', N.audit),
      view('Corrective actions', 'wrench', '/dashboard/actions/', openCount()),
    ]);
  }

  if (lens === 'risk') {
    return top.concat([
      sec('Assure'),
      reg('Risk register', 'alert', 'risk', N.risk),
      reg('Controls', 'shield', 'control', N.control),
      view('Corrective actions', 'wrench', '/dashboard/actions/', openCount()),
      reg('Evidence', 'clipCheck', 'evidence', N.evidence),
      view('Audits', 'clipList', '/dashboard/audits/', N.audit),
      reg('KPIs', 'trending', 'kpi', N.kpi),
      sec('Operate'),
      reg('Processes', 'gitBranch', 'process', N.process),
      reg('Documents', 'file', 'document', N.document),
    ]);
  }

  return top.concat([
    sec('Conform'),
    view('Conformance', 'layers', '/dashboard/conformance/', N.clause),
    view('Audits', 'clipList', '/dashboard/audits/', N.audit),
    view('Findings & actions', 'wrench', '/dashboard/actions/', openCount()),
    reg('Evidence', 'clipCheck', 'evidence', N.evidence),
    sec('Operate'),
    reg('Processes', 'gitBranch', 'process', N.process),
    reg('Risks', 'alert', 'risk', N.risk),
    reg('Controls', 'shield', 'control', N.control),
    reg('Documents', 'file', 'document', N.document),
    reg('KPIs', 'trending', 'kpi', N.kpi),
  ]);
}

/** Every href the nav can produce, for the icon-rail tooltip pass. */
export const ALL_REGISTER_HREFS = REGISTER_TYPES.map(registerHref);

// --------------------------------------------------------- lens panel (bars)

export interface LensBar {
  label: string;
  valueText: string;
  pctText: string;
  color: string;
}

export interface LensPanel {
  title: string;
  sub: string;
  bars: LensBar[];
}

/** Per-process health, hard-coded in the source as `hm`. */
const PROCESS_HEALTH: Record<string, number> = {
  'P-01': 90,
  'P-02': 86,
  'P-03': 78,
  'P-04': 72,
  'P-05': 94,
  'P-06': 64,
};

export function lensPanel(lens: Lens): LensPanel {
  if (lens === 'risk') {
    const buckets = [
      ['High', 'high', 'bad'],
      ['Medium', 'medium', 'warn'],
      ['Low', 'low', 'neutral'],
    ] as const;
    return {
      title: 'Risk posture',
      sub: '8 risks across 6 processes',
      bars: buckets.map(([label, level, tone]) => {
        const n = RISKS.filter((r) => r.level === level).length;
        return {
          label,
          valueText: String(n),
          pctText: `${Math.round((n / 8) * 100)}%`,
          color: toneColor(tone),
        };
      }),
    };
  }

  if (lens === 'standard') {
    return {
      title: 'Conformance by clause',
      sub: 'ISO 9001:2015',
      bars: CLAUSES.map((c) => ({
        label: `Clause ${c.code} · ${c.title.split(' — ')[0]}`,
        valueText: `${c.pct}%`,
        pctText: `${c.pct}%`,
        color: pctColor(c.pct),
      })),
    };
  }

  return {
    title: 'Process health',
    sub: 'Risk-weighted, by owner',
    bars: PROCESSES.map((p) => {
      const h = PROCESS_HEALTH[p.id] ?? 0;
      return {
        label: `${p.code} · ${p.name}`,
        valueText: `${h}%`,
        pctText: `${h}%`,
        // Process health uses its own thresholds in the source (85 / 72),
        // not the clause thresholds (90 / 75).
        color: h >= 85 ? 'var(--brand)' : h >= 72 ? 'var(--warn)' : 'var(--danger)',
      };
    }),
  };
}
