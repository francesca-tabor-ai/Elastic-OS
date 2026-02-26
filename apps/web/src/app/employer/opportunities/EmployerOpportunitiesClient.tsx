"use client";

import { useState } from "react";

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  engagementIntensity: number;
  durationMonths: number | null;
  requiredSkills: string[];
  status: string;
  applicationCount: number;
  createdAt: string;
}

interface Props {
  employerId: string;
  opportunities: Opportunity[];
}

export function EmployerOpportunitiesClient({
  employerId,
  opportunities: initialOpportunities,
}: Props) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<string | null>(null);
  const [applications, setApplications] = useState<
    Array<{ id: string; workerId: string; email: string; status: string; skills: string[] }>
  >([]);

  const refresh = () => {
    fetch(`/api/employers/${employerId}/opportunities`)
      .then((r) => r.json())
      .then((data) => setOpportunities(data.opportunities ?? []));
  };

  const loadApplications = (oppId: string) => {
    setSelectedOpp(oppId);
    fetch(`/api/opportunities/${oppId}/applications`)
      .then((r) => r.json())
      .then((data) => setApplications(data.applications ?? []));
  };

  const handleAccept = async (oppId: string, appId: string) => {
    const res = await fetch(
      `/api/opportunities/${oppId}/applications/${appId}/accept`,
      { method: "POST" }
    );
    if (res.ok) {
      loadApplications(oppId);
      refresh();
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch(`/api/employers/${employerId}/opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description") || null,
          engagementIntensity: Number(fd.get("intensity")) || 0.5,
          durationMonths: fd.get("duration") ? Number(fd.get("duration")) : null,
          requiredSkills: (fd.get("skills") as string)
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) ?? [],
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        form.reset();
        refresh();
      }
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">Your opportunities</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded bg-foreground text-background text-sm font-medium"
        >
          {showCreate ? "Cancel" : "Create opportunity"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 rounded-lg border space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input name="title" required className="w-full px-3 py-2 rounded border" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" rows={3} className="w-full px-3 py-2 rounded border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Engagement % (0.1-1)</label>
              <input
                name="intensity"
                type="number"
                step="0.1"
                min="0.1"
                max="1"
                defaultValue="0.5"
                className="w-full px-3 py-2 rounded border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (months)</label>
              <input
                name="duration"
                type="number"
                min="1"
                className="w-full px-3 py-2 rounded border"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Required skills (comma-separated)</label>
            <input
              name="skills"
              placeholder="react, typescript, node.js"
              className="w-full px-3 py-2 rounded border"
            />
          </div>
          <button
            type="submit"
            disabled={createLoading}
            className="px-4 py-2 rounded bg-foreground text-background font-medium disabled:opacity-50"
          >
            Create
          </button>
        </form>
      )}

      <div className="space-y-4">
        {opportunities.map((o) => (
          <div
            key={o.id}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-800"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{o.title}</h3>
                <div className="mt-2 text-sm text-gray-500">
                  {(o.engagementIntensity * 100).toFixed(0)}% • {o.status} •{" "}
                  {o.applicationCount} applications
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {o.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => loadApplications(o.id)}
                className="px-3 py-1 rounded border text-sm"
              >
                View applications
              </button>
            </div>
            {selectedOpp === o.id && applications.length > 0 && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="font-medium text-sm">Applications</div>
                {applications.map((a) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-900"
                  >
                    <div>
                      <span className="font-medium">{a.email}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {a.skills.join(", ")}
                      </span>
                    </div>
                    {a.status === "PENDING" && (
                      <button
                        onClick={() => handleAccept(o.id, a.id)}
                        className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                      >
                        Accept
                      </button>
                    )}
                    {a.status !== "PENDING" && (
                      <span className="text-sm text-gray-500">{a.status}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
