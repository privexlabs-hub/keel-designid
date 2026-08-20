import type { Metadata } from 'next';
import { SectionShell } from '@/components/playbook/Shell';
import { CONTENT } from '@/components/playbook/content';
import { INTRO_SLUG, getSection } from '@/components/playbook/sections';

const section = getSection(INTRO_SLUG)!;

export const metadata: Metadata = {
  title: section.title,
  description: section.summary,
};

export default function PlaybookIntroPage() {
  const Content = CONTENT[INTRO_SLUG];
  return (
    <SectionShell section={section}>
      <Content />
    </SectionShell>
  );
}
