/**
 * Content collections, the single source of truth for everything on the site.
 *
 * Rules:
 *  - Every collection has a strict Zod schema. A file that doesn't validate fails the build.
 *  - Files whose name starts with `_` (e.g. `_template.md`) are ignored by the glob loader,
 *    so each collection ships a copy-paste template that never renders.
 *  - Collections are linked with `reference()`; pages derive client -> projects,
 *    research -> projects, technology -> everything automatically.
 *  - Adding content = adding one file. No component changes.
 */
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { COURSE_CATEGORIES } from './config/course-categories';
import { PROJECT_CATEGORIES } from './config/categories';

/* ───────────────────────────── shared primitives ───────────────────────────── */

/** ISO date (YYYY-MM-DD) or YYYY-MM; coerced to a Date. */
const isoDate = z.coerce.date();
/** `null` means "present / ongoing". */
const endDate = isoDate.nullable().default(null);
/** Technology slugs, e.g. "kubernetes", "terraform". Lower-case, kebab-case. */
const techSlug = z
  .string()
  .regex(/^[a-z0-9][a-z0-9.+-]*$/, 'Use lower-case kebab-case technology slugs, e.g. "github-actions"');
const stack = z.array(techSlug).default([]);
const url = z.url();
const nonEmpty = z.string().trim().min(1);

const linkSet = z
  .object({
    live: url.optional(),
    repo: url.optional(),
    paper: url.optional(),
    demo: url.optional(),
    docs: url.optional(),
    other: z.array(z.object({ label: nonEmpty, url })).default([]),
  })
  .default({ other: [] });

/* ───────────────────────────── experience ───────────────────────────── */

const experience = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/experience' }),
  schema: ({ image }) =>
    z.object({
      company: nonEmpty,
      companyShort: z.string().optional(), // e.g. "LSEG"
      companyUrl: url.optional(),
      role: nonEmpty,
      employmentType: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship', 'research']),
      location: nonEmpty,
      locationType: z.enum(['on-site', 'remote', 'hybrid']).optional(),
      startDate: isoDate,
      endDate,
      summary: z.string().max(320),
      highlights: z.array(nonEmpty).min(1).max(8),
      stack,
      logo: image().optional(),
      /** Lower = higher on the timeline. Ties broken by startDate desc. */
      order: z.number().int().default(100),
      featured: z.boolean().default(false),
      /** Show the logo in the employer strip on the home page. */
      showLogo: z.boolean().default(true),
      /** Category tint used by GlassCard (see src/config/categories.ts). */
      tint: z.enum(PROJECT_CATEGORIES).default('employment'),
    }),
});

/* ───────────────────────────── clients ───────────────────────────── */

const clients = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/clients' }),
  schema: ({ image }) =>
    z.object({
      name: nonEmpty,
      industry: nonEmpty,
      country: nonEmpty,
      logo: image().optional(),
      website: url.optional(),
      /** Name/logo/testimonial are rendered ONLY when true. */
      publicConsent: z.boolean().default(false),
      /** Real testimonials only. Rendered only together with publicConsent. */
      testimonial: z
        .object({
          quote: nonEmpty,
          author: nonEmpty,
          authorRole: z.string().optional(),
          date: isoDate.optional(),
        })
        .optional(),
      since: isoDate.optional(),
    }),
});

/* ───────────────────────────── research ───────────────────────────── */

const research = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/research' }),
  schema: z.object({
    title: nonEmpty,
    acronym: z.string().optional(),
    type: z.enum(['grant', 'project', 'thesis', 'hub']).default('project'),
    funder: z.string().optional(), // e.g. "ESA", "EU Horizon", "UEFISCDI"
    organization: z.string().optional(),
    role: nonEmpty,
    period: z.object({ start: isoDate, end: endDate }),
    description: z.string().max(400),
    link: url.optional(),
    stack,
    order: z.number().int().default(100),
  }),
});

/* ───────────────────────────── projects ───────────────────────────── */

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: nonEmpty,
        /** Optional URL slug override; defaults to the file name. */
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .optional(),
        category: z.enum(PROJECT_CATEGORIES),
        role: nonEmpty,
        organization: z.string().optional(),
        /** Links to other collections (file names without extension). */
        client: reference('clients').optional(),
        experience: reference('experience').optional(),
        research: reference('research').optional(),
        status: z.enum(['active', 'completed', 'paused', 'archived']),
        /** null = start date not confirmed yet; shown as a TODO instead of an invented date. */
        startDate: isoDate.nullable(),
        endDate,
        summary: z.string().max(280),
        problem: z.string().optional(),
        solution: z.string().optional(),
        myContribution: z.array(nonEmpty).min(1).max(8),
        outcomes: z.array(nonEmpty).default([]),
        stack,
        /** Optional: the technologies shown on the project card (otherwise the hottest ones are picked automatically). */
        highlight: z.array(z.string()).max(6).optional(),
        links: linkSet,
        images: z
          .array(z.object({ src: image(), alt: nonEmpty, caption: z.string().optional() }))
          .default([]),
        cover: image().optional(),
        /** EU-funded project: shows the EU badge on the card and the project page. programme = e.g. "Horizon 2020". */
        euFunded: z.object({ programme: z.string().optional() }).optional(),
        featured: z.boolean().default(false),
        /** true = kept in the repo but not published anywhere on the site (e.g. student projects). */
        hidden: z.boolean().default(false),
        /** When true the client name/logo are hidden and "Confidential client - <industry>" is shown. */
        confidential: z.boolean().default(false),
        /** Required when confidential = true (used for the "Confidential client - <industry>" label). */
        industry: z.string().optional(),
        order: z.number().int().default(100),
      })
      .refine((p) => !p.confidential || !!p.industry || !!p.client, {
        message: 'A confidential project needs either `industry` or a `client` reference (its industry is used).',
        path: ['industry'],
      }),
});

/* ───────────────────────────── teaching ───────────────────────────── */

const teaching = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/teaching' }),
  schema: z.object({
    course: nonEmpty,
    level: z.enum(['MSc', 'BSc', 'PhD']),
    role: z.string().default('Teaching Assistant'),
    university: nonEmpty,
    faculty: nonEmpty,
    period: z.object({ start: isoDate, end: endDate }),
    topics: z.array(nonEmpty).min(1),
    technologies: stack,
    syllabusLink: url.optional(),
    order: z.number().int().default(100),
  }),
});

/* ───────────────────────────── publications ───────────────────────────── */

const publications = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/publications' }),
  schema: z.object({
    title: nonEmpty,
    authors: z.array(nonEmpty).min(1),
    venue: nonEmpty,
    year: z.number().int().min(1990).max(2100),
    type: z.enum(['journal', 'conference', 'workshop', 'talk', 'poster', 'thesis', 'preprint', 'book-chapter']),
    doi: z.string().optional(),
    url: url.optional(),
    pdf: z.string().optional(), // absolute URL or a path under /public
    /** Raw BibTeX entry; rendered with a copy/download button. */
    bibtex: z.string().optional(),
    abstract: z.string().optional(),
    research: reference('research').optional(),
    keywords: z.array(nonEmpty).default([]),
  }),
});

/* ───────────────────────────── courses (Udemy, generated) ───────────────────────────── */

const courses = defineCollection({
  // `udemy/` is regenerated by `npm run import:udemy`; files at the root are hand-written.
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/courses' }),
  schema: z.object({
    title: nonEmpty,
    url,
    provider: z.enum(['udemy', 'coursera', 'other']).default('udemy'),
    instructors: z.array(z.string()).default([]),
    /** 0-100 */
    progress: z.number().min(0).max(100),
    completed: z.boolean(),
    lectures: z.number().int().nonnegative().default(0),
    /** Total hours (decimal). */
    hours: z.number().nonnegative().default(0),
    enrolledDate: isoDate.nullable().default(null),
    archived: z.boolean().default(false),
    certificate: z
      .object({
        id: nonEmpty,
        date: isoDate.nullable().default(null),
        url: url.optional(),
        pdf: url.optional(),
      })
      .nullable()
      .default(null),
    category: z.enum(COURSE_CATEGORIES),
    /** "student" = a course I took; "instructor" = a course I publish. */
    role: z.enum(['student', 'instructor']).default('student'),
    /** Technology slugs, used to link the course from /stack/[tech]. */
    stack,
    /** Set by the importer so hand-written files can be told apart. */
    generated: z.boolean().default(false),
  }),
});

/* ───────────────────────────── certifications ───────────────────────────── */

const certifications = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/certifications' }),
  schema: ({ image }) =>
    z.object({
      name: nonEmpty,
      issuer: nonEmpty, // Credly, Coursera, freeCodeCamp, HIL Academy, LinkedIn, ...
      kind: z.enum(['certification', 'course-certificate', 'skill-assessment', 'badge']).default('certification'),
      /** null = date unknown (the CV lists no dates), shown without a date rather than inventing one. */
      date: isoDate.nullable().default(null),
      expires: isoDate.nullable().default(null),
      credentialId: z.string().optional(),
      credentialUrl: url.optional(),
      badgeImage: image().optional(),
      skills: stack,
      order: z.number().int().default(100),
    }),
});

/* ───────────────────────────── services ───────────────────────────── */

const services = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/services' }),
  schema: z.object({
    title: nonEmpty,
    tagline: z.string().optional(),
    description: z.string().max(400),
    deliverables: z.array(nonEmpty).min(1),
    stack,
    /** The technologies shown on the capability card (otherwise the hottest ones are picked automatically). */
    highlight: z.array(z.string()).max(16).optional(),
    /** Lucide icon name, e.g. "cloud", "cpu", "shield-check". */
    icon: nonEmpty,
    /** Engagement model card on the home page (max 3 rendered). */
    engagement: z
      .object({
        model: z.enum(['consulting', 'project', 'retainer']),
        price: z.string().default('On request'), // "On request" | "From €X", TODO: fill in
        unit: z.string().optional(), // "/ day", "/ month"
        featured: z.boolean().default(false),
        audience: z.array(z.enum(['companies', 'startups-academia'])).default(['companies', 'startups-academia']),
        includes: z.array(nonEmpty).default([]),
      })
      .optional(),
    order: z.number().int().default(100),
  }),
});

/* ───────────────────────────── faq ───────────────────────────── */

const faq = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/faq' }),
  schema: z.object({
    question: nonEmpty,
    audience: z.enum(['clients', 'recruiters', 'students', 'all']).default('clients'),
    order: z.number().int().default(100),
  }),
});

/* ───────────────────────────── posts (optional blog) ───────────────────────────── */

const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: nonEmpty,
      description: z.string().max(200),
      pubDate: isoDate,
      updatedDate: isoDate.optional(),
      tags: z.array(nonEmpty).default([]),
      cover: image().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = {
  experience,
  clients,
  research,
  projects,
  teaching,
  publications,
  courses,
  certifications,
  services,
  faq,
  posts,
};
