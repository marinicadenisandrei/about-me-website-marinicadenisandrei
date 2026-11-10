# Denis-Andrei Marinică, personal website

[![Build & Deploy](https://github.com/TODO-github-username/TODO-repo/actions/workflows/deploy.yml/badge.svg)](https://github.com/TODO-github-username/TODO-repo/actions/workflows/deploy.yml)
<!-- TODO: replace TODO-github-username/TODO-repo in the badge above -->

Static portfolio built with **Astro 7 + TypeScript + Content Collections (Zod)**, styled on the
[Luminary](https://templatemo.com/tm-621-luminary) template with an iOS/macOS tinted-glass layer.
Hosted on **GitHub Pages**, deployed automatically on every push to `main`.

> **Status:** complete (stage 5). See `TODO.md` for what only Denis can fill in before launch.

```bash
npm install
npm run dev          # http://localhost:4321
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build -> `dist/` (then runs the link checker automatically) |
| `npm run build:subpath` | Same build with `BASE_PATH=/preview-subpath`, catches base-path bugs locally |
| `npm run preview` | Serve `dist/` |
| `python3 scripts/make-favicon.py` | Regenerate `public/favicon.svg` (MDA monogram from Montserrat outlines) |
| `python3 scripts/make-springs.py` | Regenerate `src/styles/springs.css` (spring easings) |
| `python3 scripts/make-og.py` | Regenerate `public/og-default.png` from the brand avatar |
| `npm run styleguide` | Build **with** `/styleguide` (dev-only page; also available on `npm run dev`) and serve it |
| `npm run check` | `astro check` (TypeScript + content schema validation) |
| `npm run lint` | ESLint (TypeScript + Astro + a11y rules) |
| `npm run import:udemy` | Regenerate `src/content/courses/udemy/*.json` from `data/udemy_courses.csv` |
| `npm run test:links` | Base-path + broken-link check over `dist/` |
| `npm run privacy` | Fails if personal-data patterns (phone, address, birth date) appear in the repo or `dist/`, also runs in CI |
| `npm run test` | check + lint + build |

## Project structure

```
.
├── .github/workflows/deploy.yml   # build on every branch, deploy main -> GitHub Pages, Lighthouse CI
├── astro.config.mjs               # site/base from SITE_URL / BASE_PATH env vars
├── data/udemy_courses.csv         # Udemy export (Romanian headers), source for the courses collection
├── scripts/
│   ├── import-udemy.ts            # CSV -> src/content/courses/udemy/*.json
│   └── check-links.mjs            # fails the build on links that bypass the base path or are broken
├── public/                        # .nojekyll, robots.txt, favicon.svg, cv.pdf (TODO), CNAME (optional)
└── src/
    ├── content.config.ts          # <- all Zod schemas (the contract for every content file)
    ├── content/
    │   ├── experience/   *.md     # jobs (LSEG, Hitachi, Thales, Continental, Luxoft, Robital)
    │   ├── projects/     *.mdx    # every project -> /projects/<slug>
    │   ├── clients/      *.json   # freelance clients (publicConsent gate)
    │   ├── research/     *.md     # grants, hubs, thesis
    │   ├── teaching/     *.md     # courses I teach
    │   ├── publications/ *.md     # papers (section renders only when non-empty)
    │   ├── courses/      *.json   # Udemy (generated, in ./udemy/) + hand-written
    │   ├── certifications/*.json
    │   ├── services/     *.md     # freelance services / engagement models
    │   ├── faq/          *.md
    │   └── posts/        *.mdx    # optional blog
    │   (every folder has a _template.*, files starting with "_" never render)
    ├── config/
    │   ├── site.ts                # name, headline, links, feature flags, ALL UI strings
    │   ├── business.ts            # PFA identification details (footer + /legal + JSON-LD)
    │   ├── categories.ts          # project categories + glass tint hues
    │   └── course-categories.ts   # Udemy category keyword rules (editable)
    ├── lib/
    │   ├── content.ts             # typed queries, stats, stack index
    │   ├── url.ts                 # withBase() / canonicalUrl(), every internal link goes through here
    │   └── format.ts
    ├── layouts/Base.astro         # grain -> atmosphere + orbs -> nav pill -> bottom sheet -> side panels -> main -> footer
    ├── components/                # Nav, MobileMenu, SidePanels, Hero, SectionHeader, GlassCard, Grid, Pill,
    │                              # SegmentedControl, Timeline(+Item), Faq, FeatureRow, ProjectCard, EngagementCard, FooterCta
    ├── scripts/                   # small client modules: reveal, counter, spotlight, theme, segmented
    ├── styles/
    │   ├── tokens.css             # Luminary palette + semantic aliases, light/dark themes, radii, orbs, tint hues
    │   ├── glass.css              # .glass material (thin/regular/thick), buttons, pills, segmented control, fallbacks
    │   └── base.css               # grain, atmosphere/orbs, section rhythm, typography, reveal, prose
    └── pages/                     # one file per route (+ dynamic /projects/[slug], /stack/[tech])
```

## Design system

The Luminary template is the structural foundation (section rhythm, `section-tag` / `section-title` /
`section-body`, `--silk-ease`, reveal, counters, hero spotlight, grain, scroll-aware nav, side panels,
FAQ accordion). On top of it sits an iOS/macOS tinted-glass layer:

- `.glass` with `--thin` / `--regular` / `--thick` variants, specular sheen, cursor spotlight, hover lift and press scale.
- Per-context tint: `data-tint="industry|academia|freelance|learning|personal"` sets `--tint-h` for the subtree, so
  every card inside inherits its category hue. Hues live in `src/config/categories.ts` and `tokens.css`.
- Light mode follows `prefers-color-scheme`; the nav toggle stores an override in `localStorage` (try/catch).
- Fallbacks: no `backdrop-filter` -> opaque; `prefers-reduced-transparency` -> near-opaque; `prefers-reduced-motion` ->
  static orbs, no reveal/counter animation.
- Text on tinted primary buttons uses a per-hue ink colour (`--tint-ink`) so teal/amber stay ≥ 4.5:1.

Review everything on **`/styleguide`** (`npm run dev` -> http://localhost:4321/styleguide, or `npm run styleguide`;
`?theme=light|dark` forces a theme). The page is never generated in a normal production build.

## Brand assets

`src/assets/brand/` holds the circular portrait (`logo-icon*.png`, used by `<Avatar>` / `<BrandLockup>` in the nav,
footer CTA, About and Contact, and in JSON-LD `Person.image`) and the transparent cut-out (`stylized.png`, Home hero,
served as AVIF/WebP at 320/480/600 px through `astro:assets`). `public/` has the PNG favicons, `apple-touch-icon.png`,
the manifest icons, the generated monogram `favicon.svg` (dark/light via `prefers-color-scheme`) and `og-default.png`.
The manifest is generated at `/site.webmanifest` so icon paths honour the base path.

Motion: `<ClientRouter>` enables view transitions; the nav avatar carries `transition:name="portrait"` and morphs into
the large portrait on `/about` (and back). Project cards carry `project-<slug>` for the card -> page zoom (detail pages
in stage 5). Component scripts re-initialise on `astro:page-load`.

## Motion

`src/styles/springs.css` (generated by `scripts/make-springs.py`) defines `--spring-snappy / smooth / bouncy` as
`linear()` easings with cubic-bezier fallbacks; `src/styles/motion.css` applies them (press squish, lift), adds
concentric inner radii (`max(4px, var(--r) − var(--pad))`), the glass opacity modes (`html[data-glass]`, set by
`<GlassSlider>` and persisted), Chromium-only SVG lensing (`html.has-lens`, `LensFilter.astro`), and
reduced-motion rules (view transitions become plain crossfades). The nav pill persists across navigations
(`transition:persist`), slides its indicator, compacts on scroll-down, and on mobile morphs into the bottom sheet
through a same-document view transition. Recordings of each animation are on `/styleguide#sg-motion`
(served from `public/_dev/motion`, pruned from production builds by `scripts/prune-dev.mjs`).

## Booking (Calendly, click-to-load)

`<BookCall page="...">` renders a plain glass link to `site.booking.url` (+ `utm_source=website&utm_medium=<page>`),
opening Calendly in a new tab. With JS, the first click lazy-loads Calendly's `widget.js`/`widget.css` and opens the
popup (entrance animated with the spring tokens); if loading fails, the link behaviour is kept. Nothing from
Calendly is requested before the click, so Lighthouse and the cookie policy are unaffected. Placed on `/contact`,
`/services`, the footer CTA and the mobile sheet; `ProfessionalService` JSON-LD carries a `ReserveAction`.

## Content model

Collections are linked with `reference()`:

```
projects ──client──▶ clients          (client page lists its projects)
projects ──experience──▶ experience   (job card lists its projects)
projects ──research──▶ research       (research entry lists its projects)
publications ──research──▶ research
```

Technology slugs (`stack: [kubernetes, terraform]`) are shared by `experience`, `projects`,
`courses`, `certifications`, `teaching` and `research`, so `/stack/kubernetes` lists everything
that uses it automatically. `src/config/stack.ts` has two maps: `STACK_SYNONYMS` (same thing, merged:
`cplusplus`->`cpp`) and `STACK_PARENTS` (child->parent, not merged: Flask stays "Flask", but `/stack/python`
also lists Flask-tagged items marked "via Flask"). A technology gets a page at ≥ `STACK_PAGE_MIN` (3) direct references.

Key rules enforced by the schemas:

- `endDate: null` ⇒ present.
- `clients.publicConsent: false` ⇒ name, logo and testimonial are never rendered.
- `projects.confidential: true` ⇒ "Confidential client - \<industry\>" is shown instead of the name.
- Testimonials come only from `clients`: no clients with consent ⇒ the section doesn't render.
- `publications` renders only when at least one non-template entry exists.

## How to add content

Copy the `_template.*` file in the relevant folder, rename it, fill it in, commit. That's it.

### A project

```bash
cp src/content/projects/_template.mdx src/content/projects/my-project.mdx   # -> /projects/my-project
```

### A client

```bash
cp src/content/clients/_template.json src/content/clients/acme.json
# then in the project: client: acme   and set "publicConsent": true only with written consent
```

### A publication

```bash
cp src/content/publications/_template.md src/content/publications/2026-audio-haptic.md
```

### A non-Udemy or self-published course

```bash
cp src/content/courses/_template.json src/content/courses/my-coursera-course.json   # role: "student" | "instructor"
```

## Refreshing Udemy courses

1. Export the course list from Udemy as CSV (Romanian headers: `titlu, link, instructori, progres, terminat, lectii, durata, inscris, arhivat, certificat_id, certificat_data, certificat, certificat_pdf`).
2. Save it as `data/udemy_courses.csv`.
3. `npm run import:udemy`, regenerates `src/content/courses/udemy/` (81 courses, ~2 000 h at the time of writing).
4. Commit. CI runs the import again on every build, so the generated files always match the CSV.

Categories are assigned from title keywords in `src/config/course-categories.ts` (first matching
rule wins). Edit the rules and re-run the import to re-categorise.

## Deployment (GitHub Pages)

Every push to **any** branch runs `build` (import -> `astro check` -> lint -> build -> link check).
Only pushes to **`main`** run `deploy`, then **Lighthouse CI** against the live URL: desktop preset on five pages
and the mobile preset on the home page, 3 runs each (median), every category ≥ 0.95 or the pipeline fails; reports
are uploaded as workflow artifacts. Push to `main` -> live in ~1-2 minutes.

`SITE_URL` and `BASE_PATH` are derived automatically from the repository name:

| Repository | URL | base |
|---|---|---|
| `<user>/<user>.github.io` | `https://<user>.github.io/` | `/` |
| `<user>/<repo>` | `https://<user>.github.io/<repo>/` | `/<repo>` |
| any + `public/CNAME` | `https://<custom-domain>/` | `/` |

### First push and deploy

```bash
# 1. create an empty PUBLIC repository on GitHub, <user>/<repo>, do not initialise it with a README
# 2. from this folder:
git remote add origin git@github.com:<user>/<repo>.git     # or https://github.com/<user>/<repo>.git
git push -u origin main
# 3. GitHub -> Settings -> Pages -> Build and deployment -> Source: "GitHub Actions"
# 4. GitHub -> Settings -> Secrets and variables -> Actions -> Variables -> New: PUBLIC_WEB3FORMS_KEY = <key>
# 5. Actions -> "Build & Deploy" -> if the first run started before step 3, "Re-run all jobs"
#    build (~2 min) -> deploy -> Lighthouse CI; the live URL is shown on the deploy job
```

Every later `git push` to `main` redeploys; pushes to other branches and PRs only build.

### One-time setup

1. Push the repo to GitHub.
2. **Settings -> Pages -> Build and deployment -> Source: GitHub Actions.**
3. (Optional) custom domain: put it in `public/CNAME` (one line, e.g. `denismarinica.dev`), add it in
   **Settings -> Pages -> Custom domain**, and create DNS records:
   - apex `A` -> `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www` `CNAME` -> `<user>.github.io`
   - tick **Enforce HTTPS** once the certificate is issued.
4. Replace `TODO-github-username/TODO-repo` in the badge at the top of this file.

### Base-path safety

Every internal link goes through `withBase()` (`src/lib/url.ts`) or the `<Link>` component.
`scripts/check-links.mjs` runs after every build and **fails** on any internal absolute URL that
bypasses the base path, and on any internal link that points to a non-existent page.
Run `npm run build:subpath` locally to reproduce the project-page layout.

## TODO

See `TODO.md`, content to provide, numbers to confirm, legal review, accounts/keys, launch checklist.
