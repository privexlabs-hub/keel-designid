import type { Metadata } from 'next';
import { ExportConsole } from '@/studio/ExportConsole';

export const metadata: Metadata = {
  title: 'Export a kit',
  description: 'Export a design, a deck, a category or the whole catalogue as one archive.',
};

export default function StudioExportPage() {
  return <ExportConsole />;
}
