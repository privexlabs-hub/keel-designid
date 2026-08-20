import type { Metadata } from 'next';
import { TableOfContents } from '@/components/playbook/TableOfContents';

export const metadata: Metadata = {
  title: { default: 'Brand playbook', template: '%s · Keel brand playbook' },
  description:
    'The Keel brand identity playbook: the rules for the mark, the palette, the type, the voice, and the reasoning behind each.',
};

export default function PlaybookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas md:flex">
      <TableOfContents />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
