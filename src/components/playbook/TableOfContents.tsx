'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/brand/icons';
import { KeelLockup } from '@/brand/Logo';
import { SECTIONS, href } from './sections';

/**
 * The playbook's contents.
 *
 * One list, rendered twice: as a sticky rail from `md` up, and as a native
 * `<details>` disclosure below it. The disclosure is deliberately not a custom
 * widget — `<summary>` is focusable, toggles on Enter and Space, and reports
 * its own expanded state to assistive tech without any script.
 */
export function TableOfContents() {
  const pathname = usePathname() ?? '/playbook/';
  const current = SECTIONS.find((s) => href(s.slug) === pathname) ?? SECTIONS[0];

  const list = (
    <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
      {SECTIONS.map((section, i) => {
        const active = section.slug === current.slug;
        return (
          <li key={section.slug}>
            <Link
              href={href(section.slug)}
              aria-current={active ? 'page' : undefined}
              className="flex items-baseline gap-2.5 rounded-md px-2.5 py-2 no-underline"
              style={{
                minHeight: 40,
                background: active ? 'var(--action-weak)' : 'transparent',
                color: active ? 'var(--action)' : 'var(--fg-2)',
                fontWeight: active ? 600 : 400,
              }}
            >
              <span className="font-mono text-fg-3" style={{ fontSize: 10.5 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 13.5, lineHeight: 1.35 }}>{section.title}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      {/* Below md: a disclosure pinned under the masthead. */}
      <details
        className="border-b border-line bg-surface-1 md:hidden"
        style={{ position: 'sticky', top: 0, zIndex: 20 }}
      >
        <summary
          className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5"
          style={{ minHeight: 48 }}
        >
          <span className="flex min-w-0 flex-col">
            <span
              className="text-fg-3 uppercase"
              style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em' }}
            >
              Playbook
            </span>
            <span className="truncate text-fg-1" style={{ fontSize: 14, fontWeight: 600 }}>
              {current.title}
            </span>
          </span>
          <span className="shrink-0 text-action" aria-hidden>
            <Icon name="chevronRight" size={18} />
          </span>
        </summary>
        <nav aria-label="Playbook sections" className="px-3 pb-3">
          {list}
        </nav>
      </details>

      {/* md and up: the sticky rail. */}
      <nav
        aria-label="Playbook sections"
        className="hidden shrink-0 border-r border-line md:block"
        style={{
          width: 244,
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          maxHeight: '100dvh',
          overflowY: 'auto',
        }}
      >
        <div className="flex flex-col gap-5 px-4 py-7">
          <Link href="/playbook/" className="px-2.5 text-fg-1 no-underline">
            <KeelLockup size={22} subtitle="Brand playbook" />
          </Link>
          {list}
          <Link
            href="/foundation/"
            className="mx-2.5 flex items-center gap-2 border-t border-line pt-4 text-fg-3 no-underline"
            style={{ fontSize: 12.5, minHeight: 40 }}
          >
            <Icon name="layers" size={14} />
            Token reference
          </Link>
        </div>
      </nav>
    </>
  );
}
