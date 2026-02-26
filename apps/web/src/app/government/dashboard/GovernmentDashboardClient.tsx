"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SkillGraphAggregate {
  skills: Array<{
    skillName: string;
    workerCount: number;
    opportunityCount: number;
    avgProficiency: number;
  }>;
  totalSkills: number;
  totalWorkersWithSkills: number;
}

interface SkillSupplyDemand {
  skillName: string;
  supplyCount: number;
  demandCount: number;
  supplyDemandRatio: number;
  demandTrend: string | null;
}

interface ElasticIndex {
  engagementDistribution: { fullCount: number; partialCount: number; elasticCount: number; minimalCount: number };
  elasticityRate: number;
  meanContinuity: number;
  multiEmployerRate: number;
  totalWorkers: number;
  totalEmployers: number;
  opportunityPipeline: { openOpportunities: number; totalApplications: number };
}

interface ByIndustry {
  industry: string | null;
  count: number;
  elasticityRate: number;
}

interface Props {
  index: ElasticIndex;
  byIndustry: ByIndustry[];
}

export function GovernmentDashboardClient({ index: initialIndex, byIndustry: initialByIndustry }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [alerts, setAlerts] = useState<Array<{ id: string; alertType: string; severity: string; summary: string }>>([]);
  const [policies, setPolicies] = useState<Array<{ id: string; name: string; status: string; allocationCount: number }>>([]);
  const [snapshotting, setSnapshotting] = useState(false);
  const [skillGraph, setSkillGraph] = useState<SkillGraphAggregate | null>(null);
  const [supplyDemand, setSupplyDemand] = useState<SkillSupplyDemand[] | null>(null);

  useEffect(() => {
    fetch("/api/government/early-warning")
      .then((r) => r.ok ? r.json() : { alerts: [] })
      .then((d) => setAlerts(d.alerts ?? []));
    fetch("/api/government/subsidy-policies")
      .then((r) => r.ok ? r.json() : { policies: [] })
      .then((d) => setPolicies(d.policies ?? []));
    fetch("/api/government/skill-graph/aggregate")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setSkillGraph(d));
    fetch("/api/government/skill-graph/supply-demand")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setSupplyDemand(d?.supplyDemand ?? []));
  }, []);

  const takeSnapshot = async () => {
    setSnapshotting(true);
    try {
      const res = await fetch("/api/government/elastic-index/snapshot", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIndex(data);
      }
    } finally {
      setSnapshotting(false);
    }
  };

  const total =
    index.engagementDistribution.fullCount +
    index.engagementDistribution.partialCount +
    index.engagementDistribution.elasticCount +
    index.engagementDistribution.minimalCount;

  return (
    <div className="space-y-8">
      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Engagement intensity distribution</h2>
          <button
            onClick={takeSnapshot}
            disabled={snapshotting}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          >
            {snapshotting ? "Saving…" : "Save snapshot"}
          </button>
        </div>
        {total === 0 ? (
          <p className="text-gray-500">No affiliation data yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">{index.engagementDistribution.fullCount}</div>
              <div className="text-sm text-gray-500">Full (80%+)</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">{index.engagementDistribution.partialCount}</div>
              <div className="text-sm text-gray-500">Partial (50–80%)</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">{index.engagementDistribution.elasticCount}</div>
              <div className="text-sm text-gray-500">Elastic (30–50%)</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">{index.engagementDistribution.minimalCount}</div>
              <div className="text-sm text-gray-500">Minimal (&lt;30%)</div>
            </div>
          </div>
        )}
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">National metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold">{(index.elasticityRate * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Elasticity rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{(index.meanContinuity * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Mean continuity</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{(index.multiEmployerRate * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Multi-employer rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{index.totalWorkers}</div>
            <div className="text-sm text-gray-500">Total workers</div>
          </div>
        </div>
        <div className="mt-4 text-sm">
          Opportunities: {index.opportunityPipeline.openOpportunities} open,{" "}
          {index.opportunityPipeline.totalApplications} applications
        </div>
      </section>

      {initialByIndustry.length > 0 && (
        <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold mb-4">By industry</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Industry</th>
                <th className="text-left py-2">Count</th>
                <th className="text-left py-2">Elasticity</th>
              </tr>
            </thead>
            <tbody>
              {initialByIndustry.map((r, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{r.industry ?? "Unknown"}</td>
                  <td className="py-2">{r.count}</td>
                  <td className="py-2">{(r.elasticityRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">National Skill Graph</h2>
        {skillGraph ? (
          <>
            <div className="text-sm text-gray-500 mb-4">
              {skillGraph.totalSkills} skills across {skillGraph.totalWorkersWithSkills} workers
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b sticky top-0 bg-white dark:bg-gray-900">
                    <th className="text-left py-2">Skill</th>
                    <th className="text-right py-2">Workers</th>
                    <th className="text-right py-2">Demand</th>
                    <th className="text-right py-2">Avg proficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {skillGraph.skills.slice(0, 30).map((s, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">{s.skillName}</td>
                      <td className="py-2 text-right">{s.workerCount}</td>
                      <td className="py-2 text-right">{s.opportunityCount}</td>
                      <td className="py-2 text-right">{(s.avgProficiency * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {supplyDemand && supplyDemand.length > 0 && (
              <>
                <h3 className="font-medium mt-6 mb-2">Supply vs Demand</h3>
                <div className="overflow-x-auto max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b sticky top-0 bg-white dark:bg-gray-900">
                        <th className="text-left py-2">Skill</th>
                        <th className="text-right py-2">Supply</th>
                        <th className="text-right py-2">Demand</th>
                        <th className="text-right py-2">S/D ratio</th>
                        <th className="text-left py-2">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplyDemand.slice(0, 20).map((s, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{s.skillName}</td>
                          <td className="py-2 text-right">{s.supplyCount}</td>
                          <td className="py-2 text-right">{s.demandCount}</td>
                          <td className="py-2 text-right">{s.supplyDemandRatio.toFixed(2)}</td>
                          <td className="py-2">{s.demandTrend ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-gray-500">Loading skill graph…</p>
        )}
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Early warning alerts</h2>
        {alerts.length === 0 ? (
          <p className="text-gray-500">No active alerts.</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex justify-between items-center p-3 rounded bg-amber-50 dark:bg-amber-950/30"
              >
                <div>
                  <span className="font-medium">{a.alertType}</span>
                  <span className="ml-2 text-sm text-gray-500">({a.severity})</span>
                  <div className="text-sm mt-1">{a.summary}</div>
                </div>
                <button
                  onClick={async () => {
                    await fetch(`/api/government/early-warning/${a.id}/acknowledge`, {
                      method: "POST",
                    });
                    setAlerts((prev) => prev.filter((x) => x.id !== a.id));
                  }}
                  className="px-2 py-1 rounded border text-sm"
                >
                  Acknowledge
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={async () => {
            await fetch("/api/government/early-warning/trigger", { method: "POST" });
            const res = await fetch("/api/government/early-warning");
            const d = await res.json();
            setAlerts(d.alerts ?? []);
          }}
          className="mt-2 px-3 py-1 rounded border text-sm"
        >
          Check signals
        </button>
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Wage stabilisation</h2>
        <Link href="/government/subsidy" className="text-blue-600 hover:underline">
          Manage subsidy policies →
        </Link>
        {policies.length > 0 && (
          <div className="mt-4 space-y-2">
            {policies.slice(0, 5).map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span>{p.name}</span>
                <span className="text-gray-500">
                  {p.status} • {p.allocationCount} allocations
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
