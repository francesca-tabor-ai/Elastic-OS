"use client";

import { useState } from "react";

interface Policy {
  id: string;
  name: string;
  maxEngagementThreshold: number;
  minEngagementThreshold: number;
  subsidyAmountPerWorker: number;
  totalBudget: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
  allocationCount: number;
}

interface Props {
  policies: Policy[];
}

export function SubsidyClient({ policies: initialPolicies }: Props) {
  const [policies, setPolicies] = useState(initialPolicies);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [eligible, setEligible] = useState<{ policyId: string; count: number; total: number } | null>(null);
  const [allocating, setAllocating] = useState(false);

  const refresh = () => {
    fetch("/api/government/subsidy-policies")
      .then((r) => r.json())
      .then((d) => setPolicies(d.policies ?? []));
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/government/subsidy-policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          maxEngagementThreshold: Number(fd.get("maxThreshold")) ?? 0.6,
          minEngagementThreshold: Number(fd.get("minThreshold")) ?? 0.2,
          subsidyAmountPerWorker: Number(fd.get("amount")) ?? 500,
          totalBudget: fd.get("budget") ? Number(fd.get("budget")) : null,
          effectiveFrom: fd.get("effectiveFrom") || new Date().toISOString().slice(0, 10),
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        form.reset();
        refresh();
      }
    } finally {
      setCreating(false);
    }
  };

  const checkEligible = async (policyId: string) => {
    const res = await fetch(
      `/api/government/subsidy-policies/${policyId}/eligible?periodStart=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&periodEnd=${new Date().toISOString()}`
    );
    const data = await res.json();
    setEligible({
      policyId,
      count: data.eligibleCount ?? 0,
      total: data.totalSubsidy ?? 0,
    });
  };

  const runAllocate = async (policyId: string) => {
    setAllocating(true);
    try {
      await fetch(`/api/government/subsidy-policies/${policyId}/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          periodEnd: new Date().toISOString(),
        }),
      });
      refresh();
      setEligible(null);
    } finally {
      setAllocating(false);
    }
  };

  const activate = async (policyId: string) => {
    await fetch(`/api/government/subsidy-policies/${policyId}/activate`, {
      method: "POST",
    });
    refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Subsidy policies</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded bg-foreground text-background text-sm font-medium"
        >
          {showCreate ? "Cancel" : "Create policy"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 rounded-lg border space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" required className="w-full px-3 py-2 rounded border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Max engagement (eligible if ≤)</label>
              <input name="maxThreshold" type="number" step="0.1" defaultValue="0.6" className="w-full px-3 py-2 rounded border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min engagement (must be ≥)</label>
              <input name="minThreshold" type="number" step="0.1" defaultValue="0.2" className="w-full px-3 py-2 rounded border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subsidy per worker (£/month)</label>
              <input name="amount" type="number" defaultValue="500" className="w-full px-3 py-2 rounded border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total budget (optional)</label>
              <input name="budget" type="number" className="w-full px-3 py-2 rounded border" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Effective from</label>
            <input name="effectiveFrom" type="date" className="w-full px-3 py-2 rounded border" />
          </div>
          <button type="submit" disabled={creating} className="px-4 py-2 rounded bg-foreground text-background font-medium disabled:opacity-50">
            Create
          </button>
        </form>
      )}

      <div className="space-y-4">
        {policies.map((p) => (
          <div key={p.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  Eligible: intensity ≤ {(p.maxEngagementThreshold * 100).toFixed(0)}% and ≥ {(p.minEngagementThreshold * 100).toFixed(0)}%
                </div>
                <div className="text-sm">£{p.subsidyAmountPerWorker}/worker • {p.allocationCount} allocations • {p.status}</div>
              </div>
              <div className="flex gap-2">
                {p.status === "DRAFT" && (
                  <button onClick={() => activate(p.id)} className="px-3 py-1 rounded border text-sm">
                    Activate
                  </button>
                )}
                <button onClick={() => checkEligible(p.id)} className="px-3 py-1 rounded border text-sm">
                  Preview eligible
                </button>
                <button
                  onClick={() => runAllocate(p.id)}
                  disabled={allocating || p.status === "DRAFT"}
                  className="px-3 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-50"
                >
                  Allocate
                </button>
              </div>
            </div>
            {eligible?.policyId === p.id && (
              <div className="mt-4 p-3 rounded bg-gray-50 dark:bg-gray-900 text-sm">
                {eligible.count} eligible workers • £{eligible.total.toLocaleString()} total
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <a
          href="/api/government/subsidy-allocations?format=csv"
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Export allocations (CSV)
        </a>
      </div>
    </div>
  );
}
