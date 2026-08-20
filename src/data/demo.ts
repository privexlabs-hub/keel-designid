/**
 * Keel demo workspace data.
 *
 * Ported verbatim from the `D` object in the imported design source
 * (Keel.dc.html). Values are unchanged — this is the reference dataset the
 * dashboard, the playbook's examples, and several template defaults all read.
 *
 * The app is frontend-only: this module is the entire data layer.
 */

export type RiskLevel = 'high' | 'medium' | 'low';
export type ControlType = 'Preventive' | 'Detective';
export type ControlStatus = 'effective' | 'monitor' | 'gap';
export type DocumentStatus = 'current' | 'review-due' | 'draft';
export type ClauseStatus = 'covered' | 'partial' | 'gap';
export type EvidenceStatus = 'valid' | 'expiring' | 'overdue';
export type KpiStatus = 'good' | 'watch' | 'bad';
export type KpiTrend = 'up' | 'down' | 'flat';
/** Free-form in the source: "Internal", or an external body e.g. "External · NQA". */
export type AuditType = string;
export type AuditStatus = 'scheduled' | 'closed';
export type ActionStatus = 'open' | 'in-progress' | 'closed';
export type Priority = 'high' | 'medium' | 'low';
export type Tone = 'good' | 'warn' | 'bad' | 'info' | 'neutral';

/** Entity collections addressable by the detail drawer and relation chips. */
export type EntityType =
  | 'process' | 'risk' | 'control' | 'document'
  | 'evidence' | 'kpi' | 'audit' | 'action' | 'clause';

export interface Company {
  name: string;
  standards: string[];
}

export interface Process {
  id: string;
  code: string;
  name: string;
  owner: string;
  /** Business function, e.g. Procurement / Production. */
  fn: string;
}

export interface Risk {
  id: string;
  code: string;
  name: string;
  /** Process id this risk belongs to. */
  process: string;
  level: RiskLevel;
  /** Severity 1-5. */
  sev: number;
  /** Likelihood 1-5. */
  lik: number;
  owner: string;
  /** ISO clause references. */
  clauses: string[];
}

export interface Control {
  id: string;
  code: string;
  name: string;
  /** Risk id this control mitigates. */
  risk: string;
  /** Document id defining the control. */
  doc: string;
  type: ControlType;
  status: ControlStatus;
}

export interface ControlledDocument {
  id: string;
  code: string;
  name: string;
  version: string;
  owner: string;
  status: DocumentStatus;
  /** Last reviewed date, ISO-ish as authored in the source. */
  reviewed: string;
}

export interface Evidence {
  id: string;
  code: string;
  name: string;
  /** Control id this record proves ran. */
  control: string;
  doc: string;
  date: string;
  by: string;
  status: EvidenceStatus;
}

export interface Kpi {
  id: string;
  code: string;
  name: string;
  /** Authored as a string in the source so trailing zeros survive ("96.4"). */
  value: string;
  unit: string;
  /** Target expression, e.g. ">= 98". */
  target: string;
  process: string;
  trend: KpiTrend;
  status: KpiStatus;
}

export interface Audit {
  id: string;
  code: string;
  name: string;
  type: AuditType;
  date: string;
  status: AuditStatus;
  findings: string;
}

export interface CorrectiveAction {
  id: string;
  code: string;
  name: string;
  risk: string;
  owner: string;
  due: string;
  dueTone: Tone;
  status: ActionStatus;
  priority: Priority;
  /** Where the action came from, e.g. "Audit A-01". */
  source: string;
}

export interface Clause {
  id: string;
  code: string;
  title: string;
  /** Coverage percentage. */
  pct: number;
  status: ClauseStatus;
  /** Polymorphic links as [entityType, recordId] pairs. */
  links: [EntityType, string][];
}

export interface KeelData {
  company: Company;
  processes: Process[];
  risks: Risk[];
  controls: Control[];
  documents: ControlledDocument[];
  evidence: Evidence[];
  kpis: Kpi[];
  audits: Audit[];
  actions: CorrectiveAction[];
  clauses: Clause[];
}

export const COMPANY: Company = {
    "name": "Northbound Coffee Roasters",
    "standards": [
      "ISO 9001:2015",
      "ISO 22000:2018"
    ]
  };

export const PROCESSES: Process[] = [
    {
      "id": "P-01",
      "code": "P-01",
      "name": "Supplier approval & green coffee intake",
      "owner": "Dana Okafor",
      "fn": "Procurement"
    },
    {
      "id": "P-02",
      "code": "P-02",
      "name": "Roasting",
      "owner": "Sam Reyes",
      "fn": "Production"
    },
    {
      "id": "P-03",
      "code": "P-03",
      "name": "Packaging & labelling",
      "owner": "Mara Lindqvist",
      "fn": "Production"
    },
    {
      "id": "P-04",
      "code": "P-04",
      "name": "Order fulfilment & dispatch",
      "owner": "Theo Marsh",
      "fn": "Operations"
    },
    {
      "id": "P-05",
      "code": "P-05",
      "name": "Customer complaints handling",
      "owner": "Priya Nair",
      "fn": "Quality"
    },
    {
      "id": "P-06",
      "code": "P-06",
      "name": "Equipment maintenance & calibration",
      "owner": "Jon Adeyemi",
      "fn": "Facilities"
    }
  ];

export const RISKS: Risk[] = [
    {
      "id": "R-01",
      "code": "R-01",
      "name": "Undeclared allergen in blend",
      "process": "P-03",
      "level": "high",
      "sev": 5,
      "lik": 2,
      "owner": "Mara Lindqvist",
      "clauses": [
        "6.1",
        "8.5"
      ]
    },
    {
      "id": "R-02",
      "code": "R-02",
      "name": "Roast profile deviation degrades quality",
      "process": "P-02",
      "level": "medium",
      "sev": 3,
      "lik": 3,
      "owner": "Sam Reyes",
      "clauses": [
        "8.5",
        "9.1"
      ]
    },
    {
      "id": "R-03",
      "code": "R-03",
      "name": "Late delivery to wholesale accounts",
      "process": "P-04",
      "level": "medium",
      "sev": 3,
      "lik": 3,
      "owner": "Theo Marsh",
      "clauses": [
        "8.4",
        "9.1"
      ]
    },
    {
      "id": "R-04",
      "code": "R-04",
      "name": "Supplier ships out-of-spec green coffee",
      "process": "P-01",
      "level": "high",
      "sev": 4,
      "lik": 3,
      "owner": "Dana Okafor",
      "clauses": [
        "8.4"
      ]
    },
    {
      "id": "R-05",
      "code": "R-05",
      "name": "Mislabelled best-before or lot code",
      "process": "P-03",
      "level": "high",
      "sev": 4,
      "lik": 2,
      "owner": "Mara Lindqvist",
      "clauses": [
        "8.5",
        "8.6"
      ]
    },
    {
      "id": "R-06",
      "code": "R-06",
      "name": "Scale or thermocouple out of calibration",
      "process": "P-06",
      "level": "medium",
      "sev": 3,
      "lik": 3,
      "owner": "Jon Adeyemi",
      "clauses": [
        "7.1.5"
      ]
    },
    {
      "id": "R-07",
      "code": "R-07",
      "name": "Unresolved customer complaint escalates",
      "process": "P-05",
      "level": "low",
      "sev": 2,
      "lik": 2,
      "owner": "Priya Nair",
      "clauses": [
        "9.1.2",
        "10.2"
      ]
    },
    {
      "id": "R-08",
      "code": "R-08",
      "name": "Foreign-body contamination in roasting",
      "process": "P-02",
      "level": "high",
      "sev": 5,
      "lik": 1,
      "owner": "Sam Reyes",
      "clauses": [
        "8.5"
      ]
    }
  ];

export const CONTROLS: Control[] = [
    {
      "id": "C-01",
      "code": "C-01",
      "name": "Allergen segregation & line clearance",
      "risk": "R-01",
      "doc": "SOP-07",
      "type": "Preventive",
      "status": "monitor"
    },
    {
      "id": "C-02",
      "code": "C-02",
      "name": "Roast log with profile sign-off",
      "risk": "R-02",
      "doc": "SOP-03",
      "type": "Detective",
      "status": "effective"
    },
    {
      "id": "C-03",
      "code": "C-03",
      "name": "Dispatch schedule & carrier SLA review",
      "risk": "R-03",
      "doc": "SOP-11",
      "type": "Preventive",
      "status": "gap"
    },
    {
      "id": "C-04",
      "code": "C-04",
      "name": "Supplier approval & incoming inspection",
      "risk": "R-04",
      "doc": "SOP-01",
      "type": "Preventive",
      "status": "effective"
    },
    {
      "id": "C-05",
      "code": "C-05",
      "name": "Label proof & lot-code verification",
      "risk": "R-05",
      "doc": "SOP-08",
      "type": "Detective",
      "status": "monitor"
    },
    {
      "id": "C-06",
      "code": "C-06",
      "name": "Calibration programme",
      "risk": "R-06",
      "doc": "SOP-14",
      "type": "Preventive",
      "status": "gap"
    },
    {
      "id": "C-07",
      "code": "C-07",
      "name": "Complaint triage & CAPA",
      "risk": "R-07",
      "doc": "SOP-19",
      "type": "Detective",
      "status": "effective"
    },
    {
      "id": "C-08",
      "code": "C-08",
      "name": "Foreign-body screening",
      "risk": "R-08",
      "doc": "SOP-05",
      "type": "Preventive",
      "status": "effective"
    }
  ];

export const DOCUMENTS: ControlledDocument[] = [
    {
      "id": "SOP-01",
      "code": "SOP-01",
      "name": "Supplier approval procedure",
      "version": "v3.1",
      "owner": "Dana Okafor",
      "status": "current",
      "reviewed": "2026-02-10"
    },
    {
      "id": "SOP-03",
      "code": "SOP-03",
      "name": "Roasting procedure & profile control",
      "version": "v2.4",
      "owner": "Sam Reyes",
      "status": "current",
      "reviewed": "2026-03-22"
    },
    {
      "id": "SOP-05",
      "code": "SOP-05",
      "name": "Foreign-body control",
      "version": "v1.2",
      "owner": "Sam Reyes",
      "status": "current",
      "reviewed": "2025-11-30"
    },
    {
      "id": "SOP-07",
      "code": "SOP-07",
      "name": "Allergen management",
      "version": "v4.0",
      "owner": "Mara Lindqvist",
      "status": "review-due",
      "reviewed": "2025-06-01"
    },
    {
      "id": "SOP-08",
      "code": "SOP-08",
      "name": "Labelling & lot-coding",
      "version": "v2.0",
      "owner": "Mara Lindqvist",
      "status": "current",
      "reviewed": "2026-01-18"
    },
    {
      "id": "SOP-11",
      "code": "SOP-11",
      "name": "Order fulfilment & dispatch",
      "version": "v1.5",
      "owner": "Theo Marsh",
      "status": "current",
      "reviewed": "2026-04-05"
    },
    {
      "id": "SOP-14",
      "code": "SOP-14",
      "name": "Calibration & maintenance",
      "version": "v2.2",
      "owner": "Jon Adeyemi",
      "status": "review-due",
      "reviewed": "2025-05-20"
    },
    {
      "id": "SOP-19",
      "code": "SOP-19",
      "name": "Complaint handling & CAPA",
      "version": "v3.0",
      "owner": "Priya Nair",
      "status": "current",
      "reviewed": "2026-02-28"
    },
    {
      "id": "POL-01",
      "code": "POL-01",
      "name": "Quality policy",
      "version": "v2.0",
      "owner": "Avery Rhodes",
      "status": "current",
      "reviewed": "2026-01-05"
    },
    {
      "id": "POL-02",
      "code": "POL-02",
      "name": "Food safety policy",
      "version": "v1.3",
      "owner": "Priya Nair",
      "status": "current",
      "reviewed": "2025-12-12"
    }
  ];

export const EVIDENCE: Evidence[] = [
    {
      "id": "EV-1011",
      "code": "EV-1011",
      "name": "Roast batch record B-2291",
      "control": "C-02",
      "doc": "SOP-03",
      "date": "2026-06-21",
      "by": "Sam Reyes",
      "status": "valid"
    },
    {
      "id": "EV-1012",
      "code": "EV-1012",
      "name": "Allergen line-clearance checklist",
      "control": "C-01",
      "doc": "SOP-07",
      "date": "2026-06-22",
      "by": "Mara Lindqvist",
      "status": "valid"
    },
    {
      "id": "EV-1013",
      "code": "EV-1013",
      "name": "Incoming green-coffee inspection — lot GC-4471",
      "control": "C-04",
      "doc": "SOP-01",
      "date": "2026-06-19",
      "by": "Dana Okafor",
      "status": "valid"
    },
    {
      "id": "EV-1014",
      "code": "EV-1014",
      "name": "Scale calibration certificate",
      "control": "C-06",
      "doc": "SOP-14",
      "date": "2026-01-15",
      "by": "Jon Adeyemi",
      "status": "expiring"
    },
    {
      "id": "EV-1015",
      "code": "EV-1015",
      "name": "Label proof approval — Ethiopia Guji 250g",
      "control": "C-05",
      "doc": "SOP-08",
      "date": "2026-06-20",
      "by": "Mara Lindqvist",
      "status": "valid"
    },
    {
      "id": "EV-1016",
      "code": "EV-1016",
      "name": "Metal-detector verification log",
      "control": "C-08",
      "doc": "SOP-05",
      "date": "2026-06-22",
      "by": "Sam Reyes",
      "status": "valid"
    },
    {
      "id": "EV-1017",
      "code": "EV-1017",
      "name": "Complaint & CAPA record CA-204",
      "control": "C-07",
      "doc": "SOP-19",
      "date": "2026-06-10",
      "by": "Priya Nair",
      "status": "valid"
    },
    {
      "id": "EV-1018",
      "code": "EV-1018",
      "name": "Carrier SLA quarterly review",
      "control": "C-03",
      "doc": "SOP-11",
      "date": "2026-04-02",
      "by": "Theo Marsh",
      "status": "overdue"
    }
  ];

export const KPIS: Kpi[] = [
    {
      "id": "K-01",
      "code": "K-01",
      "name": "On-time delivery",
      "value": "96.4",
      "unit": "%",
      "target": "≥ 95%",
      "process": "P-04",
      "trend": "up",
      "status": "good"
    },
    {
      "id": "K-02",
      "code": "K-02",
      "name": "Customer complaints",
      "value": "3",
      "unit": "",
      "target": "≤ 5 / mo",
      "process": "P-05",
      "trend": "down",
      "status": "good"
    },
    {
      "id": "K-03",
      "code": "K-03",
      "name": "Roast defect rate",
      "value": "1.8",
      "unit": "%",
      "target": "≤ 2%",
      "process": "P-02",
      "trend": "flat",
      "status": "watch"
    },
    {
      "id": "K-04",
      "code": "K-04",
      "name": "Right-first-time labelling",
      "value": "99.2",
      "unit": "%",
      "target": "≥ 99%",
      "process": "P-03",
      "trend": "up",
      "status": "good"
    },
    {
      "id": "K-05",
      "code": "K-05",
      "name": "Supplier acceptance rate",
      "value": "92",
      "unit": "%",
      "target": "≥ 90%",
      "process": "P-01",
      "trend": "up",
      "status": "good"
    },
    {
      "id": "K-06",
      "code": "K-06",
      "name": "Calibration on schedule",
      "value": "88",
      "unit": "%",
      "target": "100%",
      "process": "P-06",
      "trend": "down",
      "status": "bad"
    },
    {
      "id": "K-07",
      "code": "K-07",
      "name": "Complaint resolution time",
      "value": "4.2",
      "unit": " d",
      "target": "≤ 5 d",
      "process": "P-05",
      "trend": "flat",
      "status": "good"
    }
  ];

export const AUDITS: Audit[] = [
    {
      "id": "A-02",
      "code": "A-02",
      "name": "ISO 22000 surveillance",
      "type": "External · NQA",
      "date": "2026-08-04",
      "status": "scheduled",
      "findings": "Scheduled — preparation in progress"
    },
    {
      "id": "A-01",
      "code": "A-01",
      "name": "Internal audit — roasting & packaging",
      "type": "Internal",
      "date": "2026-05-12",
      "status": "closed",
      "findings": "2 minor findings, both actioned"
    },
    {
      "id": "A-03",
      "code": "A-03",
      "name": "Internal audit — supplier approval",
      "type": "Internal",
      "date": "2026-03-03",
      "status": "closed",
      "findings": "1 minor finding, closed"
    }
  ];

export const ACTIONS: CorrectiveAction[] = [
    {
      "id": "CA-201",
      "code": "CA-201",
      "name": "Calibration backlog on packaging scales",
      "risk": "R-06",
      "owner": "Jon Adeyemi",
      "due": "2026-07-01",
      "dueTone": "warn",
      "status": "open",
      "priority": "high",
      "source": "KPI K-06"
    },
    {
      "id": "CA-202",
      "code": "CA-202",
      "name": "Carrier SLA review overdue",
      "risk": "R-03",
      "owner": "Theo Marsh",
      "due": "2026-06-30",
      "dueTone": "warn",
      "status": "open",
      "priority": "medium",
      "source": "Evidence EV-1018"
    },
    {
      "id": "CA-203",
      "code": "CA-203",
      "name": "Allergen SOP cross-training gap",
      "risk": "R-01",
      "owner": "Mara Lindqvist",
      "due": "2026-07-15",
      "dueTone": "neutral",
      "status": "in-progress",
      "priority": "high",
      "source": "Audit A-01"
    },
    {
      "id": "CA-205",
      "code": "CA-205",
      "name": "Best-before date format inconsistency",
      "risk": "R-05",
      "owner": "Mara Lindqvist",
      "due": "2026-07-08",
      "dueTone": "neutral",
      "status": "open",
      "priority": "medium",
      "source": "Audit A-01"
    },
    {
      "id": "CA-204",
      "code": "CA-204",
      "name": "Repeated grind-size complaint",
      "risk": "R-07",
      "owner": "Priya Nair",
      "due": "2026-05-20",
      "dueTone": "neutral",
      "status": "closed",
      "priority": "low",
      "source": "Complaint"
    }
  ];

export const CLAUSES: Clause[] = [
    {
      "id": "CL-4",
      "code": "4",
      "title": "Context of the organization",
      "pct": 100,
      "status": "covered",
      "links": [
        [
          "process",
          "P-01"
        ],
        [
          "process",
          "P-04"
        ]
      ]
    },
    {
      "id": "CL-5",
      "code": "5",
      "title": "Leadership",
      "pct": 100,
      "status": "covered",
      "links": [
        [
          "document",
          "POL-01"
        ],
        [
          "document",
          "POL-02"
        ]
      ]
    },
    {
      "id": "CL-6",
      "code": "6",
      "title": "Planning — risks & opportunities",
      "pct": 78,
      "status": "partial",
      "links": [
        [
          "risk",
          "R-01"
        ],
        [
          "risk",
          "R-04"
        ],
        [
          "risk",
          "R-05"
        ]
      ]
    },
    {
      "id": "CL-7",
      "code": "7",
      "title": "Support — resources & documented info",
      "pct": 80,
      "status": "partial",
      "links": [
        [
          "document",
          "SOP-07"
        ],
        [
          "document",
          "SOP-14"
        ],
        [
          "control",
          "C-06"
        ]
      ]
    },
    {
      "id": "CL-8",
      "code": "8",
      "title": "Operation",
      "pct": 95,
      "status": "covered",
      "links": [
        [
          "process",
          "P-02"
        ],
        [
          "process",
          "P-03"
        ],
        [
          "control",
          "C-08"
        ]
      ]
    },
    {
      "id": "CL-9",
      "code": "9",
      "title": "Performance evaluation",
      "pct": 85,
      "status": "partial",
      "links": [
        [
          "kpi",
          "K-06"
        ],
        [
          "audit",
          "A-01"
        ]
      ]
    },
    {
      "id": "CL-10",
      "code": "10",
      "title": "Improvement",
      "pct": 70,
      "status": "partial",
      "links": [
        [
          "action",
          "CA-201"
        ],
        [
          "action",
          "CA-203"
        ]
      ]
    }
  ];

export const DATA: KeelData = {
  company: COMPANY,
  processes: PROCESSES,
  risks: RISKS,
  controls: CONTROLS,
  documents: DOCUMENTS,
  evidence: EVIDENCE,
  kpis: KPIS,
  audits: AUDITS,
  actions: ACTIONS,
  clauses: CLAUSES,
};

const COLLECTIONS = {
  process: PROCESSES,
  risk: RISKS,
  control: CONTROLS,
  document: DOCUMENTS,
  evidence: EVIDENCE,
  kpi: KPIS,
  audit: AUDITS,
  action: ACTIONS,
  clause: CLAUSES,
} as const;

/** Look up any entity by type and id. Returns undefined when absent. */
export function findEntity(type: EntityType, id: string) {
  return (COLLECTIONS[type] as { id: string }[]).find((e) => e.id === id);
}

/** Resolve a bare record code (e.g. "R-04") to its entity type. */
export function typeOfCode(code: string): EntityType | undefined {
  for (const [type, list] of Object.entries(COLLECTIONS)) {
    if ((list as { id: string }[]).some((e) => e.id === code)) return type as EntityType;
  }
  return undefined;
}

/** Process display name for a process id. */
export function processName(id: string): string {
  return PROCESSES.find((p) => p.id === id)?.name ?? id;
}
