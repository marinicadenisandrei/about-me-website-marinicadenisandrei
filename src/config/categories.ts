/**
 * Project / context categories and their glass tint.
 *
 * `hue` feeds `--tint-h` in src/styles/glass.css, so every card that belongs to a
 * category is tinted automatically. Change a hue here and it changes everywhere.
 */
export const PROJECT_CATEGORIES = ['research', 'freelance', 'employment', 'academic', 'personal'] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export interface CategoryMeta {
  label: string;
  /** Hue (0-360) for the glass tint. */
  hue: number;
  description: string;
}

export const CATEGORY_META: Record<ProjectCategory | 'learning' | 'industry', CategoryMeta> = {
  employment: { label: 'Industry', hue: 215, description: 'Work delivered for employers' },
  industry: { label: 'Industry', hue: 215, description: 'DevOps, cloud and platform engineering' },
  research: { label: 'R&D Contract', hue: 268, description: 'R&D project contracts with POLITEHNICA Bucharest, awarded through open competition, and the PhD' },
  academic: { label: 'Academia', hue: 268, description: 'Teaching and university projects' },
  freelance: { label: 'B2B', hue: 174, description: 'B2B client work through my company' },
  personal: { label: 'Personal', hue: 330, description: 'Side projects and experiments' },
  learning: { label: 'Learning', hue: 38, description: 'Courses and certifications' },
};

/** Industry domain of a project, used as a filter on /projects. */
export const PROJECT_DOMAINS = ['energy', 'education', 'health', 'ai', 'space', 'public-sector'] as const;
export type ProjectDomain = (typeof PROJECT_DOMAINS)[number];
export const DOMAIN_LABEL: Record<ProjectDomain, string> = {
  energy: 'Energy', education: 'Education', health: 'Health', ai: 'AI', space: 'Space', 'public-sector': 'Public sector',
};
