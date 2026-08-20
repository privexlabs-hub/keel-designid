/** System map model — a port of `buildMap`. */
import { CONTROLS, DOCUMENTS, EVIDENCE, KPIS, PROCESSES, RISKS, findEntity, type EntityType } from '@/data/demo';
import { ctrlBadge, docBadge, evBadge, kpiBadge, riskBadge, type BadgeSpec } from './tone';

export interface MapCard {
  type: EntityType;
  id: string;
  code: string;
  name: string;
  sub: string | null;
  status: BadgeSpec | null;
}

export interface MapColumn {
  key: string;
  label: string;
  count: number;
  items: MapCard[];
}

export const DEFAULT_MAP_ROOT = 'P-02';

export function buildMap(rootId: string): MapColumn[] {
  const root = PROCESSES.find((p) => p.id === rootId) ?? PROCESSES[0];

  const risks = RISKS.filter((r) => r.process === root.id);
  const riskIds = risks.map((r) => r.id);
  const controls = CONTROLS.filter((c) => riskIds.includes(c.risk));
  const ctrlIds = controls.map((c) => c.id);
  const docCodes = Array.from(new Set(controls.map((c) => c.doc)));
  const docs = docCodes
    .map((dc) => DOCUMENTS.find((d) => d.id === dc))
    .filter((d): d is (typeof DOCUMENTS)[number] => Boolean(d));
  const evidence = EVIDENCE.filter((e) => ctrlIds.includes(e.control));
  const kpis = KPIS.filter((k) => k.process === root.id);

  const card = (
    type: EntityType,
    e: { id: string; code: string; name: string },
    sub: string | null,
    status: BadgeSpec | null,
  ): MapCard => ({ type, id: e.id, code: e.code, name: e.name, sub, status });

  return [
    {
      key: 'process',
      label: 'Process',
      count: 1,
      items: [card('process', root, `${root.fn} · ${root.owner}`, null)],
    },
    {
      key: 'risk',
      label: 'Risks',
      count: risks.length,
      items: risks.map((r) => card('risk', r, null, riskBadge(r.level))),
    },
    {
      key: 'control',
      label: 'Controls',
      count: controls.length,
      items: controls.map((c) => card('control', c, c.type, ctrlBadge(c.status))),
    },
    {
      key: 'document',
      label: 'Documents',
      count: docs.length,
      items: docs.map((d) => card('document', d, d.version, docBadge(d.status))),
    },
    {
      key: 'evidence',
      label: 'Evidence',
      count: evidence.length,
      items: evidence.map((e) => card('evidence', e, e.date, evBadge(e.status))),
    },
    {
      key: 'kpi',
      label: 'KPIs',
      count: kpis.length,
      items: kpis.map((k) => card('kpi', k, `${k.value}${k.unit} · target ${k.target}`, kpiBadge(k.status))),
    },
  ];
}

export function mapRootExists(id: string): boolean {
  return Boolean(findEntity('process', id));
}
