# User Stories: Government

**Test account:** `government@demo.elasticos.com` / `Demo123!`

---

## Authentication & Access

- **US-G01** — As a Government user, I want to log in with my email and password so that I can access ElasticOS for oversight and compliance.
- **US-G02** — As a Government user, I want to sign out so that my session is securely ended.
- **US-G03** — As a Government user, I want to see my role (Government) on the dashboard so that I know I am in the right account.

---

## Employment Affiliation Ledger (Cross-Org Oversight)

- **US-G04** — As a Government user, I want to create affiliation records (ACTIVE, ADJUSTED, TERMINATED, REACTIVATED) for any worker–employer pair so that I can correct or administratively adjust the ledger when needed.
- **US-G05** — As a Government user, I want to view any worker’s affiliation history via the API so that I can audit employment across employers.
- **US-G06** — As a Government user, I want to view any employer’s affiliation history via the API so that I can audit workforce engagement at the organisation level.
- **US-G07** — As a Government user, I want to view the current affiliation status for a specific worker–employer pair so that I can verify engagement intensity and record type.
- **US-G08** — As a Government user, I want to set engagement intensity (0–1) when creating or adjusting affiliations so that I can support administrative interventions (e.g. furlough-style adjustments).

---

## Audit & Compliance

- **US-G09** — As a Government user, I want the ledger to record who created each affiliation (`createdBy`) so that there is an audit trail for regulatory compliance.
- **US-G10** — As a Government user, I want the ledger to be append-only so that historical records cannot be altered or deleted.

---

## App Marketplace

- **US-G11** — As a Government user, I want to access the App Marketplace from my dashboard so that I can use compliance and reporting tools.

---

## Future (Phase 4)

- **US-G12** — As a Government user, I want to see aggregated labour market views (e.g. engagement distribution, sector trends) so that I can inform policy and monitor elastic employment at scale.
- **US-G13** — As a Government user, I want a dedicated Government portal with dashboards and reporting so that I can perform oversight without using APIs directly.
