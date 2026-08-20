import { notFound } from 'next/navigation';
import { RegisterView } from '@/components/dashboard/RegisterView';
import { REGISTER_TYPES, isRegisterType } from '@/lib/dashboard/registers';

export function generateStaticParams() {
  return REGISTER_TYPES.map((type) => ({ type }));
}

export const dynamicParams = false;

export default async function RegisterPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isRegisterType(type)) notFound();
  return <RegisterView type={type} />;
}
