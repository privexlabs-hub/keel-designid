'use client';

/**
 * The top bar.
 *
 *   >= 1024   title block, search box, lens toggle — as the source draws it
 *   768-1023  condensed: the search box collapses to its icon
 *   < 768     56px sticky bar: hamburger, truncating title, overflow menu
 *             carrying the lens switch and search
 */
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from '@/brand/icons';
import { titleFor } from '@/lib/dashboard/titles';
import { useDashboard } from './DashboardContext';
import { LensMenuItems, LensToggle } from './LensToggle';

function SearchBox() {
  return (
    <div
      className="hidden items-center text-fg-3 lg:flex"
      style={{
        gap: 9,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '8px 13px',
        width: 190,
      }}
    >
      <Icon name="search" size={16} />
      <span style={{ fontSize: 12.5 }}>Search the system</span>
    </div>
  );
}

function OverflowMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="View options"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center justify-center border-none bg-transparent text-fg-2"
        style={{ width: 44, height: 44, borderRadius: 8 }}
      >
        <Icon name="layers" size={18} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40"
          style={{
            top: 46,
            width: 208,
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            animation: 'kf-fade 140ms var(--ease-out)',
          }}
        >
          <div
            className="uppercase text-fg-3"
            style={{
              fontSize: 9,
              letterSpacing: '0.11em',
              padding: '12px 14px 4px',
            }}
          >
            Lens
          </div>
          <LensMenuItems onPick={() => setOpen(false)} />
          <div style={{ borderTop: '1px solid var(--border-faint)', padding: 6 }}>
            <span
              className="flex items-center text-fg-3"
              style={{ gap: 9, padding: '10px 12px', fontSize: 13 }}
            >
              <Icon name="search" size={16} />
              Search the system
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { lens, setNavOpen } = useDashboard();
  const { title, sub, chain } = titleFor(pathname, lens);

  return (
    <header
      className="sticky top-0 z-30 flex h-14 flex-none items-center md:h-[58px]"
      style={{
        gap: 12,
        padding: '0 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-1)',
      }}
    >
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setNavOpen(true)}
        className="inline-flex cursor-pointer items-center justify-center border-none bg-transparent text-fg-2 md:hidden"
        style={{ width: 44, height: 44, marginLeft: -10, borderRadius: 8 }}
      >
        {/* The icon set has no hamburger; three rules drawn inline, same
            stroke language as the rest of the set. */}
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex min-w-0 flex-col md:pl-2 lg:pl-[10px]" style={{ lineHeight: 1.2 }}>
        <h1
          className="truncate font-display text-fg-1"
          style={{ fontSize: 17, fontWeight: 600, margin: 0 }}
        >
          <span className="md:hidden">{title}</span>
          <span className="hidden md:inline" style={{ fontSize: 19 }}>
            {title}
          </span>
        </h1>
        {chain ? (
          <span className="hidden items-center truncate text-fg-3 md:flex" style={{ fontSize: 11.5, gap: 4 }}>
            {chain.map((c, i) => (
              <span key={c} className="inline-flex items-center" style={{ gap: 4 }}>
                {i > 0 ? <Icon name="chevronRight" size={11} /> : null}
                {c}
              </span>
            ))}
          </span>
        ) : (
          <span className="truncate text-fg-3" style={{ fontSize: 11.5 }}>
            {sub}
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="hidden md:flex md:items-center" style={{ gap: 18 }}>
        <LensToggle />
        <SearchBox />
        {/* Below 1280 the sidebar is a rail, so the identity moves up here. */}
        <span
          className="inline-flex flex-none items-center justify-center font-mono text-fg-2 xl:hidden"
          style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--surface-3)', fontSize: 10.5 }}
          title="Avery Rhodes · Quality manager"
        >
          AR
          <span className="sr-only">Avery Rhodes, Quality manager</span>
        </span>
      </div>

      <OverflowMenu />
    </header>
  );
}
