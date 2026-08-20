import { notFound } from 'next/navigation';
import { ActionsView } from '@/components/dashboard/ActionsView';
import { AuditsView } from '@/components/dashboard/AuditsView';
import { ConformanceView } from '@/components/dashboard/ConformanceView';
import { MapView } from '@/components/dashboard/MapView';

/**
 * The four single-instance views. Registers live under /dashboard/registers/
 * because they carry a second segment (the register type).
 */
const VIEWS = ['map', 'audits', 'actions', 'conformance'] as const;
type View = (typeof VIEWS)[number];

export function generateStaticParams() {
  return VIEWS.map((view) => ({ view }));
}

export const dynamicParams = false;

export default async function DashboardViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!(VIEWS as readonly string[]).includes(view)) notFound();

  switch (view as View) {
    case 'map':
      return <MapView />;
    case 'audits':
      return <AuditsView />;
    case 'actions':
      return <ActionsView />;
    case 'conformance':
      return <ConformanceView />;
  }
}
