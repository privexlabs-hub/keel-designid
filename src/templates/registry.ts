/**
 * The catalog index.
 *
 * Two halves, deliberately:
 *  - `TEMPLATE_INDEX` is eager metadata only. The gallery needs id, name,
 *    category, canvas and default colorway for ~130 entries; loading 130
 *    `compose` closures to draw a grid of cards would put the whole catalog in
 *    the studio's first-load bundle.
 *  - `loaders` is a dynamic `import()` per template, so a template's definition
 *    (and any copy it carries) arrives only when it is actually rendered.
 *
 * Adding a template means one entry in each map. Nothing else in the engine
 * needs to know it exists.
 */
import type { ColorwayId } from '@/brand/tokens';
import { CANVASES } from './canvases';
import type { CanvasId, CanvasSpec, TemplateCategory, TemplateDef } from './types';

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  canvas: CanvasSpec;
  /** First entry of the template's `colorways`. */
  defaultColorway: ColorwayId;
  slides?: number;
}

function meta(
  id: string,
  name: string,
  description: string,
  category: TemplateCategory,
  canvas: CanvasId,
  defaultColorway: ColorwayId,
  slides?: number,
): TemplateMeta {
  return { id, name, description, category, canvas: CANVASES[canvas], defaultColorway, slides };
}

export const TEMPLATE_INDEX: TemplateMeta[] = [
  meta(
    'square-big-stat',
    'Big stat',
    'A single conformance number on the gradient ground, with a shadowed card and the mark.',
    'square',
    'square1080',
    'radial',
  ),
  meta(
    'engagement-problem-solution',
    'Problem and solution',
    'Two dense columns: how audit prep goes without a system, and with one.',
    'engagement',
    'square1080',
    'canvas',
  ),
  meta(
    'carousel-hook',
    'Carousel — clause by clause',
    'Ten slides: a hook, eight repeater-driven points and a close, with a slide index throughout.',
    'carousel',
    'carousel1080',
    'ink',
    10,
  ),
  meta(
    'story-launch',
    'Story — launch',
    'Full-bleed image, gradient scrim, and an announcement inside the story safe area.',
    'story',
    'story1920',
    'teal',
  ),
  meta(
    'thumbnail-audit',
    'Thumbnail — clause number',
    'A cropped oversize numeral behind a two-line headline, with a bottom bar.',
    'thumbnail',
    'thumb1280',
    'inverted',
  ),
  meta(
    'x-header-banner',
    'X header',
    'Profile banner with the mark in an accent band, a positioning line and three figures.',
    'cover',
    'xheader1500',
    'mono',
  ),
];

/** Dynamic loaders — the studio bundle must not carry every template. */
export const loaders: Record<string, () => Promise<TemplateDef>> = {
  'square-big-stat': () => import('./defs/square-big-stat').then((m) => m.default),
  'engagement-problem-solution': () => import('./defs/engagement-problem-solution').then((m) => m.default),
  'carousel-hook': () => import('./defs/carousel-hook').then((m) => m.default),
  'story-launch': () => import('./defs/story-launch').then((m) => m.default),
  'thumbnail-audit': () => import('./defs/thumbnail-audit').then((m) => m.default),
  'x-header-banner': () => import('./defs/x-header-banner').then((m) => m.default),
};

export function loadTemplate(id: string): Promise<TemplateDef> {
  const load = loaders[id];
  if (!load) return Promise.reject(new Error(`Unknown template: ${id}`));
  return load();
}

export function templateMeta(id: string): TemplateMeta | undefined {
  return TEMPLATE_INDEX.find((t) => t.id === id);
}

export interface CategorySpec {
  id: TemplateCategory;
  label: string;
  /** What the category is for, one line, shown above the grid. */
  blurb: string;
  /** Canvas dimensions this category ships, as label strings. */
  dimensions: string[];
}

export const CATEGORIES: CategorySpec[] = [
  { id: 'square', label: 'Square posts', blurb: 'The default feed unit across Instagram, LinkedIn and Facebook.', dimensions: ['1080 x 1080'] },
  { id: 'engagement', label: 'Engagement', blurb: 'Comparisons, myths, checklists — posts written to be replied to.', dimensions: ['1080 x 1080', '1080 x 1350'] },
  { id: 'carousel', label: 'Carousels', blurb: 'Ten-slide swipe decks that carry one argument end to end.', dimensions: ['1080 x 1080 x 10'] },
  { id: 'story', label: 'Stories', blurb: 'Vertical frames with the platform chrome designed around.', dimensions: ['1080 x 1920'] },
  { id: 'portrait', label: 'Portrait posts', blurb: 'The tall feed crop, for copy that needs the extra depth.', dimensions: ['1080 x 1350'] },
  { id: 'thumbnail', label: 'Video thumbnails', blurb: 'Read at roughly a third of their export size.', dimensions: ['1280 x 720'] },
  { id: 'cover', label: 'Covers and banners', blurb: 'Profile headers and channel art, each with its own safe area.', dimensions: ['1500 x 500', '1128 x 191', '1640 x 624', '2560 x 1440', '3000 x 3000'] },
  { id: 'avatar', label: 'Avatars', blurb: 'Circular crops that still read at 32px.', dimensions: ['400 x 400'] },
  { id: 'ad', label: 'Ads', blurb: 'Paid placements where the claim has to survive a crop.', dimensions: ['1080 x 1080', '1200 x 630', '1920 x 1080'] },
  { id: 'email', label: 'Email', blurb: 'Retina header strips for campaign and lifecycle sends.', dimensions: ['1200 x 600'] },
  { id: 'web', label: 'Web and OG', blurb: 'Link previews and site heroes.', dimensions: ['1200 x 630', '1920 x 1080'] },
];

export function categorySpec(id: TemplateCategory): CategorySpec | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
