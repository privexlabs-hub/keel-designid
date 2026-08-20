/**
 * Template studio — catalog.
 *
 * A gallery only. Each card links to `/studio/<id>/`, which does NOT exist yet:
 * the per-template editor is a later phase, and the route will be generated
 * from `TEMPLATE_INDEX` with `generateStaticParams` when it lands. Until then
 * the links resolve to a 404, deliberately, rather than being disabled — the
 * URL shape is part of the contract the editor phase builds against.
 *
 * This phase ships six pilot templates, chosen for rendering risk rather than
 * canvas variety: a gradient ground with a shadowed card, dense two-column
 * copy with a repeater, a ten-slide carousel driven by one list, a full-bleed
 * image fill with a gradient scrim, a deliberately cropped thumbnail, and a
 * shallow banner at the small end of the type ramp.
 */
import type { Metadata } from 'next';
import { KeelLockup } from '@/brand/Logo';
import { CATEGORIES, TEMPLATE_INDEX } from '@/templates/registry';
import { TemplateCard } from '@/templates/render/TemplateCard';

export const metadata: Metadata = {
  title: 'Template studio · Keel',
  description: 'Every social, ad, email and web format for Keel, rendered live at export dimensions.',
};

export default function StudioPage() {
  const used = CATEGORIES.filter((c) => TEMPLATE_INDEX.some((t) => t.category === c.id));
  const carousel = TEMPLATE_INDEX.find((t) => t.id === 'carousel-hook');

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-12 md:px-10 md:py-16">
      <KeelLockup size={30} />

      <h1
        className="mt-8 max-w-[20ch] font-display text-fg-1"
        style={{ fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.1 }}
      >
        Template studio
      </h1>
      <p className="mt-3 max-w-[62ch] text-[15px] leading-[1.6] text-fg-2">
        Six pilot templates on the shared engine. Every card below is a live render at exact export
        dimensions, scaled down by a wrapper — the stage itself is never transformed, so the preview
        and the exported file are the same composition.
      </p>

      {used.map((category) => {
        const items = TEMPLATE_INDEX.filter((t) => t.category === category.id);
        return (
          <section key={category.id} className="mt-14">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line pb-3">
              <h2 className="font-display text-[22px] font-semibold text-fg-1">{category.label}</h2>
              <span className="font-mono text-[11px] text-fg-3">{category.dimensions.join(' · ')}</span>
            </div>
            <p className="mt-2 max-w-[62ch] text-[13px] leading-[1.5] text-fg-2">{category.blurb}</p>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((meta) => (
                <TemplateCard key={meta.id} meta={meta} slide={meta.slides ? 1 : undefined} />
              ))}
              {category.id === 'carousel' && carousel ? (
                // The closing slide, in a second colorway: the carousel is the
                // one template whose composition changes with ctx.slide.
                <TemplateCard key="carousel-hook-10" meta={carousel} slide={10} colorway="cream" />
              ) : null}
            </div>
          </section>
        );
      })}

      <p className="mt-16 max-w-[62ch] text-[13px] leading-[1.6] text-fg-3">
        Cards link to /studio/&lt;id&gt;/. That route is not built yet — the editor is a later phase.
      </p>
    </main>
  );
}
