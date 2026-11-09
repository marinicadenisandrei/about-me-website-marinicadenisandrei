/** JSON-LD builders. Person is embedded on Home/About/Contact; ProfessionalService on Services/Legal. */
import { site } from '@config/site';
import { business } from '@config/business';
import { absoluteUrl } from '@lib/url';

const sameAs = () => Object.values(site.links).filter((u) => u && !u.includes('TODO'));

export function personJsonLd(siteUrl: URL | string | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: absoluteUrl('/', siteUrl),
    image: absoluteUrl('/icon-512.png', siteUrl),
    email: `mailto:${site.email}`,
    jobTitle: 'Senior DevOps Engineer',
    description: site.description,
    address: { '@type': 'PostalAddress', addressLocality: 'Bucharest', addressCountry: 'RO' },
    worksFor: { '@type': 'Organization', name: 'London Stock Exchange Group' },
    affiliation: { '@type': 'CollegeOrUniversity', name: 'National University of Science and Technology POLITEHNICA Bucharest' },
    sameAs: sameAs(),
  };
}

export function professionalServiceJsonLd(siteUrl: URL | string | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: business.tradeName,
    legalName: business.legalName,
    url: absoluteUrl('/services', siteUrl),
    image: absoluteUrl('/icon-512.png', siteUrl),
    email: `mailto:${site.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Bucharest', addressCountry: 'RO' },
    areaServed: ['Romania', 'European Union', 'United Kingdom'],
    founder: { '@type': 'Person', name: site.name },
    vatID: business.vatRegistered ? business.taxId : undefined,
    taxID: business.taxId,
    sameAs: sameAs(),
    potentialAction: {
      '@type': 'ReserveAction',
      name: site.booking.label,
      target: { '@type': 'EntryPoint', urlTemplate: site.booking.url, actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'] },
      result: { '@type': 'Reservation', name: `${site.booking.durationMin}-minute intro call` },
    },
  };
}
