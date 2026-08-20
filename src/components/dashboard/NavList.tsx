'use client';

/**
 * The lens-ordered nav. One list, three presentations: full (>= 1280 and in
 * the mobile drawer), icon rail (768-1279), and the drawer's full width.
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/brand/icons';
import { navFor, type Lens } from '@/lib/dashboard/lens';

export function NavList({
  lens,
  rail,
  onNavigate,
}: {
  lens: Lens;
  /** Icon-only presentation with tooltips. */
  rail?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const entries = navFor(lens);

  return (
    <nav
      aria-label="Management system"
      className="flex-1 overflow-y-auto"
      style={{ padding: rail ? '8px 8px 16px' : '8px 10px 16px' }}
    >
      <ul className="list-none" style={{ margin: 0, padding: 0 }}>
        {entries.map((entry, i) => {
          if (entry.kind === 'section') {
            return (
              <li key={`s-${entry.label}-${i}`}>
                {rail ? (
                  <span
                    aria-hidden
                    className="mx-auto block"
                    style={{ height: 1, width: 24, background: 'var(--border)', margin: '14px auto 8px' }}
                  />
                ) : (
                  <div
                    className="uppercase text-fg-3"
                    style={{
                      padding: '16px 10px 7px',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {entry.label}
                  </div>
                )}
              </li>
            );
          }

          const active = pathname === entry.href;
          return (
            <li key={entry.href + entry.label} className={rail ? 'group relative' : undefined}>
              <Link
                href={entry.href}
                aria-current={active ? 'page' : undefined}
                aria-label={rail ? entry.label : undefined}
                title={rail ? entry.label : undefined}
                onClick={onNavigate}
                className={`flex items-center rounded-md transition-colors hover:bg-surface-2 ${
                  rail ? 'justify-center' : ''
                }`}
                style={{
                  gap: 11,
                  padding: rail ? '10px 0' : '8px 11px',
                  margin: '1px 0',
                  minHeight: 44,
                  textDecoration: 'none',
                  fontSize: 13.5,
                  background: active ? 'var(--action-weak)' : 'transparent',
                  color: active ? 'var(--action)' : 'var(--fg-2)',
                  fontWeight: active ? 600 : 500,
                  boxShadow: active ? 'inset 3px 0 0 var(--action)' : 'none',
                }}
              >
                <span
                  className="inline-flex flex-none"
                  style={{ width: 18, height: 18, color: active ? 'var(--action)' : 'var(--fg-3)' }}
                >
                  <Icon name={entry.icon} size={18} />
                </span>
                {rail ? null : (
                  <>
                    <span className="flex-1 truncate">{entry.label}</span>
                    {entry.count !== undefined ? (
                      <span className="font-mono text-fg-3" style={{ fontSize: 11 }}>
                        {entry.count}
                      </span>
                    ) : null}
                  </>
                )}
              </Link>
              {rail ? (
                <span
                  role="tooltip"
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-full z-30 hidden -translate-y-1/2 whitespace-nowrap rounded-md opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:block xl:hidden"
                  style={{
                    marginLeft: 8,
                    padding: '5px 9px',
                    fontSize: 12,
                    background: 'var(--fg-1)',
                    color: 'var(--surface-1)',
                  }}
                >
                  {entry.label}
                  {entry.count !== undefined ? (
                    <span className="font-mono" style={{ marginLeft: 8, opacity: 0.7 }}>
                      {entry.count}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
