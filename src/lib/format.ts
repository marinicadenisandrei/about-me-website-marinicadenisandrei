import { site } from '@config/site';

const MONTH_YEAR = new Intl.DateTimeFormat(site.lang, { month: 'short', year: 'numeric' });
const LONG = new Intl.DateTimeFormat(site.lang, { day: 'numeric', month: 'long', year: 'numeric' });

export const formatMonthYear = (d: Date | null | undefined): string => (d ? MONTH_YEAR.format(d) : site.ui.experience.present);
export const formatLong = (d: Date): string => LONG.format(d);

/** "Sep 2025 – Present" */
export const formatRange = (start: Date, end: Date | null | undefined): string => `${formatMonthYear(start)} – ${formatMonthYear(end)}`;

/** "1 yr 3 mos" style duration. */
export function formatDuration(start: Date, end: Date | null | undefined): string {
  const e = end ?? new Date();
  let months = (e.getFullYear() - start.getFullYear()) * 12 + (e.getMonth() - start.getMonth()) + 1;
  if (months < 1) months = 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} yr${y > 1 ? 's' : ''}`);
  if (m) parts.push(`${m} mo${m > 1 ? 's' : ''}`);
  return parts.join(' ');
}

/** Pretty label for a technology slug when the registry has none. "github-actions" → "Github Actions". */
export const titleCaseSlug = (slug: string): string =>
  slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export const formatHours = (h: number): string => (Number.isInteger(h) ? `${h}` : h.toFixed(1)) + ' h';
