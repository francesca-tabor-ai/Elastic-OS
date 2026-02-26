"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

interface SkillDecayEntry {
  skillName: string;
  decayScore: number;
  halfLifeMonths: number;
  upskillSuggestions: string[];
}

export function WorkerElasticClient({
  workerId,
  activeAffiliations,
  history,
}: {
  workerId: string;
  activeAffiliations: ActiveAffiliation[];
  history: HistoryEntry[];
}) {
  const [skillDecay, setSkillDecay] = useState<SkillDecayEntry[] | null>(null);
  const [availability, setAvailability] = useState<{
    currentEngagement: number;
    maxEngagement: number;
    headroom: number;
    openToOpportunities: boolean;
  } | null>(null);
  const [savingAvailability, setSavingAvailability] = useState(false);

  useEffect(() => {
    fetch(`/api/workers/${workerId}/skill-decay`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setSkillDecay(data?.skills ?? []))
      .catch(() => setSkillDecay([]));
  }, [workerId]);

  useEffect(() => {
    fetch(`/api/workers/${workerId}/availability`)
      .then((r) => r.ok ? r.json() : null)
      .then(setAvailability);
  }, [workerId]);

  const updateAvailability = async (updates: { maxTotalEngagement?: number; openToOpportunities?: boolean }) => {
    setSavingAvailability(true);
    try {
      const res = await fetch(`/api/workers/${workerId}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setAvailability(data);
      }
    } finally {
      setSavingAvailability(false);
    }
  };

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

      {availability && (
        <section>
          <h2 className="font-semibold mb-4">Multi-employer availability</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Set your max total engagement and whether you're open to additional opportunities.
          </p>
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Current</span>
                <div className="font-medium">{(availability.currentEngagement * 100).toFixed(0)}%</div>
              </div>
              <div>
                <span className="text-gray-500">Max total</span>
                <div className="font-medium">{(availability.maxEngagement * 100).toFixed(0)}%</div>
              </div>
              <div>
                <span className="text-gray-500">Headroom</span>
                <div className="font-medium text-green-600">{(availability.headroom * 100).toFixed(0)}%</div>
              </div>
              <div>
                <span className="text-gray-500">Open to opportunities</span>
                <div className="font-medium">{availability.openToOpportunities ? "Yes" : "No"}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center gap-2">
                <span className="text-sm">Max engagement:</span>
                <select
                  value={Number(availability.maxEngagement)}
                  onChange={(e) => updateAvailability({ maxTotalEngagement: Number(e.target.value) })}
                  disabled={savingAvailability}
                  className="px-2 py-1 rounded border"
                >
                  {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2].map((v) => (
                    <option key={v} value={v}>{(v * 100).toFixed(0)}%</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={availability.openToOpportunities}
                  onChange={(e) => updateAvailability({ openToOpportunities: e.target.checked })}
                  disabled={savingAvailability}
                />
                <span className="text-sm">Open to new opportunities</span>
              </label>
            </div>
            <Link href="/opportunities" className="text-sm text-blue-600 hover:underline">
              Browse opportunities →
            </Link>
          </div>
        </section>
      )}

      {skillDecay !== null && skillDecay.length > 0 && (
        <section>
          <h2 className="font-semibold mb-4">Skill depreciation insights</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Predicted skill obsolescence risk and upskilling recommendations.
          </p>
          <div className="space-y-4">
            {skillDecay.map((s) => (
              <div
                key={s.skillName}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="font-medium">{s.skillName}</div>
                <div className="mt-2 text-sm">
                  Decay score: {(s.decayScore * 100).toFixed(0)}% (1 = no decay)
                </div>
                {s.halfLifeMonths && (
                  <div className="text-sm text-gray-500">
                    Half-life: {s.halfLifeMonths} months
                  </div>
                )}
                {s.upskillSuggestions.length > 0 && (
                  <div className="mt-2 text-sm">
                    Upskilling suggestions:{" "}
                    {s.upskillSuggestions.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

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
