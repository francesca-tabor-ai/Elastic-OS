import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation — ElasticOS",
  description: "Entities, endpoints, and CRUD operations for the ElasticOS API",
};

const ENTITIES = [
  { name: "User", table: "users", description: "Core identity with email, role (WORKER/EMPLOYER/GOVERNMENT)" },
  { name: "Account", table: "accounts", description: "OAuth provider account linking" },
  { name: "Session", table: "sessions", description: "User session tokens" },
  { name: "VerificationToken", table: "verification_tokens", description: "Email verification tokens" },
  { name: "MfaSecret", table: "mfa_secrets", description: "TOTP secrets for multi-factor auth" },
  { name: "Worker", table: "workers", description: "Worker profile, gov ID verification, MFA" },
  { name: "Employer", table: "employers", description: "Employer profile, Companies House verification" },
  { name: "VerificationLog", table: "verification_logs", description: "Append-only audit of verification attempts" },
  { name: "AffiliationRecord", table: "affiliation_records", description: "Worker–employer engagement ledger (ACTIVE/ADJUSTED/TERMINATED/REACTIVATED)" },
  { name: "AffiliationSnapshot", table: "affiliation_snapshots", description: "Current engagement intensity snapshot" },
  { name: "WorkerProfile", table: "worker_profiles", description: "Headline, bio" },
  { name: "WorkerSkill", table: "worker_skills", description: "Skills with proficiency, verified by employer" },
  { name: "Certification", table: "certifications", description: "Worker certifications, issuer, expiry" },
  { name: "PortfolioItem", table: "portfolio_items", description: "Worker portfolio entries" },
  { name: "EmployerReference", table: "employer_references", description: "Employer-provided references (PENDING/VERIFIED/REJECTED)" },
  { name: "EmployerProfile", table: "employer_profiles", description: "Company name, industry, size" },
  { name: "Department", table: "departments", description: "Organisation hierarchy" },
  { name: "JobRole", table: "job_roles", description: "Role titles, linked to department" },
  { name: "SalaryBand", table: "salary_bands", description: "Min/max pay, currency" },
  { name: "ContractType", table: "contract_types", description: "Contract types (including elastic)" },
  { name: "WorkforceRoster", table: "workforce_roster", description: "Worker–employer roster mapping" },
];

const ENDPOINTS = [
  { method: "GET", path: "/api/auth/me", crud: "Read", auth: true, description: "Current user, worker/employer IDs, verification status" },
  { method: "POST", path: "/api/auth/register", crud: "Create", auth: false, description: "Register user (Worker/Employer), creates User + Worker or Employer" },
  { method: "POST", path: "/api/auth/mfa/setup", crud: "Create", auth: true, description: "Generate MFA secret, QR code for TOTP" },
  { method: "POST", path: "/api/auth/mfa/verify", crud: "Update", auth: true, description: "Verify TOTP token, enable MFA on Worker" },
  { method: "POST", path: "/api/verify/gov-id", crud: "Update", auth: true, description: "Stub GOV.UK Verify — marks worker govtIdVerifiedAt" },
  { method: "POST", path: "/api/verify/employer", crud: "Update", auth: true, description: "Stub Companies House — verify employer legal entity" },
  { method: "*", path: "/api/auth/[...nextauth]", crud: "Read/Update", auth: "Session", description: "NextAuth: signin, signout, session, callbacks" },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          API Documentation
        </h1>
        <p className="text-[var(--muted)] mb-12">
          ElasticOS API — entities, endpoints, and CRUD operations
        </p>

        {/* Entities */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
            Entities
          </h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            Database models from the Prisma schema. All entities support standard CRUD via the Prisma client in backend code.
          </p>
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--border)]/50 text-left">
                  <th className="px-4 py-3 font-medium">Entity</th>
                  <th className="px-4 py-3 font-medium">Table</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {ENTITIES.map((e) => (
                  <tr key={e.name}>
                    <td className="px-4 py-3 font-mono text-[var(--accent)]">{e.name}</td>
                    <td className="px-4 py-3 font-mono text-[var(--muted)]">{e.table}</td>
                    <td className="px-4 py-3 text-[var(--foreground)]">{e.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
            API Endpoints
          </h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            REST endpoints exposed by the Next.js app. Base URL: <code className="bg-[var(--border)] px-1 rounded">/api</code>
          </p>
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--border)]/50 text-left">
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Path</th>
                  <th className="px-4 py-3 font-medium">CRUD</th>
                  <th className="px-4 py-3 font-medium">Auth</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {ENDPOINTS.map((ep) => (
                  <tr key={ep.path + ep.method}>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          ep.method === "GET"
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                            : ep.method === "POST"
                              ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                              : "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--accent)]">{ep.path}</td>
                    <td className="px-4 py-3">{ep.crud}</td>
                    <td className="px-4 py-3">{ep.auth === true ? "Session" : ep.auth === false ? "—" : ep.auth}</td>
                    <td className="px-4 py-3 text-[var(--foreground)]">{ep.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CRUD Summary */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 pb-2 border-b border-[var(--border)]">
            CRUD Summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="font-medium text-[var(--accent)] mb-2">Create</h3>
              <ul className="text-sm text-[var(--muted)] space-y-1">
                <li>POST /api/auth/register — User, Worker/Employer</li>
                <li>POST /api/auth/mfa/setup — MfaSecret (upsert)</li>
              </ul>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="font-medium text-[var(--accent)] mb-2">Read</h3>
              <ul className="text-sm text-[var(--muted)] space-y-1">
                <li>GET /api/auth/me — Current user</li>
                <li>NextAuth session endpoints</li>
              </ul>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="font-medium text-[var(--accent)] mb-2">Update</h3>
              <ul className="text-sm text-[var(--muted)] space-y-1">
                <li>POST /api/auth/mfa/verify — Worker.mfaEnabled</li>
                <li>POST /api/verify/gov-id — Worker.govtIdVerifiedAt</li>
                <li>POST /api/verify/employer — Employer legal entity</li>
              </ul>
            </div>
            <div className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="font-medium text-[var(--accent)] mb-2">Delete</h3>
              <ul className="text-sm text-[var(--muted)] space-y-1">
                <li>No dedicated delete endpoints exposed via HTTP API</li>
                <li>Handled via Prisma in backend code</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
