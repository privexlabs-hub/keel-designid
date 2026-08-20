import { RegisterView } from '@/components/dashboard/RegisterView';

/** The bare /dashboard/registers/ entry point shows the risk register, which is
 *  the source's default `registerType`. */
export default function RegistersIndexPage() {
  return <RegisterView type="risk" />;
}
