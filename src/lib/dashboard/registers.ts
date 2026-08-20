/**
 * The six registers.
 *
 * The source keeps register shape in `buildRegister`'s branch chain; here each
 * branch becomes a typed descriptor so `<RegisterView>` and the route's
 * `generateStaticParams` read from one place.
 */
export const REGISTER_TYPES = ['process', 'risk', 'control', 'document', 'evidence', 'kpi'] as const;
export type RegisterType = (typeof REGISTER_TYPES)[number];

export function isRegisterType(v: string): v is RegisterType {
  return (REGISTER_TYPES as readonly string[]).includes(v);
}

export function registerHref(type: RegisterType): string {
  return `/dashboard/registers/${type}/`;
}

/** Title + subtitle shown in the top bar, verbatim from `buildRegister`. */
export const REGISTER_META: Record<RegisterType, { title: string; sub: string }> = {
  process: { title: 'Processes', sub: 'How the business operates' },
  risk: { title: 'Risk register', sub: '8 risks across 6 processes' },
  control: { title: 'Controls', sub: 'Mitigating the risk register' },
  document: { title: 'Documents', sub: 'Controlled documents' },
  evidence: { title: 'Evidence', sub: 'Records proving controls ran' },
  kpi: { title: 'KPIs', sub: 'Measures of performance' },
};
