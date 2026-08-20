import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DashboardProvider } from '@/components/dashboard/DashboardContext';
import { DetailDrawer } from '@/components/dashboard/DetailDrawer';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';

export const metadata: Metadata = {
  title: 'Keel — management system',
  description:
    'The Keel product surface: conformance, registers, audits and corrective actions for Northbound Coffee Roasters.',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <div
        className="flex w-full overflow-hidden"
        style={{ height: '100dvh', background: 'var(--canvas)', color: 'var(--fg-1)', fontSize: 14 }}
      >
        <Sidebar />
        <div className="flex h-full min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto" style={{ background: 'var(--canvas)' }}>
            {children}
          </main>
        </div>
        <DetailDrawer />
      </div>
    </DashboardProvider>
  );
}
