"use client";

import { useState, useEffect } from "react";

interface Props {
  employerId: string;
  engagementDistribution: {
    fullCount: number;
    partialCount: number;
    elasticCount: number;
    minimalCount: number;
  };
  currentPayroll: number;
  fullCapacityPayroll: number;
  savings: number;
}

interface OptimisationRecommendation {
  workerId: string;
  email: string;
  currentIntensity: number;
  suggestedIntensity: number;
  rationale: string;
  humanCapitalScore: number;
  reactivation90: number;
}

export function EmployerDashboardClient({
  employerId,
  engagementDistribution,
  currentPayroll,
  fullCapacityPayroll,
  savings,
}: Props) {
  const [targetReduction, setTargetReduction] = useState(10);
  const [optimising, setOptimising] = useState(false);
  const [optimisationResult, setOptimisationResult] = useState<{
    runId: string;
    recommendations: OptimisationRecommendation[];
    summary: { workersAffected: number; savings: number };
  } | null>(null);
  const [applying, setApplying] = useState(false);
  const [hcReport, setHcReport] = useState<{
    totalAssetValue: number;
    workerCount: number;
    reportDate: string;
  } | null>(null);
  const [hcLoading, setHcLoading] = useState(false);
  const [workforcePlan, setWorkforcePlan] = useState<{
    summary: { suggestReactivate: number; suggestReduce: number; suggestUpskill: number };
    hiringRecommendations: Array<{ type: string; rationale: string }>;
    upskillingPlans: Array<{ skillName: string; priority: string }>;
  } | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [contracts, setContracts] = useState<Array<{ id: string; workerId: string; minEngagement: number; maxEngagement: number; status: string }>>([]);
  const [reactivationQueue, setReactivationQueue] = useState<Array<{ workerId: string; priority: number; contractId: string }>>([]);

  useEffect(() => {
    fetch(`/api/employers/${employerId}/human-capital-report`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setHcReport({ totalAssetValue: d.totalAssetValue, workerCount: d.workerCount, reportDate: d.reportDate }));
    fetch(`/api/employers/${employerId}/elasticity-contracts`)
      .then((r) => r.ok ? r.json() : { contracts: [] })
      .then((d) => setContracts(d.contracts ?? []));
    fetch(`/api/employers/${employerId}/reactivation-queue`)
      .then((r) => r.ok ? r.json() : { queue: [] })
      .then((d) => setReactivationQueue(d.queue ?? []));
  }, [employerId]);

  const total =
    engagementDistribution.fullCount +
    engagementDistribution.partialCount +
    engagementDistribution.elasticCount +
    engagementDistribution.minimalCount;

  return (
    <div className="space-y-8">
      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Workforce engagement distribution</h2>
        {total === 0 ? (
          <p className="text-gray-500">No workers with active affiliations yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">
                {engagementDistribution.fullCount}
              </div>
              <div className="text-sm text-gray-500">Full engagement (80%+)</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">
                {engagementDistribution.partialCount}
              </div>
              <div className="text-sm text-gray-500">Partial (50-80%)</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">
                {engagementDistribution.elasticCount}
              </div>
              <div className="text-sm text-gray-500">Elastic retention (30-50%)</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">
                {engagementDistribution.minimalCount}
              </div>
              <div className="text-sm text-gray-500">Minimal (&lt;30%)</div>
            </div>
          </div>
        )}
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Payroll elasticity</h2>
        <div className="space-y-2">
          <div>
            Current payroll (at engagement levels): £
            {currentPayroll.toLocaleString()}
          </div>
          <div>
            Full capacity payroll (all at 100%): £
            {fullCapacityPayroll.toLocaleString()}
          </div>
          <div className="font-medium text-green-600 dark:text-green-400">
            Savings from elasticity: £{savings.toLocaleString()}
          </div>
        </div>
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Cost savings vs layoff</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          By using elastic engagement instead of layoffs, you retain human
          capital and avoid rehiring costs. Workers in elastic retention remain
          affiliated and can be reactivated when demand recovers.
        </p>
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">AI Elasticity Optimisation</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Target a payroll reduction and get AI-powered engagement recommendations
          that prioritise retaining high-value workers.
        </p>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <label className="flex items-center gap-2">
            <span className="text-sm">Target payroll reduction:</span>
            <input
              type="number"
              min={0}
              max={50}
              value={targetReduction}
              onChange={(e) => setTargetReduction(Number(e.target.value))}
              className="w-20 px-2 py-1 rounded border"
            />
            <span>%</span>
          </label>
          <button
            onClick={async () => {
              setOptimising(true);
              setOptimisationResult(null);
              try {
                const res = await fetch(`/api/employers/${employerId}/optimise`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    targetPayrollReductionPercent: targetReduction,
                    minEngagement: 0.3,
                  }),
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setOptimisationResult(data);
              } catch (err) {
                console.error(err);
                setOptimisationResult({
                  runId: "",
                  recommendations: [],
                  summary: { workersAffected: 0, savings: 0 },
                });
              } finally {
                setOptimising(false);
              }
            }}
            disabled={optimising}
            className="px-4 py-2 rounded bg-foreground text-background text-sm font-medium disabled:opacity-50"
          >
            {optimising ? "Running…" : "Run optimisation"}
          </button>
        </div>
        {optimisationResult && (
          <div className="mt-4 space-y-4">
            <div className="text-sm">
              {optimisationResult.recommendations.length} workers affected • £
              {optimisationResult.summary.savings.toLocaleString()} savings
            </div>
            {optimisationResult.recommendations.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Current</th>
                      <th className="text-left py-2">Suggested</th>
                      <th className="text-left py-2">Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimisationResult.recommendations.map((r) => (
                      <tr key={r.workerId} className="border-b">
                        <td className="py-2">{r.email}</td>
                        <td className="py-2">
                          {(r.currentIntensity * 100).toFixed(0)}%
                        </td>
                        <td className="py-2">
                          {(r.suggestedIntensity * 100).toFixed(0)}%
                        </td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">
                          {r.rationale}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {optimisationResult.recommendations.length > 0 &&
              optimisationResult.runId && (
                <button
                  onClick={async () => {
                    setApplying(true);
                    try {
                      const res = await fetch(
                        `/api/employers/${employerId}/optimise/apply`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            runId: optimisationResult.runId,
                          }),
                        }
                      );
                      if (!res.ok) throw new Error(await res.text());
                      setOptimisationResult(null);
                      window.location.reload();
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setApplying(false);
                    }
                  }}
                  disabled={applying}
                  className="mt-2 px-4 py-2 rounded bg-green-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  {applying ? "Applying…" : "Apply recommendations"}
                </button>
              )}
          </div>
        )}
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Human Capital Balance Sheet</h2>
        {hcLoading ? (
          <p className="text-gray-500">Loading…</p>
        ) : hcReport ? (
          <div className="space-y-2">
            <div>
              Total asset value: £{hcReport.totalAssetValue.toLocaleString()}
            </div>
            <div>
              Workers: {hcReport.workerCount}
              {hcReport.reportDate && (
                <span className="text-sm text-gray-500 ml-2">
                  (as of {hcReport.reportDate})
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={async () => {
                  setHcLoading(true);
                  try {
                    await fetch(`/api/employers/${employerId}/human-capital-report`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({}),
                    });
                    const r = await fetch(`/api/employers/${employerId}/human-capital-report`);
                    const d = await r.json();
                    setHcReport({
                      totalAssetValue: d.totalAssetValue,
                      workerCount: d.workerCount,
                      reportDate: d.reportDate,
                    });
                  } finally {
                    setHcLoading(false);
                  }
                }}
                className="px-3 py-1 rounded border text-sm"
              >
                Refresh report
              </button>
              <a
                href={`/api/employers/${employerId}/accounting-export?format=json`}
                className="px-3 py-1 rounded border text-sm inline-block"
              >
                Export JSON
              </a>
              <a
                href={`/api/employers/${employerId}/accounting-export?format=csv`}
                className="px-3 py-1 rounded border text-sm inline-block"
              >
                Export CSV
              </a>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No report yet.</p>
        )}
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">AI Workforce Planning Copilot</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Get unified recommendations for reactivation, elasticity and upskilling.
        </p>
        <button
          onClick={async () => {
            setCopilotLoading(true);
            try {
              const res = await fetch(`/api/employers/${employerId}/workforce-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
              });
              const d = await res.json();
              setWorkforcePlan({
                summary: d.summary ?? { suggestReactivate: 0, suggestReduce: 0, suggestUpskill: 0 },
                hiringRecommendations: d.hiringRecommendations ?? [],
                upskillingPlans: (d.upskillingPlans ?? []).map((u: { skillName: string; priority: string }) => ({
                  skillName: u.skillName,
                  priority: u.priority,
                })),
              });
            } catch {
              setWorkforcePlan(null);
            } finally {
              setCopilotLoading(false);
            }
          }}
          disabled={copilotLoading}
          className="px-4 py-2 rounded bg-foreground text-background text-sm font-medium disabled:opacity-50"
        >
          {copilotLoading ? "Loading…" : "Get plan"}
        </button>
        {workforcePlan && (
          <div className="mt-4 space-y-2 text-sm">
            <div>
              Reactivate: {workforcePlan.summary.suggestReactivate} · Reduce:{" "}
              {workforcePlan.summary.suggestReduce} · Upskill:{" "}
              {workforcePlan.summary.suggestUpskill}
            </div>
            {workforcePlan.hiringRecommendations.length > 0 && (
              <div>
                <span className="font-medium">Reactivation:</span>{" "}
                {workforcePlan.hiringRecommendations
                  .filter((h) => h.type === "REACTIVATE")
                  .slice(0, 3)
                  .map((h) => h.rationale)
                  .join("; ")}
              </div>
            )}
            {workforcePlan.upskillingPlans.length > 0 && (
              <div>
                <span className="font-medium">Upskilling:</span>{" "}
                {workforcePlan.upskillingPlans
                  .slice(0, 3)
                  .map((u) => `${u.skillName} (${u.priority})`)
                  .join(", ")}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Elasticity Contracts</h2>
        {contracts.length === 0 ? (
          <p className="text-gray-500">No elasticity contracts.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Worker</th>
                  <th className="text-left py-2">Range</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.slice(0, 10).map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="py-2">{c.workerId.slice(0, 8)}…</td>
                    <td className="py-2">
                      {(Number(c.minEngagement) * 100).toFixed(0)}%–{(Number(c.maxEngagement) * 100).toFixed(0)}%
                    </td>
                    <td className="py-2">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Reactivation Queue</h2>
        {reactivationQueue.length === 0 ? (
          <p className="text-gray-500">No workers in reactivation queue.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {reactivationQueue.slice(0, 10).map((r, i) => (
              <li key={r.contractId}>
                {i + 1}. Worker {r.workerId.slice(0, 8)}… (priority: {r.priority})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
