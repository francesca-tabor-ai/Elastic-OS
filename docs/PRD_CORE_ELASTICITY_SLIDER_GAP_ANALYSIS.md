# PRD: Core Elasticity Slider — Gap Analysis & Implementation Roadmap

This document maps the Product Requirement Document (Core Elasticity Slider + Compensation Modulation Engine) to the current ElasticOS codebase, identifying gaps and proposing an implementation plan.

---

## 1. Backlog vs. Current State

| Priority | Feature | Status | Notes |
|----------|---------|--------|-------|
| **P0** | Secure Identity & Authentication | ✅ **Done** | User registration, login, MFA, Worker/Employer/Gov/Admin roles |
| **P0** | Employment Affiliation Ledger | ✅ **Done** | `AffiliationRecord`, `AffiliationSnapshot`, `createOrAdjustAffiliation`, append-only |
| **P0** | Engagement Intensity Control (Employer) | ⚠️ **Partial** | API + CSV import exist; **no slider UI** on employer dashboard |
| **P0** | Compensation Modulation Engine | ❌ **Missing** | No salary calculation, benefits logic, or adjusted compensation storage |
| **P1** | Worker Dashboard (Basic) | ⚠️ **Partial** | History page shows engagement %; **no current intensity card**, **no compensation display** |
| **P1** | Employer Dashboard (Basic) | ⚠️ **Partial** | Roster exists; **no engagement distribution**, **no cost savings** |
| **P2** | Notification System (Email/In-App) | ❌ **Missing** | No notifications on intensity change |
| **P2** | Audit Trail & Logging | ⚠️ **Partial** | Ledger records `createdBy`, timestamps; **no explicit audit log table** |
| **P3** | Basic Reporting (Employer) | ❌ **Missing** | — |

---

## 2. Key Gaps by Functional Spec

### 2.1 Engagement Intensity Input (Slider UI)

**PRD:** Slider 0.2–1.0 in increments of 0.1 on employer dashboard.

**Current:**
- Constants: `MIN_ENGAGEMENT_INTENSITY = 0`, `MAX_ENGAGEMENT_INTENSITY = 1` in `packages/shared`
- Validation in `createOrAdjustAffiliation` accepts 0–1
- **Employer roster** (`EmployerRosterClient.tsx`) shows table only; no slider, no intensity column
- CSV import supports engagement column; batch only, no per-worker UI

**Gaps:**
1. PRD specifies **0.2** as minimum (viable affiliation). Code allows **0**. Decide: align to 0.2 or keep 0 for termination.
2. **No slider component** — employer cannot adjust intensity per worker from the UI.
3. Roster table does not display current engagement intensity.

---

### 2.2 Compensation Calculation

**PRD:** `adjusted_salary = base_salary * engagement_intensity` (server-side).

**Current:**
- `WorkforceRoster` has `salaryBandId` → `SalaryBand` (min/max per role), **no per-worker `base_salary`**
- No compensation field on `AffiliationRecord` or `AffiliationSnapshot`
- No service that computes or stores adjusted salary

**Gaps:**
1. **Data model:** Add `baseSalary` (or equivalent) for workers. Options:
   - Add `baseSalary Decimal` to `WorkforceRoster` (per worker–employer pair)
   - Or derive from `SalaryBand` midpoint (less accurate)
2. **Engine:** Implement `adjustCompensation(workerId, firmId, newIntensity, baseSalary)` that:
   - Calculates `adjusted_salary`
   - Persists to ledger/snapshot or a new `CompensationRecord` table
3. **Benefits logic:** PRD mentions full (>0.8), pro-rated (0.5–0.8), minimal (<0.5). No benefits model exists yet — schema extension needed.

---

### 2.3 Real-Time Feedback (Employer)

**PRD:** Show estimated immediate and annual payroll savings as slider is adjusted.

**Current:**
- No payroll calculation or savings display anywhere.

**Gaps:**
1. API endpoint: e.g. `GET/POST /api/employers/[id]/roster/[workerId]/compensation-preview?intensity=0.5` returning:
   - Current vs. proposed compensation
   - Immediate and annual savings
2. Employer roster UI: Slider with live preview of savings before confirmation.

---

### 2.4 Worker Notification

**PRD:** Email + in-app notification within 5 minutes of confirmed intensity change.

**Current:**
- No notification system (no email, no in-app).

**Gaps:**
1. Notification infrastructure (e.g. Resend/SendGrid, in-app via DB + polling or WebSocket).
2. Event: on `createOrAdjustAffiliation` with `ADJUSTED`, emit notification.
3. Notification payload: new intensity, new compensation, optional reason from employer.

---

### 2.5 Audit Trail

**PRD:** Log who, when, previous/new values in immutable Affiliation Ledger.

**Current:**
- `AffiliationRecord` has: `createdBy`, `createdAt`, `effectiveFrom`, `effectiveTo`, `metadata`
- **No explicit `previousIntensity`** — derivable from prior record but not stored on record.
- Ledger is append-only; each change creates a new record. ✅ Adequate for audit.

**Gaps:**
1. Optional: add `previousIntensity` to `metadata` or as column for easier querying.
2. Optional: dedicated `AuditLog` table for compliance reporting (PRD says "comprehensive logging").

---

### 2.6 Worker Dashboard

**PRD:** Worker sees current intensity, compensation impact, and history.

**Current:**
- `WorkerHistoryPage` shows engagement % and dates; no current snapshot card.
- No compensation display.
- Worker does not see "current" affiliation in one place (e.g. "You are at 0.5 engagement with Firm X").

**Gaps:**
1. Worker dashboard: card with current intensity and adjusted compensation.
2. Use `getWorkerEmployerAffiliation` or similar to fetch current snapshot and render.
3. Add compensation to display once Compensation Engine exists.

---

### 2.7 Institutional Reference Preservation (Acceptance Criteria)

**PRD:** Verifiable digital reference stating "Affiliated at 0.3 engagement with [Firm Name]" + historical timeline.

**Current:**
- `EmployerReference` exists (pending/verified/rejected); different use case.
- Ledger + history provide timeline; no dedicated "reference document" or verification endpoint.

**Gaps:**
1. API: e.g. `GET /api/workers/[id]/affiliation-reference?employerId=X` returning:
   - Current status (e.g. "Affiliated at 0.3")
   - Historical timeline
   - Verifiable format (e.g. signed payload or hash for integrity)
2. Worker-facing "Reference" or "Employment Status" view/export.

---

## 3. Schema Changes Recommended

| Change | Purpose |
|--------|---------|
| `WorkforceRoster.baseSalary` (Decimal, nullable) | Per-worker base salary for compensation calculation |
| `AffiliationRecord` or new `CompensationRecord`: `adjustedSalary`, `benefitsStatus` | Store computed compensation with each intensity change |
| Optional: `Notification` / `NotificationEvent` tables | In-app notifications and delivery status |
| Optional: `AuditLog` | Explicit compliance audit trail |

---

## 4. Implementation Order

Suggested sequence aligned with PRD priorities:

1. **Engagement bounds:** Update `MIN_ENGAGEMENT_INTENSITY` to 0.2 if adopting PRD (or document why 0 is kept).
2. **Base salary:** Add `baseSalary` to `WorkforceRoster` (or agreed alternative); backfill/import path.
3. **Compensation Modulation Engine:** Service + API to compute and persist `adjusted_salary` on intensity change.
4. **Employer slider UI:** Add intensity slider (0.2–1.0, step 0.1) to roster row; call ledger API on confirm.
5. **Compensation preview API:** Endpoint for real-time savings as slider moves.
6. **Employer dashboard enhancements:** Engagement distribution, cost savings summary.
7. **Worker dashboard:** Current intensity + compensation card; enhance history view.
8. **Notification system:** Trigger on `ADJUSTED`; email + in-app.
9. **Audit / reference:** Enhance metadata or add AuditLog; implement reference API and worker view.

---

## 5. Files to Modify / Create

| Area | Files |
|------|-------|
| Shared | `packages/shared/src/index.ts` — consider MIN = 0.2 if adopting PRD |
| Schema | `packages/db/prisma/schema.prisma` — baseSalary, compensation fields |
| Ledger | `apps/web/src/lib/ledger.ts` — integrate compensation calc |
| New | `apps/web/src/lib/compensation.ts` — Compensation Modulation Engine |
| API | `apps/web/src/app/api/ledger/affiliations/route.ts` — pass baseSalary, return adjusted |
| API | `apps/web/src/app/api/employers/[employerId]/roster/[workerId]/preview/route.ts` — savings preview |
| Employer UI | `apps/web/src/app/employer/roster/EmployerRosterClient.tsx` — slider, savings display |
| Employer UI | Roster page — include snapshot, salaryBand/baseSalary in query |
| Worker UI | `apps/web/src/app/worker/history/page.tsx` — current snapshot card, compensation |
| Notifications | New routes and jobs for email/in-app |

---

## 6. Non-Functional Requirements

| NFR | Current | Notes |
|-----|---------|-------|
| **Performance (<500ms)** | Not measured | DB transaction is lightweight; add timing if needed |
| **Security** | Auth + RBAC in place | Encrypt at rest (DB); TLS in transit (standard) |
| **Atomicity** | `prisma.$transaction` in ledger | ✅ |
| **Scalability** | No load testing | Consider connection pooling, read replicas for reporting |

---

*Generated from PRD: Core Elasticity Slider + Compensation Modulation Engine. Last updated: 2025-02-26.*
