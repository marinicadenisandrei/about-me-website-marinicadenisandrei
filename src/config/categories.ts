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
  /** Hue (0–360) for the glass tint. */
  hue: number;
  description: string;
}

export const CATEGORY_META: Record<ProjectCategory | 'learning' | 'industry', CategoryMeta> = {
  employment: { label: 'Industry', hue: 215, description: 'Work delivered for employers' },
  industry: { label: 'Industry', hue: 215, description: 'DevOps, cloud and platform engineering' },
  research: { label: 'Research', hue: 268, description: 'Funded research projects and the PhD' },
  academic: { label: 'Academia', hue: 268, description: 'Teaching and university projects' },
  freelance: { label: 'Freelance', hue: 174, description: 'Client work through my PFA' },
  personal: { label: 'Personal', hue: 330, description: 'Side projects and experiments' },
  learning: { label: 'Learning', hue: 38, description: 'Courses and certifications' },
};
