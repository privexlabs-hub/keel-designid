'use client';

/**
 * The six registers. Column sets are a direct port of `buildRegister`; the
 * three-breakpoint behaviour comes from `<ResponsiveTable>`.
 */
import {
  ACTIONS,
  CONTROLS,
  DOCUMENTS,
  EVIDENCE,
  KPIS,
  PROCESSES,
  RISKS,
  type Control,
  type ControlledDocument,
  type Evidence,
  type Kpi,
  type Process,
  type Risk,
} from '@/data/demo';
import type { RegisterType } from '@/lib/dashboard/registers';
import { ctrlBadge, docBadge, evBadge, kpiBadge, riskBadge } from '@/lib/dashboard/tone';
import { Badge } from './Badge';
import { useDashboard } from './DashboardContext';
import { PageBody, Panel } from './PageBody';
import { ResponsiveTable, type TableColumn } from './ResponsiveTable';

const mono = (v: string) => (
  <span className="font-mono text-fg-2" style={{ fontSize: 13 }}>
    {v}
  </span>
);
const strong = (v: string) => (
  <span className="text-fg-1" style={{ fontSize: 13 }}>
    {v}
  </span>
);
const plain = (v: string) => (
  <span className="text-fg-2" style={{ fontSize: 13 }}>
    {v}
  </span>
);
const monoStrong = (v: string) => (
  <span className="font-mono text-fg-1" style={{ fontSize: 13 }}>
    {v}
  </span>
);

const openActionsFor = (rid: string) =>
  ACTIONS.filter((a) => a.risk === rid && a.status !== 'closed').length;

function ProcessTable() {
  const { openDetail } = useDashboard();
  const columns: TableColumn<Process>[] = [
    { key: 'code', label: 'Code', omitInCard: true, cell: (p) => mono(p.code) },
    { key: 'name', label: 'Process', omitInCard: true, cell: (p) => strong(p.name) },
    { key: 'fn', label: 'Function', cell: (p) => plain(p.fn) },
    { key: 'owner', label: 'Owner', cell: (p) => plain(p.owner) },
    {
      key: 'risks',
      label: 'Risks',
      cell: (p) => mono(String(RISKS.filter((r) => r.process === p.id).length)),
    },
  ];
  return (
    <ResponsiveTable
      label="Processes"
      columns={columns}
      rows={PROCESSES}
      rowKey={(p) => p.id}
      primary={(p) => p.name}
      secondary={(p) => p.code}
      onRowClick={(p) => openDetail('process', p.id)}
    />
  );
}

function RiskTable() {
  const { openDetail } = useDashboard();
  const columns: TableColumn<Risk>[] = [
    { key: 'code', label: 'Code', omitInCard: true, cell: (r) => mono(r.code) },
    { key: 'name', label: 'Risk', omitInCard: true, cell: (r) => strong(r.name) },
    { key: 'process', label: 'Process', cell: (r) => mono(r.process) },
    { key: 'level', label: 'Level', omitInCard: true, cell: (r) => <Badge spec={riskBadge(r.level)} /> },
    { key: 'owner', label: 'Owner', cell: (r) => plain(r.owner) },
    { key: 'open', label: 'Open actions', cell: (r) => mono(String(openActionsFor(r.id))) },
  ];
  return (
    <ResponsiveTable
      label="Risk register"
      columns={columns}
      rows={RISKS}
      rowKey={(r) => r.id}
      primary={(r) => r.name}
      secondary={(r) => r.code}
      trailing={(r) => <Badge spec={riskBadge(r.level)} />}
      onRowClick={(r) => openDetail('risk', r.id)}
    />
  );
}

function ControlTable() {
  const { openDetail } = useDashboard();
  const columns: TableColumn<Control>[] = [
    { key: 'code', label: 'Code', omitInCard: true, cell: (c) => mono(c.code) },
    { key: 'name', label: 'Control', omitInCard: true, cell: (c) => strong(c.name) },
    { key: 'type', label: 'Type', cell: (c) => plain(c.type) },
    { key: 'risk', label: 'Mitigates', cell: (c) => mono(c.risk) },
    { key: 'doc', label: 'Document', cell: (c) => mono(c.doc) },
    { key: 'status', label: 'Status', omitInCard: true, cell: (c) => <Badge spec={ctrlBadge(c.status)} /> },
  ];
  return (
    <ResponsiveTable
      label="Controls"
      columns={columns}
      rows={CONTROLS}
      rowKey={(c) => c.id}
      primary={(c) => c.name}
      secondary={(c) => c.code}
      trailing={(c) => <Badge spec={ctrlBadge(c.status)} />}
      onRowClick={(c) => openDetail('control', c.id)}
    />
  );
}

function DocumentTable() {
  const { openDetail } = useDashboard();
  const columns: TableColumn<ControlledDocument>[] = [
    { key: 'code', label: 'Code', omitInCard: true, cell: (d) => mono(d.code) },
    { key: 'name', label: 'Document', omitInCard: true, cell: (d) => strong(d.name) },
    { key: 'version', label: 'Version', cell: (d) => mono(d.version) },
    { key: 'owner', label: 'Owner', cell: (d) => plain(d.owner) },
    { key: 'status', label: 'Status', omitInCard: true, cell: (d) => <Badge spec={docBadge(d.status)} /> },
    { key: 'reviewed', label: 'Last reviewed', cell: (d) => mono(d.reviewed) },
  ];
  return (
    <ResponsiveTable
      label="Controlled documents"
      columns={columns}
      rows={DOCUMENTS}
      rowKey={(d) => d.id}
      primary={(d) => d.name}
      secondary={(d) => d.code}
      trailing={(d) => <Badge spec={docBadge(d.status)} />}
      onRowClick={(d) => openDetail('document', d.id)}
    />
  );
}

function EvidenceTable() {
  const { openDetail } = useDashboard();
  const columns: TableColumn<Evidence>[] = [
    { key: 'code', label: 'ID', omitInCard: true, cell: (e) => mono(e.code) },
    { key: 'name', label: 'Evidence', omitInCard: true, cell: (e) => strong(e.name) },
    { key: 'control', label: 'Control', cell: (e) => mono(e.control) },
    { key: 'doc', label: 'Document', cell: (e) => mono(e.doc) },
    { key: 'date', label: 'Recorded', cell: (e) => mono(e.date) },
    { key: 'status', label: 'Status', omitInCard: true, cell: (e) => <Badge spec={evBadge(e.status)} /> },
  ];
  return (
    <ResponsiveTable
      label="Evidence records"
      columns={columns}
      rows={EVIDENCE}
      rowKey={(e) => e.id}
      primary={(e) => e.name}
      secondary={(e) => e.code}
      trailing={(e) => <Badge spec={evBadge(e.status)} />}
      onRowClick={(e) => openDetail('evidence', e.id)}
    />
  );
}

function KpiTable() {
  const { openDetail } = useDashboard();
  const columns: TableColumn<Kpi>[] = [
    { key: 'code', label: 'Code', omitInCard: true, cell: (k) => mono(k.code) },
    { key: 'name', label: 'Measure', omitInCard: true, cell: (k) => strong(k.name) },
    { key: 'value', label: 'Value', cell: (k) => monoStrong(`${k.value}${k.unit}`) },
    { key: 'target', label: 'Target', cell: (k) => mono(k.target) },
    { key: 'process', label: 'Process', cell: (k) => mono(k.process) },
    { key: 'status', label: 'Status', omitInCard: true, cell: (k) => <Badge spec={kpiBadge(k.status)} /> },
  ];
  return (
    <ResponsiveTable
      label="Key performance indicators"
      columns={columns}
      rows={KPIS}
      rowKey={(k) => k.id}
      primary={(k) => k.name}
      secondary={(k) => k.code}
      trailing={(k) => <Badge spec={kpiBadge(k.status)} />}
      onRowClick={(k) => openDetail('kpi', k.id)}
    />
  );
}

const TABLES: Record<RegisterType, () => React.JSX.Element> = {
  process: ProcessTable,
  risk: RiskTable,
  control: ControlTable,
  document: DocumentTable,
  evidence: EvidenceTable,
  kpi: KpiTable,
};

export function RegisterView({ type }: { type: RegisterType }) {
  const Table = TABLES[type];
  return (
    <PageBody>
      <Panel>
        <Table />
      </Panel>
    </PageBody>
  );
}
