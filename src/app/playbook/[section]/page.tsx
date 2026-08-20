import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SectionShell } from '@/components/playbook/Shell';
import { CONTENT } from '@/components/playbook/content';
import { SECTION_SLUGS, getSection } from '@/components/playbook/sections';

type Params = { section: string };

/** Every section is a static route — the catalogue is closed. */
export function generateStaticParams(): Params[] {
  return SECTION_SLUGS.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { section: slug } = await params;
  const section = getSection(slug);
  if (!section) return {};
  return { title: section.title, description: section.summary };
}

export default async function PlaybookSectionPage({ params }: { params: Promise<Params> }) {
  const { section: slug } = await params;
  const section = getSection(slug);
  const Content = section ? CONTENT[slug] : undefined;
  if (!section || !Content) notFound();

  return (
    <SectionShell section={section}>
      <Content />
    </SectionShell>
  );
}
