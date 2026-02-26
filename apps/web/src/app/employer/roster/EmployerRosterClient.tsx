"use client";

import { useState } from "react";
import { getAffiliationStatus } from "@/lib/compensation";

const STATUS_LABELS: Record<string, string> = {
  FULL_ENGAGEMENT: "Full",
  PARTIAL_ENGAGEMENT: "Partial",
  ELASTIC_RETENTION: "Elastic",
  MINIMAL_AFFILIATION: "Minimal",
  FULLY_DETACHED: "Detached",
};

interface Snapshot {
  engagementIntensity: { toString: () => string };
  adjustedSalary: { toString: () => string } | null;
  benefitsStatus: string | null;
}

interface RosterEntry {
  id: string;
  workerId: string;
  baseSalary: { toString: () => string } | null;
  worker: {
    user: { email: string };
    workerProfile: { headline: string | null } | null;
  };
  department: { id: string; name: string } | null;
  jobRole: { title: string } | null;
  contractType: { name: string } | null;
}

interface Department {
  id: string;
  name: string;
}

const CSV_TEMPLATE = `workerId,engagement,baseSalary
# workerId required. engagement 0-1 default 1. baseSalary optional
`;

export function EmployerRosterClient({
  employerId,
  initialRoster,
  snapshotByWorker,
  departments,
}: {
  employerId: string;
  initialRoster: RosterEntry[];
  snapshotByWorker: Record<string, Snapshot>;
  departments: Department[];
}) {
  const [roster, setRoster] = useState(initialRoster);
  const [snapshots, setSnapshots] = useState(snapshotByWorker);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [pendingIntensity, setPendingIntensity] = useState<
    Record<string, number>
  >({});
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkIntensity, setBulkIntensity] = useState(0.7);
  const [bulkDepartmentId, setBulkDepartmentId] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const res = await fetch(`/api/employers/${employerId}/roster/import`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult(`Imported ${data.created} workers.`);
        setImportFile(null);
        window.location.reload();
      } else {
        setImportResult(data.error ?? "Import failed");
      }
    } catch {
      setImportResult("Import failed");
    } finally {
      setImporting(false);
    }
  }

  function handleExport() {
    window.open(`/api/employers/${employerId}/roster/export`, "_blank");
  }

  async function handleIntensityChange(
    workerId: string,
    newIntensity: number
  ) {
    setAdjusting(workerId);
    try {
      const res = await fetch("/api/ledger/affiliations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId,
          employerId,
          engagementIntensity: newIntensity,
          recordType: "ADJUSTED",
        }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to update");
      }
    } finally {
      setAdjusting(null);
    }
  }

  async function handleBulkAdjust() {
    setBulkLoading(true);
    try {
      const body: { intensity: number; departmentId?: string } = {
        intensity: bulkIntensity,
      };
      if (bulkDepartmentId) body.departmentId = bulkDepartmentId;
      const res = await fetch(
        `/api/employers/${employerId}/roster/bulk-adjust`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setBulkOpen(false);
        window.location.reload();
      } else {
        alert(data.error ?? "Bulk adjust failed");
      }
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="p-4 rounded-ui border border-border">
        <h2 className="font-semibold mb-4">Import Roster</h2>
        <p className="text-sm text-foreground-muted mb-4">
          CSV: workerId, engagement (0-1), baseSalary (optional)
        </p>
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <button
            onClick={handleImport}
            disabled={!importFile || importing}
            className="px-4 py-2 rounded-ui bg-foreground text-background font-medium disabled:opacity-50"
          >
            {importing ? "Importing..." : "Import"}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 border border-border rounded-ui font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={() => setBulkOpen(true)}
            className="px-4 py-2 border border-border rounded-ui font-medium"
          >
            Bulk adjust
          </button>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`}
            download="roster-template.csv"
            className="text-sm text-accent hover:underline"
          >
            Download template
          </a>
        </div>
        {importResult && (
          <p className="mt-2 text-sm text-foreground-muted">
            {importResult}
          </p>
        )}
      </section>

      {bulkOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-ui max-w-md w-full border border-border">
            <h3 className="font-semibold mb-4">Bulk adjust engagement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Department (optional)
                </label>
                <select
                  value={bulkDepartmentId}
                  onChange={(e) => setBulkDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-ui"
                >
                  <option value="">All workers</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Engagement intensity (0-1)
                </label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={bulkIntensity}
                  onChange={(e) =>
                    setBulkIntensity(parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-border rounded-ui"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleBulkAdjust}
                disabled={bulkLoading}
                className="px-4 py-2 rounded-ui bg-foreground text-background"
              >
                {bulkLoading ? "Applying..." : "Apply"}
              </button>
              <button
                onClick={() => setBulkOpen(false)}
                className="px-4 py-2 border border-border rounded-ui"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="p-4 rounded-ui border border-border">
        <h2 className="font-semibold mb-4">Roster ({roster.length})</h2>
        {roster.length === 0 ? (
          <p className="text-foreground-subtle">
            No workers in roster. Import a CSV to add workers.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Department</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Contract</th>
                  <th className="text-left py-2">Intensity</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Compensation</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => {
                  const snap = snapshots[r.workerId];
                  const intensity = snap
                    ? Number(snap.engagementIntensity.toString())
                    : 1;
                  const status = getAffiliationStatus(intensity);
                  return (
                    <tr key={r.id} className="border-b">
                      <td className="py-2">
                        {r.worker?.user?.email ?? "—"}
                      </td>
                      <td className="py-2">{r.department?.name ?? "—"}</td>
                      <td className="py-2">{r.jobRole?.title ?? "—"}</td>
                      <td className="py-2">{r.contractType?.name ?? "—"}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.1}
                            value={
                              pendingIntensity[r.workerId] ?? intensity
                            }
                            disabled={!!adjusting}
                            onChange={(e) =>
                              setPendingIntensity((prev) => ({
                                ...prev,
                                [r.workerId]: parseFloat(
                                  e.target.value
                                ),
                              }))
                            }
                            onMouseUp={() => {
                              const val =
                                pendingIntensity[r.workerId] ??
                                intensity;
                              if (
                                Math.abs(val - intensity) >
                                0.001
                              )
                                handleIntensityChange(
                                  r.workerId,
                                  val
                                );
                              setPendingIntensity((prev) => {
                                const next = { ...prev };
                                delete next[r.workerId];
                                return next;
                              });
                            }}
                            onTouchEnd={() => {
                              const val =
                                pendingIntensity[r.workerId] ??
                                intensity;
                              if (
                                Math.abs(val - intensity) >
                                0.001
                              )
                                handleIntensityChange(
                                  r.workerId,
                                  val
                                );
                              setPendingIntensity((prev) => {
                                const next = { ...prev };
                                delete next[r.workerId];
                                return next;
                              });
                            }}
                            className="w-24"
                          />
                          <span className="text-xs w-10">
                            {(
                              (pendingIntensity[r.workerId] ??
                                intensity) * 100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                      </td>
                      <td className="py-2">
                        {STATUS_LABELS[status] ?? status}
                      </td>
                      <td className="py-2">
                        {snap?.adjustedSalary
                          ? `£${Number(
                              snap.adjustedSalary.toString()
                            ).toLocaleString()}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
