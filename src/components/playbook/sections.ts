/**
 * The playbook's table of contents — the single list that drives the sidebar,
 * the static routes, and the next/previous links at the foot of every page.
 *
 * Order is the reading order. The first entry is the introduction and lives at
 * `/playbook/`; every other entry is a `[section]` route.
 */

export interface PlaybookSection {
  slug: string;
  /** Sidebar and heading label. Sentence case. */
  title: string;
  /** One line, shown under the heading and in the mobile picker. */
  summary: string;
}

export const SECTIONS: readonly PlaybookSection[] = [
  {
    slug: 'introduction',
    title: 'Introduction',
    summary: 'What Keel is, who it speaks to, and what this document is for.',
  },
  {
    slug: 'logo',
    title: 'Logo',
    summary: 'The mark, the three lockups, clear space, minimum sizes and colourways.',
  },
  {
    slug: 'logo-misuse',
    title: 'Logo misuse',
    summary: 'The seven failures we see most often, rendered rather than described.',
  },
  {
    slug: 'colour',
    title: 'Colour',
    summary: 'The palette by role, the seven colorways, and measured contrast.',
  },
  {
    slug: 'typography',
    title: 'Typography',
    summary: 'Three families, one ramp, and the rules that keep them apart.',
  },
  {
    slug: 'iconography',
    title: 'Iconography',
    summary: 'Seventeen icons, one construction spec, and when not to use one.',
  },
  {
    slug: 'voice-and-tone',
    title: 'Voice and tone',
    summary: 'How Keel writes when the subject is an audit finding.',
  },
  {
    slug: 'layout',
    title: 'Layout and composition',
    summary: 'Spacing, radii, borders, elevation and density.',
  },
  {
    slug: 'motion',
    title: 'Motion',
    summary: 'Two curves, three keyframes, and a short list of things that move.',
  },
  {
    slug: 'application',
    title: 'Application',
    summary: 'The system assembled: product surfaces, social, documents, avatars.',
  },
  {
    slug: 'downloads',
    title: 'Downloads',
    summary: 'Every deliverable in the repository, with the path to use.',
  },
] as const;

/** The introduction, which is served at `/playbook/` rather than a `[section]` route. */
export const INTRO_SLUG = SECTIONS[0].slug;

/** Slugs that become static `[section]` routes. */
export const SECTION_SLUGS = SECTIONS.slice(1).map((s) => s.slug);

export function href(slug: string): string {
  return slug === INTRO_SLUG ? '/playbook/' : `/playbook/${slug}/`;
}

export function getSection(slug: string): PlaybookSection | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}

export interface Neighbours {
  prev?: PlaybookSection;
  next?: PlaybookSection;
}

export function neighbours(slug: string): Neighbours {
  const i = SECTIONS.findIndex((s) => s.slug === slug);
  if (i < 0) return {};
  return { prev: SECTIONS[i - 1], next: SECTIONS[i + 1] };
}
