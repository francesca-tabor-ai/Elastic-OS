"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Opportunity {
  id: string;
  title: string;
  description?: string | null;
  engagementIntensity: number;
  durationMonths?: number | null;
  requiredSkills: string[];
  employerName: string;
  applicationCount?: number;
  createdAt?: string;
  skillMatchPct?: number;
}

interface Props {
  opportunities: Opportunity[];
  workerId?: string;
  employerId?: string;
  role: string;
}

export function OpportunitiesClient({
  opportunities: initialOpportunities,
  workerId,
  employerId,
  role,
}: Props) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [recommended, setRecommended] = useState<Array<Opportunity & { skillMatchPct?: number }>>([]);
  const [availability, setAvailability] = useState<{
    currentEngagement: number;
    maxEngagement: number;
    headroom: number;
    openToOpportunities: boolean;
  } | null>(null);

  useEffect(() => {
    if (workerId) {
      fetch(`/api/workers/${workerId}/availability`)
        .then((r) => r.ok ? r.json() : null)
        .then(setAvailability);
      fetch(`/api/workers/${workerId}/recommended-opportunities`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => setRecommended(data?.opportunities ?? []));
    }
  }, [workerId]);

  const refresh = () => {
    fetch("/api/opportunities")
      .then((r) => r.json())
      .then((data) => setOpportunities(data.opportunities ?? []));
  };

  return (
    <div className="space-y-8">
      {role === "WORKER" && availability && (
        <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold mb-4">Your availability</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Current engagement</span>
              <div className="font-medium">{(availability.currentEngagement * 100).toFixed(0)}%</div>
            </div>
            <div>
              <span className="text-gray-500">Max engagement</span>
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
          <Link
            href="/worker/elastic"
            className="mt-2 inline-block text-sm text-blue-600 hover:underline"
          >
            Manage availability
          </Link>
        </section>
      )}

      {role === "EMPLOYER" && (
        <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
          <Link
            href="/employer/opportunities"
            className="text-blue-600 hover:underline font-medium"
          >
            Manage your opportunities →
          </Link>
        </section>
      )}

      {workerId && recommended.length > 0 && (
        <section>
          <h2 className="font-semibold mb-4">Recommended for you</h2>
          <div className="space-y-4">
            {recommended.map((o) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                workerId={workerId}
                onApplied={refresh}
                skillMatchPct={o.skillMatchPct}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-4">All open opportunities</h2>
        {opportunities.length === 0 ? (
          <p className="text-gray-500">No open opportunities yet.</p>
        ) : (
          <div className="space-y-4">
            {opportunities.map((o) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                workerId={workerId}
                onApplied={refresh}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OpportunityCard({
  opportunity,
  workerId,
  onApplied,
  skillMatchPct,
}: {
  opportunity: Opportunity & { skillMatchPct?: number };
  workerId?: string;
  onApplied: () => void;
  skillMatchPct?: number;
}) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!workerId || applying || applied) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: null }),
      });
      if (res.ok) setApplied(true);
      else console.error(await res.text());
      onApplied();
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{opportunity.title}</h3>
          <div className="text-sm text-gray-500 mt-1">{opportunity.employerName}</div>
          {opportunity.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {opportunity.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
              {(opportunity.engagementIntensity * 100).toFixed(0)}% engagement
            </span>
            {opportunity.durationMonths && (
              <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                {opportunity.durationMonths} months
              </span>
            )}
            {opportunity.requiredSkills.slice(0, 5).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30">
                {s}
              </span>
            ))}
            {skillMatchPct != null && (
              <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30">
                {(skillMatchPct * 100).toFixed(0)}% match
              </span>
            )}
          </div>
        </div>
        {workerId && (
          <button
            onClick={handleApply}
            disabled={applying || applied}
            className="px-4 py-2 rounded bg-foreground text-background text-sm font-medium disabled:opacity-50"
          >
            {applied ? "Applied" : applying ? "Applying…" : "Apply"}
          </button>
        )}
      </div>
    </div>
  );
}
