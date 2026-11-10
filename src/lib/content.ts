/**
 * Typed helpers over the content collections. Pages compose these instead of
 * calling getCollection() directly, so sorting/filtering rules live in one place.
 */
import { getCollection, getEntry, type CollectionEntry, type CollectionKey } from 'astro:content';
import { site } from '@config/site';
import { canonicalTech, parentTech, STACK_PAGE_MIN } from '@config/stack';

type Entry<C extends CollectionKey> = CollectionEntry<C>;

const byOrderThenDate = <T extends { data: { order: number; startDate?: Date | null; period?: { start: Date } } }>(a: T, b: T) => {
  if (a.data.order !== b.data.order) return a.data.order - b.data.order;
  const da = a.data.startDate ?? a.data.period?.start ?? new Date(0);
  const db = b.data.startDate ?? b.data.period?.start ?? new Date(0);
  return db.getTime() - da.getTime();
};

/* ───────────── experience ───────────── */
export async function getExperience(): Promise<Entry<'experience'>[]> {
  return (await getCollection('experience')).sort(byOrderThenDate);
}

/* ───────────── projects ───────────── */
export async function getProjects(): Promise<Entry<'projects'>[]> {
  return (await getCollection('projects', (p) => !p.data.hidden)).sort(byOrderThenDate);
}
export const getFeaturedProjects = async () => (await getProjects()).filter((p) => p.data.featured);
export const projectSlug = (p: Entry<'projects'>) => p.data.slug ?? p.id;

/** Resolved client label honouring `confidential` and `publicConsent`. */
export async function projectClientLabel(p: Entry<'projects'>): Promise<string | null> {
  const client = p.data.client ? await getEntry(p.data.client) : null;
  if (p.data.confidential || (client && !client.data.publicConsent)) {
    const industry = p.data.industry ?? client?.data.industry;
    return industry ? `${site.ui.projects.confidentialClient} - ${industry}` : site.ui.projects.confidentialClient;
  }
  return client?.data.name ?? p.data.organization ?? null;
}

/* ───────────── clients ───────────── */
export const getPublicClients = async () => (await getCollection('clients')).filter((c) => c.data.publicConsent);
export const getTestimonials = async () =>
  (await getPublicClients()).filter((c) => c.data.testimonial).map((c) => ({ client: c, ...c.data.testimonial! }));

/* ───────────── research / teaching / publications ───────────── */
export const getResearch = async () => (await getCollection('research')).sort(byOrderThenDate);
export const getTeaching = async () => (await getCollection('teaching')).sort(byOrderThenDate);
export const getPublications = async () =>
  (await getCollection('publications')).sort((a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title));

/* ───────────── services / faq ───────────── */
export const getServices = async () => (await getCollection('services')).sort((a, b) => a.data.order - b.data.order);
export const getEngagementModels = async () => (await getServices()).filter((s) => s.data.engagement);
export const getFaq = async () => (await getCollection('faq')).sort((a, b) => a.data.order - b.data.order);

/* ───────────── courses / certifications ───────────── */
export async function getCourses(opts: { includeArchived?: boolean } = {}) {
  const all = await getCollection('courses');
  const includeArchived = opts.includeArchived ?? site.features.showArchivedCourses;
  return all
    .filter((c) => includeArchived || !c.data.archived)
    .sort((a, b) => (b.data.certificate?.date?.getTime() ?? 0) - (a.data.certificate?.date?.getTime() ?? 0) || b.data.progress - a.data.progress);
}
export const getCertifications = async () =>
  (await getCollection('certifications')).sort(
    (a, b) => a.data.order - b.data.order || (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );

/**
 * Counting rule for "certifications" (hero metric + learning stats):
 *   1. every entry in the `certifications` collection whose kind is NOT "skill-assessment"
 *      (LinkedIn skill badges are listed on /learning but are not certifications), plus
 *   2. every course (any status, archived included) that has a certificate, unless that
 *      certificate's URL already appears as a `credentialUrl` in the `certifications` collection
 *      (so a Udemy certificate recorded in both places is counted once).
 */
export async function countCertifications() {
  const certs = (await getCollection('certifications')).filter((c) => c.data.kind !== 'skill-assessment');
  const known = new Set(certs.map((c) => c.data.credentialUrl).filter(Boolean));
  const courseCerts = (await getCollection('courses')).filter((c) => c.data.certificate && !known.has(c.data.certificate.url ?? ''));
  return { certifications: certs.length, courseCertificates: courseCerts.length, total: certs.length + courseCerts.length };
}

/** Learning stats, computed from content, never hardcoded. Archived courses count towards hours/certificates. */
export async function getLearningStats() {
  const all = await getCollection('courses');
  const certCount = await countCertifications();
  const byCategory = new Map<string, number>();
  let hours = 0;
  let completed = 0;
  for (const c of all) {
    hours += c.data.hours;
    if (c.data.completed) completed++;
    byCategory.set(c.data.category, (byCategory.get(c.data.category) ?? 0) + 1);
  }
  const topCategories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  return {
    totalCourses: all.length,
    hours: Math.round(hours),
    completed,
    /** see countCertifications() for the rule */
    certificates: certCount.total,
    courseCertificates: certCount.courseCertificates,
    certifications: certCount.certifications,
    topCategories,
  };
}

/* ───────────── hero metrics ───────────── */
export async function getHeroMetrics() {
  const exp = await getExperience();
  const first = exp.reduce<Date | null>((min, e) => (!min || e.data.startDate < min ? e.data.startDate : min), null);
  const years = first ? Math.max(1, Math.floor((Date.now() - first.getTime()) / (365.25 * 24 * 3600 * 1000))) : 0;
  const projects = (await getProjects()).length;
  const learning = await getLearningStats();
  // certifications = countCertifications().total (non-skill-assessment entries + non-duplicate course certificates)
  return { years, projects, learningHours: learning.hours, certifications: learning.certificates };
}

/* ───────────── stack index ───────────── */
export interface StackUsage {
  slug: string;
  projects: Entry<'projects'>[];
  experience: Entry<'experience'>[];
  courses: Entry<'courses'>[];
  certifications: Entry<'certifications'>[];
  teaching: Entry<'teaching'>[];
  research: Entry<'research'>[];
  /** Own references only (decides whether a page exists). */
  total: number;
  /** Items that reach this technology through a child (e.g. python <- flask), with the child slug. */
  via: { slug: string; kind: 'projects' | 'experience' | 'courses' | 'certifications' | 'teaching' | 'research'; item: unknown; child: string }[];
}

/** Every technology (after alias merging) with everything that uses it. Drives /stack and /stack/[tech]. */
let stackCache: StackUsage[] | null = null;
export async function getStackIndex(): Promise<StackUsage[]> {
  if (stackCache) return stackCache;
  const map = new Map<string, StackUsage>();
  const touch = (raw: string) => {
    const slug = canonicalTech(raw);
    let u = map.get(slug);
    if (!u) {
      u = { slug, projects: [], experience: [], courses: [], certifications: [], teaching: [], research: [], total: 0, via: [] };
      map.set(slug, u);
    }
    return u;
  };
  const push = <T>(arr: T[], item: T) => { if (!arr.includes(item)) arr.push(item); };
  type Kind = StackUsage['via'][number]['kind'];
  const add = (kind: Kind, raw: string, item: unknown) => {
    const slug = canonicalTech(raw);
    push(touch(slug)[kind] as unknown[], item);
    // parent/child: the parent page also lists the item, marked "via <child>" (unless tagged directly too)
    const parent = parentTech(slug);
    if (parent && parent !== slug) {
      const pu = touch(parent);
      if (!(pu[kind] as unknown[]).includes(item) && !pu.via.some((v) => v.item === item && v.kind === kind)) pu.via.push({ slug: parent, kind, item, child: slug });
    }
  };
  for (const p of await getCollection('projects', (e) => !e.data.hidden)) p.data.stack.forEach((s) => add('projects', s, p));
  for (const e of await getCollection('experience')) e.data.stack.forEach((s) => add('experience', s, e));
  for (const c of await getCollection('courses')) c.data.stack.forEach((s) => add('courses', s, c));
  for (const c of await getCollection('certifications')) c.data.skills.forEach((s) => add('certifications', s, c));
  for (const t of await getCollection('teaching')) t.data.technologies.forEach((s) => add('teaching', s, t));
  for (const r of await getCollection('research')) r.data.stack.forEach((s) => add('research', s, r));
  for (const u of map.values()) {
    u.total = u.projects.length + u.experience.length + u.courses.length + u.certifications.length + u.teaching.length + u.research.length;
    // drop "via" entries for items that are also tagged directly
    u.via = u.via.filter((v) => !(u[v.kind] as unknown[]).includes(v.item));
  }
  stackCache = [...map.values()].sort((a, b) => b.total - a.total || a.slug.localeCompare(b.slug));
  return stackCache;
}

/** Technologies that get their own page: ≥ STACK_PAGE_MIN references after alias merging, or covered by a course in progress or completed. */
export async function getStackPages(): Promise<StackUsage[]> {
  // A technology gets a page when it is referenced often enough, or when a course I finished or am taking covers it.
  return (await getStackIndex()).filter((u) => u.total >= STACK_PAGE_MIN || u.courses.some((c) => c.data.completed || c.data.progress > 0));
}
/** Unique canonical slugs, preserving order (for pill lists). */
export const uniqueTech = (slugs: readonly string[]): string[] => [...new Set(slugs.map(canonicalTech))];

/** Site-relative href for a technology pill, or null when it has no page. */
export async function stackHref(raw: string): Promise<string | null> {
  const slug = canonicalTech(raw);
  const pages = await getStackPages();
  return pages.some((u) => u.slug === slug) ? `/stack/${slug}` : null;
}
