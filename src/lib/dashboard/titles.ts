/** Top-bar title + subtitle per route — a port of `renderVals().titles`. */
import { COMPANY } from '@/data/demo';
import { actionsTitle, type Lens } from './lens';
import { REGISTER_META, isRegisterType } from './registers';

export interface PageTitle {
  title: string;
  sub: string;
  /**
   * The map's subtitle is a chain of six labels joined by arrows in the source.
   * Arrow glyphs are not in the bundled subsets (CONVENTIONS rule 2), so the
   * header renders these with chevron icons instead of a plain string.
   */
  chain?: string[];
}

export const MAP_CHAIN = ['Process', 'Risk', 'Control', 'Document', 'Evidence', 'KPI'];

export function titleFor(pathname: string, lens: Lens): PageTitle {
  const segments = pathname.replace(/^\/dashboard\/?/, '').replace(/\/$/, '').split('/').filter(Boolean);

  if (segments.length === 0) return { title: 'Overview', sub: COMPANY.name };

  const [head, tail] = segments;

  if (head === 'map') return { title: 'System map', sub: MAP_CHAIN.join(' · '), chain: MAP_CHAIN };
  if (head === 'audits') return { title: 'Audits', sub: 'Internal and external audit history' };
  if (head === 'actions') return { title: actionsTitle(lens), sub: 'Open corrective and preventive actions' };
  if (head === 'conformance') return { title: 'Conformance', sub: 'ISO 9001:2015 clause coverage' };
  if (head === 'registers') {
    const type = tail && isRegisterType(tail) ? tail : 'risk';
    return REGISTER_META[type];
  }

  return { title: 'Overview', sub: COMPANY.name };
}
