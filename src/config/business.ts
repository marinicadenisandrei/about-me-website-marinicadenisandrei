/**
 * Business identification details of the sole proprietorship (PFA).
 * Stored once; read by the footer, the Legal page and the ProfessionalService JSON-LD.
 *
 * ⚠ This repository is PUBLIC. Put here ONLY details you are fine publishing.
 *   Romanian law (OUG 34/2014, Legea 365/2002) requires the provider's identification
 *   data (name, registered office, CUI, ONRC) to be accessible on the website, but
 *   "Bucharest, Romania" is enough for the registered office if you don't want the street.
 *   No home address, phone number or date of birth belongs in this file.
 */
export const business = {
  legalName: 'MARINICĂ D.F. DENIS-ANDREI PERSOANĂ FIZICĂ AUTORIZATĂ', // as registered at ONRC
  tradeName: 'Denis Marinică, DevOps & MLOps consulting',
  taxId: '55575430', // CUI (no RO prefix: not VAT registered)
  tradeRegisterNo: 'F2026043500002', // ONRC number
  /** Public registered office: city only or full address, your choice. */
  registeredOffice: 'B-dul Bucureștii Noi 136, ground floor, ap. 5, Sector 1, Bucharest, Romania', // registered office (sediu profesional) as registered at ONRC
  billingEmail: 'TODO: billing email', // TODO (a dedicated billing address is recommended for a public site)
  /** Main activity code. */
  caen: { code: 'TODO: 6201', label: 'TODO: Custom software development' }, // TODO
  vatRegistered: false, // CUI has no RO prefix; change if you register for VAT
  country: 'Romania',
  /** GDPR: who answers data-subject requests. Uses the public contact email from site.ts. */
  dataController: 'Marinică Denis-Andrei',
  dataContactEmail: 'marinicadenisandrei@gmail.com', // TODO: confirm you want this address public (it is already on LinkedIn)
} as const;

/** True when at least one field is still a placeholder, used to show a TODO banner in dev. */
export function businessHasTodos(): boolean {
  return Object.values(business).some((v) =>
    typeof v === 'string'
      ? v.startsWith('TODO')
      : typeof v === 'object' && v !== null && Object.values(v).some((x) => String(x).startsWith('TODO')),
  );
}
