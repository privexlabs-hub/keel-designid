import Link from 'next/link';
import { KeelLockup } from '@/brand/Logo';
import { Icon, type IconName } from '@/brand/icons';

const SURFACES: { href: string; title: string; body: string; icon: IconName }[] = [
  {
    href: '/dashboard/',
    title: 'Management system',
    body: 'The Keel product surface — conformance, registers, audits and corrective actions, responsive from phone to desktop.',
    icon: 'gauge',
  },
  {
    href: '/playbook/',
    title: 'Brand playbook',
    body: 'Logo, colour, type, voice and application. The rules, with the reasoning behind them.',
    icon: 'file',
  },
  {
    href: '/studio/',
    title: 'Template studio',
    body: 'Every social, ad, email and web format. Edit, restyle and export as PNG, SVG, PDF or a full kit.',
    icon: 'layers',
  },
  {
    href: '/foundation/',
    title: 'Foundation',
    body: 'The raw token layer: palette, colorways, icons and the mark, straight from the source.',
    icon: 'clipList',
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[980px] px-6 py-16 md:px-10 md:py-24">
      <KeelLockup size={32} />

      <h1
        className="mt-10 max-w-[18ch] font-display text-fg-1"
        style={{ fontSize: 'clamp(38px, 7vw, 64px)', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.08 }}
      >
        The system behind the system.
      </h1>
      <p className="mt-5 max-w-[58ch] text-fg-2" style={{ fontSize: 17, lineHeight: 1.6 }}>
        Keel keeps a management system honest. This is everything that makes Keel look and sound
        like itself — and the tools to put it to work.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SURFACES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-xl border p-6 transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
          >
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-action"
              style={{ background: 'var(--action-weak)', border: '1px solid var(--action-weak-bd)' }}
            >
              <Icon name={s.icon} size={18} />
            </span>
            <h2 className="mt-4 font-display text-fg-1" style={{ fontSize: 19, fontWeight: 600 }}>
              {s.title}
            </h2>
            <p className="mt-2 text-fg-2" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
              {s.body}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
