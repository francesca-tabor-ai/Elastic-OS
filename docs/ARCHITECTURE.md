# ElasticOS Architecture

## Overview

ElasticOS transforms employment from binary states (employed/unemployed) into continuous, measurable engagement via **Engagement Intensity** E ∈ [0, 1].

## Phase 0 — Foundations

### System Architecture

```mermaid
flowchart TB
    subgraph frontend [Frontend - Next.js]
        WebApp[apps/web]
    end

    subgraph packages [Shared Packages]
        DB[packages/db - Prisma]
        Shared[packages/shared - Types]
        Auth[packages/auth - RBAC]
    end

    subgraph data [Data Layer]
        PostgreSQL[(PostgreSQL)]
    end

    WebApp --> DB
    WebApp --> Shared
    WebApp --> Auth
    DB --> PostgreSQL
```

### Build Order

1. **Stage 1: Identity** — Auth, RBAC, verification stubs
2. **Stage 2: Ledger** — Append-only affiliation records
3. **Stage 3: Worker Profile** — Skills, certs, portfolio
4. **Stage 4: Employer Registry** — Roster, departments, CSV import

### Data Flow

```mermaid
flowchart LR
    Worker[Worker] -->|creates| Affiliation[AffiliationRecord]
    Employer[Employer] -->|creates| Affiliation
    Affiliation -->|materialises| Snapshot[AffiliationSnapshot]
    Snapshot -->|powers| WorkerProfile[Worker Profile]
    Snapshot -->|powers| Roster[Workforce Roster]
```

### Key Invariants

- **Ledger**: Append-only; no updates or deletes on `AffiliationRecord`
- **RBAC**: Worker sees own data; Employer sees own roster; Government sees aggregated (Phase 4)
- **One active affiliation** per worker–employer pair at a time

### API Structure

| Domain | Base Path | Auth |
|--------|-----------|------|
| Auth | `/api/auth/*` | Public (register) / Session |
| Verify | `/api/verify/*` | Session |
| Ledger | `/api/ledger/*` | Session + RBAC |
| Workers | `/api/workers/*` | Session + Worker/Employer |
| Employers | `/api/employers/*` | Session + Employer |
