# Phase 5 — Full Infrastructure Layer (36–60 Months)

**Goal:** Become the labour market operating system. ElasticOS as digital infrastructure that replaces layoffs.

---

## Vision

ElasticOS converts employment from a **binary state** (employed/unemployed) into a **continuous variable**:

**Engagement Intensity** E ∈ [0, 1]

| Value | Meaning |
|-------|---------|
| 1.0 | Full-time |
| 0.6 | Reduced-hours retention |
| 0.3 | Bench + upskilling |
| 0.1 | Institutional affiliation only |
| 0.0 | Terminated |

This becomes **measurable, verifiable, and economically actionable**.

### Structural Equivalence

| Layer | Provider | Purpose |
|-------|----------|---------|
| Signalling | LinkedIn | Identity layer |
| Compensation | Payroll systems | Payment layer |
| **Elasticity** | **ElasticOS** | Employment elasticity layer |

### Three Primary Actors

1. **Flexible Talent (Worker)** — Preserve affiliation, income continuity, signalling integrity
2. **Employer (Firm)** — Reduce labour costs without destroying human capital
3. **National Statistics / Union / Public Institutions** — System stabilisers

---

## MVP Feature Priority Order (Phases 0–4 Completed)

| Order | Feature | Status |
|-------|---------|--------|
| 1 | Identity system | ✅ Phase 0 |
| 2 | Employment affiliation ledger | ✅ Phase 0 |
| 3 | Engagement intensity control | ✅ Phase 1 |
| 4 | Compensation modulation engine | ✅ Phase 1 |
| 5 | Worker dashboard | ✅ Phase 1 |
| 6 | Employer dashboard | ✅ Phase 1 |
| 7+ | Phase 2–5 features | ✅ Phases 2–4 built; Phase 5 planned |

---

## Phase 5 Features

### Feature 16: Human Capital Balance Sheet Integration

**Purpose:** Employers report human capital as a balance sheet asset.

**Backend:** Accounting integration API

| Component | Description |
|-----------|-------------|
| Human Capital Asset Value | Replacement cost, capability rarity, productivity contribution, time-to-replacement |
| Export format | XBRL, IFRS-aligned, or custom schema for ERP/accounting systems |
| Integration targets | SAP, Oracle, Xero, QuickBooks |

**Schema:** Extend `HumanCapitalScore` aggregation; add `HumanCapitalReport` for periodic snapshots

**API:** `GET/POST /api/employers/[id]/human-capital-report`, `GET /api/employers/[id]/accounting-export`

---

### Feature 17: Elastic Employment Smart Contracts

**Purpose:** Automated elasticity agreements with contractual guarantees.

**Features:**

| Feature | Description |
|---------|-------------|
| Contractual elasticity bands | Min/max engagement over period; automatic triggers |
| Automatic compensation adjustment | Ledger updates when band conditions met |
| Guaranteed reactivation priority | Worker gets first refusal when capacity returns |
| Union / worker protection | Min income floors, max elasticity duration, transparent history |

**Backend:**

| Component | Description |
|-----------|-------------|
| Contract engine | Evaluate conditions (forecast, revenue) → trigger adjustments |
| Event sourcing | Kafka or equivalent for audit trail |
| Reactivation queue | Priority ordering when employer ramps up |

**Schema:** `ElasticityContract` (employer-worker terms, bands, guarantees)

---

### Feature 18: AI Workforce Planning Copilot

**Purpose:** Fully automated workforce optimisation.

**Features:**

| Feature | Description |
|---------|-------------|
| Hiring recommendations | When to hire vs. reactivate based on HC value, reactivation prob |
| Elasticity recommendations | Extends Phase 2 optimiser with full automation |
| Upskilling plans | Per-worker skill gap → training roadmap; integrates with Skill Depreciation |

**Backend:** Combines Phase 2 (HC, Reactivation, Optimiser) + Phase 8 (Skill Decay) into unified planning model

**API:** `POST /api/employers/[id]/workforce-plan/recommend`, streaming or batch

---

### Feature 19: National Skill Graph

**Purpose:** Maps capability distribution across the economy for policy and planning.

**Uses:**

| Use Case | Description |
|----------|-------------|
| Economic planning | Sector skill supply/demand; bottleneck identification |
| Education planning | Where to invest in training; curriculum alignment |
| Industrial policy | Strategic sector development |

**Technical:**

| Component | Description |
|-----------|-------------|
| Graph database | Neo4j or similar for skills → workers → employers → industries |
| Aggregation | Privacy-preserving; no PII at node level in public graph |
| APIs | `/api/government/skill-graph/aggregate`, `/api/government/skill-graph/supply-demand` |

**Schema:** Denormalised or separate graph DB; sync from `WorkerSkill`, `SkillMetadata`, `Opportunity.requiredSkills`

---

## Technical Architecture Stack (Phase 5+)

### Frontend

| Technology | Use |
|------------|-----|
| React | Web app (current) |
| TypeScript | Type safety |
| React Native | Mobile apps (worker wallet, employer mobile) |

### Backend

| Technology | Use |
|------------|-----|
| Node.js (current) | APIs, Next.js |
| Python | AI/ML pipelines, model serving |
| PostgreSQL | Primary DB (current) |
| Redis | Caching, session, queues |
| Kafka | Event streaming (contract triggers, audit) |

### AI / Data

| Technology | Use |
|------------|-----|
| PyTorch / TensorFlow | Optimisation, embedding models |
| Neo4j | Skill graph (Phase 5) |
| Existing heuristics | Phase 2–4 rule-based; gradual ML replacement |

### Infrastructure

| Technology | Use |
|------------|-----|
| AWS / GCP | Hosting |
| Kubernetes | Orchestration |
| Docker | Containers |

---

## System Architecture (Three Layers)

```
┌─────────────────────────────────────────────────────────────┐
│  Identity & Verification Layer                              │
│  Verifiable credentials, portable references, employment     │
│  ledger (Phase 0, 3 Feature 12)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Elastic Engagement Engine (AI Core)                         │
│  HC Value, Optimiser, Matching, Skill Decay, Reactivation   │
│  (Phases 2–3)                                               │
│  Phase 5: Copilot, Smart Contracts                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Labour Market Stabilisation Layer (Macro Interface)          │
│  NELI, Wage subsidies, Early warning (Phase 4)               │
│  Phase 5: National Skill Graph                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Worker Wallet (Elastic Identity Ledger)

**Contains:**

- Employment affiliations (active and elastic)
- Verified skill graph
- Engagement intensity history
- Income continuity score
- AI capability vector C_i(t)
- Upskilling history

**Worker Dashboard (Current + Phase 5):**

- Engagement intensity over time
- Institutional affiliation strength
- Skill depreciation risk (Phase 2)
- AI-recommended upskilling
- Matching opportunities (Phase 3)

---

## Employer Interface (Current + Phase 5)

**Elastic Workforce Control Panel (Phase 1):**

- Engagement intensity slider
- Compensation preview
- Bulk adjust

**AI Workforce Optimisation (Phase 2):**

- Optimal elasticity allocation
- Human capital ranking

**Phase 5 Additions:**

- Human Capital Balance Sheet export
- Smart contract setup
- AI Copilot recommendations

---

## Government Interface (Phase 4 + 5)

**Current:**

- National Elastic Labour Index
- Wage stabilisation
- Early warning system

**Phase 5:**

- National Skill Graph (aggregated)
- Economic/education planning APIs

---

## Revenue Model

| Stream | Description |
|--------|-------------|
| Employer subscription | Per employee / per roster |
| Government contracts | Labour stabilisation, NELI access |
| Analytics services | Custom dashboards, reports |
| Marketplace fees | Transaction fees on opportunity matches |

---

## Expected Adoption Order

1. Tech companies (early adopters)
2. Consulting firms
3. Financial services
4. Professional services
5. Government adoption (policy integration)

---

## Implementation Order (Phase 5)

| Order | Feature | Rationale |
|-------|---------|-----------|
| 1 | **Feature 19: National Skill Graph** | Foundation for policy; builds on existing `WorkerSkill`, `SkillMetadata` |
| 2 | **Feature 16: Human Capital Balance Sheet** | Accounting integration; extends existing HC scores |
| 3 | **Feature 18: AI Workforce Planning Copilot** | Unifies Phase 2 engines; high employer value |
| 4 | **Feature 17: Smart Contracts** | Most complex; event-driven; requires Kafka/infra |

---

## Definition

> ElasticOS is a digital infrastructure platform that enables firms to **dynamically modulate employment intensity** — rather than terminate employment — while preserving human capital continuity, signalling integrity, and labour market stability.

**Core Innovation:** Employment becomes a continuous variable E ∈ [0, 1], measurable and actionable.

**Example (Traditional vs Elastic):**

| Traditional | Elastic |
|-------------|---------|
| Downturn → layoff 30 engineers | Downturn → reduce to 0.4 engagement |
| Skills decay | Skills preserved |
| High rehiring cost | Rapid recovery |
| Slow recovery | Lower cost, higher stability |
