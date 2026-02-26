"use client";

const STATUS_LABELS: Record<string, string> = {
  FULL_ENGAGEMENT: "Full engagement",
  PARTIAL_ENGAGEMENT: "Partial engagement",
  ELASTIC_RETENTION: "Elastic retention",
  MINIMAL_AFFILIATION: "Minimal affiliation",
  FULLY_DETACHED: "Fully detached",
};

interface ActiveAffiliation {
  employerId: string;
  employerName: string;
  engagementIntensity: number;
  affiliationStatus: string;
  adjustedSalary: number | null;
  benefitsStatus: string | null;
  affiliationContinuityScore: number | null;
}

interface HistoryEntry {
  id: string;
  employerName: string;
  engagementIntensity: number;
  recordType: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export function WorkerElasticClient({
  activeAffiliations,
  history,
}: {
  workerId: string;
  activeAffiliations: ActiveAffiliation[];
  history: HistoryEntry[];
}) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold mb-4">Current affiliations</h2>
        {activeAffiliations.length === 0 ? (
          <p className="text-gray-500">No active affiliations.</p>
        ) : (
          <div className="space-y-4">
            {activeAffiliations.map((a) => (
              <div
                key={a.employerId}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="font-medium">{a.employerName}</div>
                <div className="mt-2 grid gap-2 text-sm">
                  <div>
                    Engagement:{" "}
                    {(a.engagementIntensity * 100).toFixed(0)}%
                  </div>
                  <div>
                    Status: {STATUS_LABELS[a.affiliationStatus] ?? a.affiliationStatus}
                  </div>
                  {a.adjustedSalary != null && (
                    <div>
                      Adjusted compensation: £
                      {a.adjustedSalary.toLocaleString()} /yr
                    </div>
                  )}
                  {a.affiliationContinuityScore != null && (
                    <div>
                      Continuity score:{" "}
                      {(a.affiliationContinuityScore * 100).toFixed(0)}%
                    </div>
                  )}
                  {a.benefitsStatus && (
                    <div>Benefits: {a.benefitsStatus.replace("_", " ")}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-4">Affiliation history</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No history yet.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((r) => (
              <li
                key={r.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{r.employerName}</span>
                  <span className="text-gray-500">{r.recordType}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {(r.engagementIntensity * 100).toFixed(0)}% •{" "}
                  {new Date(r.effectiveFrom).toLocaleDateString()}
                  {r.effectiveTo &&
                    ` – ${new Date(r.effectiveTo).toLocaleDateString()}`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
