import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Editor } from '@/studio/Editor';
import { TEMPLATE_INDEX, templateMeta } from '@/templates/registry';

type Params = { templateId: string };

/** The catalogue is closed, so every editor route is prerendered. */
export function generateStaticParams(): Params[] {
  return TEMPLATE_INDEX.map((t) => ({ templateId: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { templateId } = await params;
  const meta = templateMeta(templateId);
  if (!meta) return {};
  return {
    title: `${meta.name} · Studio`,
    description: meta.description,
  };
}

export default async function StudioTemplatePage({ params }: { params: Promise<Params> }) {
  const { templateId } = await params;
  if (!templateMeta(templateId)) notFound();
  return <Editor templateId={templateId} />;
}
