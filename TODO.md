# TODO — before launch

`grep -rn "TODO" src public README.md` finds every placeholder in place. Outcomes that start with `TODO:` are never rendered.

## A. Content I must provide

| # | What | Where |
|---|---|---|
| A1 | **Redacted CV** (no home address, phone, date of birth) → replaces the one-line placeholder PDF | `public/cv.pdf` |
| A2 | Project images — each project page has a `{/* TODO: image */}` marker; the three role cards on Home show a `TODO: image` placeholder | `src/assets/projects/<slug>/`, `src/content/projects/*.mdx → images/cover`, `src/pages/index.astro` (FeatureRow `image=`) |
| A3 | Employer logos (SVG) — Home currently shows company names in the ticker | `src/assets/logos/`, `experience/*.md → logo:` |
| A4 | GitHub username + repo name (badge, `SITE_URL` default, `links.github`) | `README.md`, `astro.config.mjs`, `src/config/site.ts` |
| A5 | Google Scholar, ORCID, LeetCode, Replit URLs (`sameAs` + Profiles/Links) | `src/config/site.ts → links` |
| A6 | Do you teach on Udemy? (`features.udemyInstructor` + link) | `src/config/site.ts` |
| A7 | Analytics: Plausible domain **or** Umami script/website id, or leave `none` | `src/config/site.ts → features.analytics` |
| A8 | Engagement prices: "On request" or "From €X" (consulting / project / retainer) | `src/content/services/{consulting,project,retainer}.md` |
| A9 | FAQ wording: availability and invoicing (VAT, payment terms) | `src/content/faq/30-availability.md`, `40-invoicing.md` |
| A10 | Clients with written consent (optional) — testimonials and the client strip render only when `publicConsent: true` | `src/content/clients/*.json` |
| A11 | Publications (optional) — section renders only when at least one exists | `src/content/publications/*.md` |
| A12 | Custom-domain email for the GDPR contact (currently the Gmail address, assembled client-side) | `src/config/business.ts → dataContactEmail`, `site.ts → email` |

## A2. Landing-page framing to confirm

- The landing page now presents the PhD as **AIOps & MLOps** (per your instruction). The research page still shows the thesis title from LinkedIn/CV, *Audio-Haptic Rendering of Real and Virtual Environments*. If the official thesis topic changed, update `src/content/research/phd-thesis.md` (title + description) so both pages agree.
- Teaching is presented as **Artificial Intelligence & Machine Learning** (the MSc course "Intelligent Image Processing") and Software Engineering (BSc).

## B. Numbers I must confirm (hidden until confirmed)

| Figure | Source | Where it sits |
|---|---|---|
| 10,000+ concurrent users · 99.99 % uptime · < 200 ms median latency · 95 %+ coverage | GLOBE-CoP (LinkedIn/CV) | `projects/globe-cop.mdx → outcomes` |
| "thousands of concurrent ambassadors" | GREENUS (CV) | `projects/greenus.mdx → outcomes` |
| Time-to-market −60 % | Hitachi (LinkedIn + CV) | comment in `experience/hitachi.md` |
| Onboarding time halved | ROSPIN (LinkedIn) | `projects/rospin.mdx → outcomes` |

Date/role discrepancies were resolved by the rules in the brief (LinkedIn dates; Thales from LinkedIn; Hitachi from CV; HRIA = AI Research Engineer; "PhD candidate"). Robital end date: LinkedIn 09/2021 used (CV says 10/2021). Certifications carry no dates in either source → shown without dates. 13 Continental/Luxoft/LearnX certificates link to Google Drive — confirm those links are meant to be public, and fix the "Python Programming – University of Michigan" credential URL (the CV repeats the Networking Essentials link).

## C. Legal review

- **Review `/legal`, `/legal/privacy` and `/legal/cookies` with an accountant/lawyer before launch** (dev-only banner on those pages). Specifically: the Calendly transfer mechanism (DPA / SCCs / DPF status), retention periods (12 months for form submissions and bookings; 5–10 years for accounting records), and the business table.
- Business identification details: legal name (… PFA), CUI/CIF, ONRC no., registered office (city only or full), billing email, CAEN, VAT status, founding year → `src/config/business.ts` (public repo: only what you are fine publishing).

## D. Accounts / keys to create

| Service | What to do | Where it goes |
|---|---|---|
| **Web3Forms** | Create a free access key for your email | GitHub → Settings → Secrets and variables → Actions → **Variables** → `PUBLIC_WEB3FORMS_KEY` (public by nature, so a Variable, not a Secret); locally in `.env` |
| **GitHub Pages** | Settings → Pages → Build and deployment → Source: **GitHub Actions** | one-time |
| **Custom domain** (optional) | Put the domain in `public/CNAME` (one line) + Settings → Pages → Custom domain; DNS: apex `A` → 185.199.108.153 / .109.153 / .110.153 / .111.153, `www` `CNAME` → `<user>.github.io`; tick Enforce HTTPS | `public/CNAME` |
| Calendly | Already set (`site.booking.url`); free plan, one 30-min event type | — |

## E. Launch checklist

1. Fill A4 (username/repo) and push — the first `main` build deploys automatically.
2. Set the Pages source to GitHub Actions (D) and watch the **Build & Deploy** workflow: build → deploy → Lighthouse (blocking, all ≥ 0.95).
3. Add `PUBLIC_WEB3FORMS_KEY`, re-run the workflow, send a test message from `/contact`.
4. Click "Book a call" on the live site once (facade → Calendly popup), and check a booking shows `utm_medium=<page>`.
5. Replace `public/cv.pdf` with the redacted CV (A1), then set `site.cv.pdfReady = true` in `src/config/site.ts` — that brings back every "Download CV" button (until then they're hidden and the hero links to `/cv`). Run `npm run privacy` before pushing.
6. Review legal pages (C); fill `business.ts`.
7. Optional: custom domain (D), then update `site.ts → links`, the README badge and re-run `npm run og` if the headline changes.
8. Re-run `npm run import:udemy` whenever you export a new CSV; commit the generated JSON.
