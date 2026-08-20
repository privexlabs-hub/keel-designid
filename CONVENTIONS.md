# Keel Brand ID — build conventions

Read this before touching anything. These rules exist because each one is a
bug that already bit, or would silently corrupt exported images.

## Stack
Next.js 16.3.1 (App Router, `output: 'export'`, `trailingSlash: true`),
React 19.2.8, TypeScript (strict), Tailwind v4 (CSS-first `@theme`).
Frontend only — no server code, no API routes, no server actions.

## Source of truth
The brand comes from `Keel.dc.html` (an imported design file at
`../management-systems-and-business-growth/project/`). Never invent brand values.

| What | Where |
|---|---|
| CSS tokens (verbatim `:root`) | `src/styles/tokens.css` |
| Colorway slots | `src/styles/colorways.css` |
| Typed palette / colorways | `src/brand/tokens.ts` |
| Logo + lockups | `src/brand/Logo.tsx` |
| 17 icons | `src/brand/icons.tsx` |
| Demo dataset (ported `D`) | `src/data/demo.ts` |

## Hard rules

1. **No hex literals in components.** Use Tailwind token utilities
   (`bg-surface-1`, `text-fg-2`, `border-line`, `text-action`) or
   `var(--token)`. Inside `src/templates/**` use ONLY the `t-*` slot utilities
   (`bg-t-bg`, `text-t-fg`, `text-t-fg-muted`, `bg-t-accent`, `border-t-line`)
   — never `--action` or `--surface-*` directly, or colorways cannot remap it.

2. **No `→`, `←`, `↑`, `↓`, `✓` as text characters — anywhere.** The bundled
   font subsets have no glyphs for them (verified against the font cmaps, not
   just the declared unicode-range). A missing glyph silently falls back to a
   system font and rasterises wrong into every export. Use the `chevronRight`,
   `arrowUp`, `arrowDown`, `clipCheck` icons. Enforced by `npm run lint:glyphs`.
   `·`, `—`, `–`, `×`, `•`, curly quotes are all fine.

3. **Never add `next/font`.** Fonts are self-hosted via `src/styles/fonts.css`
   with stable, unhashed family names, because the SVG and PDF renderers do not
   share the DOM's font context. Adding it breaks export font resolution.

4. **No Tailwind opacity modifiers on colours** (`bg-action/20`). They compile to
   `color-mix()`/`oklab`, which DOM-snapshot export libraries mangle. The token
   set ships explicit `-weak` values (`--action-weak`, `--brand-weak`, …) for
   exactly this.

5. **No `backdrop-filter` inside `src/templates/**`.** It does not survive
   rasterisation. It is fine in the dashboard, which is never exported.

6. **`data-colorway` goes on the exported stage node itself**, never an
   ancestor — export clones the subtree.

## Responsive
Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Above `xl` the dashboard
is pixel-identical to the source. Mobile: 44px minimum touch targets, `dvh` not
`vh`, honour `prefers-reduced-motion` (already handled globally).

## Voice
Keel is a management-system product for SMBs holding ISO certifications.
Plain, precise, quietly confident. No exclamation marks, no hype, no emoji.
Sentence case for headings. The demo workspace is Northbound Coffee Roasters.

## Commands
```
npm run dev            # dev server
npm run build          # runs prebuild: verify-assets + lint:glyphs
npm run typecheck      # tsc --noEmit
npm run lint:glyphs
npm run verify:assets
npm run assets         # regenerate fonts, logos, PNGs, favicons, embedded fonts
```
Always finish with `npm run typecheck && npm run lint:glyphs` clean.
