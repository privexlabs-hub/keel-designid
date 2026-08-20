import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/brand/icons';
import { Lede } from './ui';
import { SECTIONS, href, neighbours, type PlaybookSection } from './sections';

/**
 * The frame every playbook page shares: numbered masthead, the content, and
 * the pager. Keeping it here means a section file is nothing but its content.
 */
export function SectionShell({
  section,
  children,
}: {
  section: PlaybookSection;
  children: ReactNode;
}) {
  const index = SECTIONS.findIndex((s) => s.slug === section.slug);
  const { prev, next } = neighbours(section.slug);

  return (
    <article className="mx-auto flex max-w-[860px] flex-col gap-12 px-5 py-10 sm:px-8 md:px-12 md:py-16">
      <header className="flex flex-col gap-3.5 border-b border-line pb-8">
        <span
          className="font-mono text-fg-3"
          style={{ fontSize: 11, letterSpacing: '0.06em' }}
        >
          Section {String(index + 1).padStart(2, '0')} of {String(SECTIONS.length).padStart(2, '0')}
        </span>
        <h1
          className="m-0 font-display text-fg-1"
          style={{ fontSize: 'clamp(32px, 6vw, 44px)', fontWeight: 600, letterSpacing: '-0.012em', lineHeight: 1.08 }}
        >
          {section.title}
        </h1>
        <Lede>{section.summary}</Lede>
      </header>

      <div className="flex flex-col gap-14">{children}</div>

      <nav
        aria-label="Section navigation"
        className="grid grid-cols-1 gap-3 border-t border-line pt-8 sm:grid-cols-2"
      >
        {prev ? <Pager section={prev} direction="previous" /> : <span className="hidden sm:block" />}
        {next ? <Pager section={next} direction="next" /> : null}
      </nav>
    </article>
  );
}

function Pager({ section, direction }: { section: PlaybookSection; direction: 'previous' | 'next' }) {
  const isNext = direction === 'next';
  return (
    <Link
      href={href(section.slug)}
      rel={isNext ? 'next' : 'prev'}
      className="flex items-center gap-3 rounded-xl border border-line bg-surface-1 px-4 py-3.5 no-underline"
      style={{ minHeight: 60, justifyContent: isNext ? 'flex-end' : 'flex-start' }}
    >
      {isNext ? null : (
        <span className="shrink-0 text-fg-3" style={{ transform: 'rotate(180deg)' }} aria-hidden>
          <Icon name="chevronRight" size={16} />
        </span>
      )}
      <span className="flex flex-col" style={{ textAlign: isNext ? 'right' : 'left' }}>
        <span
          className="text-fg-3 uppercase"
          style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em' }}
        >
          {direction}
        </span>
        <span className="text-fg-1" style={{ fontSize: 14, fontWeight: 600 }}>
          {section.title}
        </span>
      </span>
      {isNext ? (
        <span className="shrink-0 text-action" aria-hidden>
          <Icon name="chevronRight" size={16} />
        </span>
      ) : null}
    </Link>
  );
}
