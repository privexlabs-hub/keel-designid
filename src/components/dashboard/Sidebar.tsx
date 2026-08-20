'use client';

/**
 * The shell's left edge.
 *
 *   >= 1280   256px panel, exactly as the source draws it
 *   768-1279  64px icon rail, labels moved into hover/focus tooltips
 *   < 768     off-canvas drawer over a scrim, opened from the header hamburger
 */
import { useRef } from 'react';
import Link from 'next/link';
import { KeelLockup, KeelMark } from '@/brand/Logo';
import { Icon } from '@/brand/icons';
import { COMPANY } from '@/data/demo';
import { useDashboard } from './DashboardContext';
import { NavList } from './NavList';
import { useDialogBehaviour } from './useDialogBehaviour';

function WorkspaceBlock() {
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
      <div
        className="uppercase text-fg-3"
        style={{ fontSize: 10, letterSpacing: '0.09em', marginBottom: 7 }}
      >
        Workspace
      </div>
      <div className="text-fg-1" style={{ fontSize: 13.5, fontWeight: 550 }}>
        {COMPANY.name}
      </div>
      <div className="flex flex-wrap" style={{ gap: 6, marginTop: 9 }}>
        {COMPANY.standards.map((std) => (
          <span
            key={std}
            className="font-mono text-fg-2"
            style={{
              fontSize: 10,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '3px 7px',
            }}
          >
            {std}
          </span>
        ))}
      </div>
    </div>
  );
}

function UserChip({ compact }: { compact?: boolean }) {
  return (
    <div
      className="flex items-center"
      style={{
        padding: compact ? '12px 0' : '12px 16px',
        borderTop: '1px solid var(--border)',
        gap: 11,
        justifyContent: compact ? 'center' : undefined,
      }}
    >
      <span
        className="inline-flex flex-none items-center justify-center font-mono text-fg-2"
        style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--surface-3)', fontSize: 10.5 }}
      >
        AR
      </span>
      {compact ? (
        <span className="sr-only">Avery Rhodes, Quality manager</span>
      ) : (
        <span className="flex flex-col" style={{ lineHeight: 1.25 }}>
          <span className="text-fg-1" style={{ fontSize: 12.5 }}>
            Avery Rhodes
          </span>
          <span className="text-fg-3" style={{ fontSize: 10.5 }}>
            Quality manager
          </span>
        </span>
      )}
    </div>
  );
}

export function Sidebar() {
  const { lens, navOpen, setNavOpen } = useDashboard();
  const drawerRef = useRef<HTMLDivElement>(null);
  useDialogBehaviour(drawerRef, navOpen, () => setNavOpen(false));

  return (
    <>
      {/* --- 768px and up: panel or rail ---------------------------------- */}
      <aside
        className="hidden h-full w-16 flex-none flex-col md:flex xl:w-64"
        style={{ borderRight: '1px solid var(--border)', background: 'var(--surface-1)' }}
      >
        <div
          className="flex flex-none items-center justify-center xl:justify-start"
          style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', gap: 11, height: 66 }}
        >
          <Link
            href="/"
            className="flex items-center xl:pl-[18px]"
            style={{ textDecoration: 'none', color: 'var(--fg-1)' }}
          >
            <span className="text-action xl:hidden">
              <KeelMark size={24} />
            </span>
            {/* The mark is --action, the wordmark --fg-1, as in the source. */}
            <span className="hidden [&>span>svg]:text-action xl:inline-flex">
              <KeelLockup size={24} subtitle="Management system" />
            </span>
            <span className="sr-only">Keel home</span>
          </Link>
        </div>

        <div className="hidden xl:block">
          <WorkspaceBlock />
        </div>

        <span className="contents xl:hidden">
          <NavList lens={lens} rail />
        </span>
        <span className="hidden xl:contents">
          <NavList lens={lens} />
        </span>

        <div className="hidden xl:block">
          <UserChip />
        </div>
        <div className="xl:hidden">
          <UserChip compact />
        </div>
      </aside>

      {/* --- below 768px: off-canvas drawer ------------------------------- */}
      {navOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
            className="absolute inset-0 border-none"
            style={{ background: 'var(--scrim)', animation: 'kf-scrim 160ms var(--ease)' }}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            tabIndex={-1}
            className="absolute top-0 left-0 flex h-full w-64 max-w-[86vw] flex-col"
            style={{
              background: 'var(--surface-1)',
              borderRight: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div
              className="flex flex-none items-center justify-between"
              style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}
            >
              <span className="[&>span>svg]:text-action" style={{ color: 'var(--fg-1)' }}>
                <KeelLockup size={22} subtitle="Management system" />
              </span>
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                aria-label="Close navigation"
                className="inline-flex cursor-pointer items-center justify-center border-none bg-transparent text-fg-3 hover:text-fg-1"
                style={{ width: 44, height: 44 }}
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <WorkspaceBlock />
            <NavList lens={lens} onNavigate={() => setNavOpen(false)} />
            <UserChip />
          </div>
        </div>
      ) : null}
    </>
  );
}
