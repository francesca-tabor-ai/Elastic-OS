"use client";

import { useState } from "react";

interface RosterEntry {
  id: string;
  workerId: string;
  worker: {
    user: { email: string };
    workerProfile: { headline: string | null } | null;
  };
  department: { name: string } | null;
  jobRole: { title: string } | null;
  contractType: { name: string } | null;
}

const CSV_TEMPLATE = `workerId,engagement
# Add worker IDs from Worker accounts. engagement is 0-1, default 1
`;

export function EmployerRosterClient({
  employerId,
  initialRoster,
}: {
  employerId: string;
  initialRoster: RosterEntry[];
}) {
  const [roster, setRoster] = useState(initialRoster);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Import Roster</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          CSV format: workerId, engagement (optional, 0-1, default 1)
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
            className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium disabled:opacity-50"
          >
            {importing ? "Importing..." : "Import"}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 border rounded font-medium"
          >
            Export CSV
          </button>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`}
            download="roster-template.csv"
            className="text-sm text-blue-600 hover:underline"
          >
            Download template
          </a>
        </div>
        {importResult && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{importResult}</p>
        )}
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Roster ({roster.length})</h2>
        {roster.length === 0 ? (
          <p className="text-gray-500">No workers in roster. Import a CSV to add workers.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Department</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Contract</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2">{r.worker?.user?.email ?? "—"}</td>
                    <td className="py-2">{r.department?.name ?? "—"}</td>
                    <td className="py-2">{r.jobRole?.title ?? "—"}</td>
                    <td className="py-2">{r.contractType?.name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
