'use client';

/**
 * Shell state that must outlive a route change: the lens, the detail drawer,
 * and the mobile nav drawer. The layout holds the provider, so navigating
 * between views keeps the chosen lens.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { EntityType } from '@/data/demo';
import type { Lens } from '@/lib/dashboard/lens';

export interface DetailRef {
  type: EntityType;
  id: string;
}

interface DashboardState {
  lens: Lens;
  setLens: (lens: Lens) => void;
  detail: DetailRef | null;
  openDetail: (type: EntityType, id: string) => void;
  closeDetail: () => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
}

const Ctx = createContext<DashboardState | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // The lens is deliberately not persisted. Every route is prerendered as a
  // static file, so a stored lens would make the served HTML and the first
  // client render disagree; it starts at 'process', as the source does, and
  // survives client-side navigation because this provider sits in the layout.
  const [lens, setLens] = useState<Lens>('process');
  const [detail, setDetail] = useState<DetailRef | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  const openDetail = useCallback((type: EntityType, id: string) => {
    setNavOpen(false);
    setDetail({ type, id });
  }, []);

  const closeDetail = useCallback(() => setDetail(null), []);

  const value = useMemo<DashboardState>(
    () => ({ lens, setLens, detail, openDetail, closeDetail, navOpen, setNavOpen }),
    [lens, setLens, detail, openDetail, closeDetail, navOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboard(): DashboardState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDashboard must be used inside <DashboardProvider>');
  return ctx;
}
