/**
 * Site-wide configuration and ALL UI strings.
 * No i18n: the site is English-only, so every label lives here once.
 */
export const site = {
  lang: 'en',
  name: 'Denis-Andrei Marinică',
  /** Used in <title> suffixes, JSON-LD and the footer. */
  shortName: 'Denis Marinică',
  initials: 'MDA',
  /** Nav lockup text only — everything else uses `name`. */
  brand: { primary: 'DENIS', secondary: 'M' },
  /** Derived from the LinkedIn headline (shortened; "PhD candidate", never "PhD"). */
  headline: 'Senior DevOps Engineer @ LSEG · AI Research Engineer · University Teaching Assistant @ ACS-UNSTPB · PhD candidate',
  tagline: 'Reliable platforms, from cloud pipelines to research prototypes.',
  description:
    'Senior DevOps Engineer at LSEG, AI research engineer and university teaching assistant at ACS-UNSTPB, PhD candidate and freelance DevOps/MLOps consultant based in Bucharest, Romania.',
  location: 'Bucharest, Romania',
  email: 'marinicadenisandrei@gmail.com',
  /** Public profile links (also used for JSON-LD `sameAs`). */
  links: {
    linkedin: 'https://www.linkedin.com/in/marinica-denis-andrei-b804a8208',
    github: 'https://github.com/TODO-github-username', // TODO: GitHub profile URL
    scholar: '', // TODO: Google Scholar profile URL
    orcid: '', // TODO: ORCID iD URL (https://orcid.org/0000-…)
    leetcode: '', // TODO: LeetCode profile URL (LinkedIn "Publications" → Leetcode Status)
    replit: '', // TODO: Replit profile URL (LinkedIn "Publications" → Check myRepls)
    udemyInstructor: '', // TODO: only if you publish Udemy courses
  },
  cvPath: '/cv.pdf',
  /** Set pdfReady to true once the redacted CV is in public/cv.pdf — until then every "Download CV" button is hidden and the hero CTA points to /cv. */
  cv: { pdfReady: false, pdfPath: '/cv.pdf', pagePath: '/cv' },
  /** Calendly booking (loaded only after the user clicks "Book a call"). */
  booking: {
    url: 'https://calendly.com/marinicadenisandrei/30min',
    label: 'Book a 30-min intro call',
    durationMin: 30,
    shortLabel: 'Book a call',
    disclosure: 'Opens Calendly (third-party). By booking, you agree to Calendly’s privacy policy.',
    disclosureShort: 'Opens Calendly ↗',
    privacyUrl: 'https://calendly.com/privacy',
    dpaUrl: 'https://calendly.com/dpa',
    /** Section of our privacy policy that explains the Calendly processing (aria-describedby target). */
    privacySectionPath: '/legal/privacy#calendly',
  },
  /** Hero badge. Set to false to hide it. */
  availableForFreelance: true,

  /** Feature flags */
  features: {
    /** Show courses with archived=true on the Learning page. */
    showArchivedCourses: false,
    /** Render a "My Courses" section (courses with role = "instructor"). */
    udemyInstructor: false, // TODO: do you teach on Udemy? yes/no
    blog: false,
    /** Umami / Plausible analytics (cookie-less). Leave empty to disable. */
    analytics: {
      provider: 'none' as 'none' | 'plausible' | 'umami',
      plausibleDomain: '', // TODO: e.g. denismarinica.dev
      umamiSrc: '', // TODO: e.g. https://cloud.umami.is/script.js
      umamiWebsiteId: '',
    },
    /** Contact form backend. GitHub Pages is static, so the form posts to an external service. */
    contactForm: {
      provider: 'web3forms' as 'web3forms' | 'formspree' | 'none',
      /** Web3Forms access key — set as the PUBLIC_WEB3FORMS_KEY GitHub Actions *variable* (or in .env locally). */
      key: import.meta.env.PUBLIC_WEB3FORMS_KEY ?? '', // TODO: add PUBLIC_WEB3FORMS_KEY in Settings → Variables
    },
  },

  /** Main navigation (order matters). Hrefs are site-relative; BASE_URL is applied by <Link>. */
  nav: [
    { label: 'About', href: '/about' },
    { label: 'Experience', href: '/experience' },
    { label: 'Projects', href: '/projects' },
    { label: 'Research & Teaching', href: '/research' },
    { label: 'Services', href: '/services' },
    { label: 'Learning', href: '/learning' },
    { label: 'Contact', href: '/contact' },
  ],
  footerNav: [
    { label: 'Stack', href: '/stack' },
    { label: 'CV', href: '/cv' },
    { label: 'Legal', href: '/legal' },
    { label: 'Privacy', href: '/legal/privacy' },
    { label: 'Cookies', href: '/legal/cookies' },
  ],

  /** Every piece of UI copy. */
  ui: {
    skipToContent: 'Skip to content',
    menu: 'Menu',
    closeMenu: 'Close menu',
    toggleTheme: 'Toggle light / dark theme',
    scroll: 'Scroll',
    section: 'Section',
    heroBadge: 'Available for freelance projects',
    heroTitle: 'Reliable systems, <em>from pipeline to prototype</em>',
    ctaWorkWithMe: 'Work with me',
    ctaDownloadCv: 'Download CV',
    ctaViewCv: 'View CV',
    ctaSeeProjects: 'See projects',
    ctaContact: 'Get in touch',
    ctaSendMessage: 'Send a message',
    footerCtaTag: 'Let’s talk',
    footerCtaTitle: 'Let’s build something <strong>reliable</strong>',
    footerCtaBody: 'DevOps, cloud, MLOps and software engineering — for companies, startups and research teams.',
    metrics: {
      yearsExperience: 'Years of experience',
      projects: 'Projects',
      learningHours: 'Learning hours',
      certifications: 'Certifications',
    },
    roles: {
      tag: 'Three roles, one engineer',
      title: 'Industry, academia <strong>and freelance</strong>',
      industry: { tag: 'Industry', title: 'Senior DevOps Engineer <strong>at LSEG</strong>', cta: 'Experience' },
      academia: { tag: 'Academia & Research', title: 'Teaching, research <strong>and a PhD</strong>', cta: 'Research & Teaching' },
      freelance: { tag: 'Freelance', title: 'Independent DevOps <strong>& MLOps consulting</strong>', cta: 'Work with me' },
    },
    projects: {
      tag: 'Selected work',
      title: 'Projects that <strong>shipped</strong>',
      all: 'All',
      filterCategory: 'Category',
      filterStatus: 'Status',
      filterTech: 'Technology',
      search: 'Search projects',
      empty: 'No projects match these filters.',
      problem: 'Problem',
      solution: 'Solution',
      contribution: 'My contribution',
      stack: 'Stack',
      outcomes: 'Outcomes',
      links: 'Links',
      confidentialClient: 'Confidential client',
      status: { active: 'Active', completed: 'Completed', paused: 'Paused', archived: 'Archived' },
    },
    experience: { tag: 'Career', title: 'Where I’ve <strong>worked</strong>', present: 'Present' },
    research: {
      tag: 'Research & Teaching',
      title: 'Research, thesis <strong>and courses I teach</strong>',
      thesis: 'PhD thesis',
      projects: 'Research projects',
      publications: 'Publications',
      teaching: 'Teaching',
      bibtex: 'BibTeX',
      copyBibtex: 'Copy BibTeX',
      downloadBibtex: 'Download .bib',
    },
    services: {
      tag: 'Work with me',
      title: 'Three ways <strong>to work together</strong>',
      howIWork: 'How I work',
      clients: 'Clients',
      segment: { companies: 'Companies', startupsAcademia: 'Startups & Academia' },
      onRequest: 'On request',
    },
    testimonials: { tag: 'What clients say', title: 'Real words from <strong>real projects</strong>' },
    stack: { tag: 'Tech stack', title: 'Tools I <strong>work with</strong>', usedIn: 'Used in', projects: 'Projects', jobs: 'Roles', courses: 'Courses', certifications: 'Certifications' },
    faq: { tag: 'FAQ', title: 'Questions clients <strong>ask most</strong>', expandAll: 'Expand all', collapseAll: 'Collapse all' },
    learning: {
      tag: 'Continuous learning',
      title: 'Courses, certificates <strong>and skills</strong>',
      stats: { hours: 'Learning hours', completed: 'Courses completed', certificates: 'Certificates', topCategories: 'Top categories' },
      completed: 'Completed with certificate',
      inProgress: 'In progress',
      archived: 'Archived',
      myCourses: 'My courses',
      certifications: 'Certifications',
      skillAssessments: 'LinkedIn skill assessments',
      viewCertificate: 'View certificate',
      search: 'Search courses',
      filterCategory: 'Category',
      filterStatus: 'Status',
      all: 'All',
      showArchived: 'Show archived',
      empty: 'No courses match these filters.',
    },
    contact: {
      tag: 'Contact',
      title: 'Let’s <strong>talk</strong>',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send message',
      sending: 'Sending…',
      success: 'Thanks — I’ll get back to you shortly.',
      error: 'Something went wrong. Please email me directly.',
      honeypot: 'Leave this field empty',
    },
    about: { tag: 'About', title: 'Engineer, researcher, <strong>teacher</strong>', education: 'Education', languages: 'Languages' },
    legal: { tag: 'Legal', title: 'Legal <strong>information</strong>', business: 'Business details', privacy: 'Privacy policy', cookies: 'Cookie policy' },
    notFound: { title: 'Page not found', body: 'The page you are looking for doesn’t exist or has moved.', cta: 'Back home' },
    footer: { rights: 'All rights reserved.', design: 'Design based on', builtWith: 'Built with Astro' },
    todo: 'TODO',
  },
} as const;

export type Site = typeof site;
