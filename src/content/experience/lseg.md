---
company: London Stock Exchange Group
companyShort: LSEG
companyUrl: https://www.lseg.com
role: Senior DevOps Engineer
employmentType: full-time
location: Bucharest, Romania
startDate: 2025-09-01
endDate: null
summary: "DevOps and cloud engineering across the full delivery lifecycle: CI/CD, infrastructure as code, Kubernetes on AWS/Azure/GCP, observability, and second-line escalation for major incidents."
highlights:
  - Design and maintain CI/CD pipelines in GitLab CI, Jenkins and GitHub Actions, with schema-validation gates (yamllint, kubeconform, JSON Schema) that catch misconfigurations before deployment.
  - Infrastructure as code with Terraform, Ansible and Helm; containerised workloads on Kubernetes (EKS, AKS, GKE).
  - Workflow automation with Apache Airflow, AWX/Ansible Automation Platform and n8n (alerting, ServiceNow ticketing, notifications).
  - "Identity and access: OIDC SSO for internal platforms and Kubernetes, OIDC federation for CI/CD workload identity, LDAP/AD group-based RBAC across GitLab, Jenkins, Grafana and Vault."
  - Second-line escalation during major incidents; incident, change and problem management.
stack: [gitlab-ci, jenkins, github-actions, terraform, ansible, helm, kubernetes, aws, azure, gcp, docker, prometheus, grafana, elk, vault, sonarqube, airflow, awx, n8n, oidc, keycloak, ldap, python, bash, powershell, linux, windows-server, postgresql, mysql, mongodb]
order: 10
featured: true
tint: employment
---

Working in a DevOps and Cloud Engineering capacity with a strong focus on automation, scalability and reliability.

**Delivery pipelines.** CI/CD in GitLab CI, Jenkins and GitHub Actions. YAML/JSON schema validation is a core part of pipeline and configuration management: pipeline definitions, Kubernetes manifests, Helm values and Terraform/Ansible files are validated with yamllint, kubeval/kubeconform, JSON Schema (ajv, check-jsonschema) and custom pre-commit hooks, so misconfigurations fail early and templates stay standardised across teams.

**Automation and orchestration.** Apache Airflow DAGs for data and infrastructure workflows, AWX/Ansible Automation Platform for centralised, RBAC-controlled playbook execution, and n8n for event-driven integration between internal services (alerting, ServiceNow ticketing, notifications). Reusable, parameterised workflow templates reduce manual intervention.

**Cloud and observability.** AWS, Azure and GCP (EC2, S3, RDS, Lambda, AKS, GKE) built for high availability and disaster recovery; Prometheus, Grafana, ELK/EFK and CloudWatch for observability; Vault, SonarQube and automated policy enforcement embedded in pipelines.

**Identity.** OIDC-based SSO for internal platforms and Kubernetes clusters (Azure AD / Keycloak, kubectl OIDC), OIDC federation for CI/CD workload identity in AWS and Azure (no long-lived credentials), and LDAP/Active Directory integration for group-based RBAC across GitLab, Jenkins, Grafana and Vault.

**Operations.** Linux and Windows server administration, patching and performance tuning; MySQL, PostgreSQL, MongoDB and SQL Server; consistent environments from dev to production; Agile delivery with Jira, Asana and Clarity.
