---
# Copy this file to `<company>.md` (e.g. `lseg.md`). Files starting with `_` are ignored.
company: Company name
companyShort: ACME            # optional short name shown in tight spaces
companyUrl: https://example.com
role: Senior DevOps Engineer
employmentType: full-time     # full-time | part-time | contract | freelance | internship | research
location: Bucharest, Romania
locationType: hybrid          # on-site | remote | hybrid (optional)
startDate: 2025-09-01
endDate: null                 # null = present
summary: One or two sentences shown on the timeline card (max 320 chars).
highlights:                   # 3-5 bullets on the card
  - Designed and maintained CI/CD pipelines with GitLab CI and GitHub Actions.
  - Managed Kubernetes workloads on EKS/AKS/GKE with Helm and Terraform.
  - Second-line escalation for major incidents.
stack: [kubernetes, terraform, aws, azure, gitlab-ci]   # lower-case slugs -> /stack/[tech]
# logo: ../../assets/logos/acme.svg   # optional, relative to this file
order: 10                     # lower = higher on the timeline
featured: false
showLogo: true
tint: employment              # research | freelance | employment | academic | personal
---

Optional longer description in Markdown. Rendered on the Experience page below the highlights.
