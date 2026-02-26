"use client";

import { useState } from "react";
import Link from "next/link";

interface Skill {
  id: string;
  skillName: string;
  proficiency: number;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedAt: string;
  expiryAt: string | null;
  documentUrl: string | null;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  fileUrl: string | null;
}

interface EmployerRef {
  id: string;
  referenceText: string;
  status: string;
  employer: { employerProfile: { companyName: string } | null };
}

interface Profile {
  id: string;
  workerProfile: { headline: string | null; bio: string | null } | null;
  workerSkills: Skill[];
  certifications: Certification[];
  portfolioItems: PortfolioItem[];
  employerReferences: EmployerRef[];
}

export function WorkerProfileClient({
  workerId,
  initialProfile,
}: {
  workerId: string;
  initialProfile: Profile;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [headline, setHeadline] = useState(
    profile.workerProfile?.headline ?? ""
  );
  const [bio, setBio] = useState(profile.workerProfile?.bio ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSaveProfile() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/workers/${workerId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, bio }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEditing(false);
      setMessage("Profile saved");
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Profile</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="text-sm px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setHeadline(profile.workerProfile?.headline ?? "");
                  setBio(profile.workerProfile?.bio ?? "");
                }}
                className="text-sm px-3 py-1 border rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {message && <p className="text-sm text-green-600 mb-2">{message}</p>}
        {editing ? (
          <div className="space-y-2">
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Headline"
              className="w-full px-3 py-2 border rounded"
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
              rows={4}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        ) : (
          <div>
            <p className="font-medium">{profile.workerProfile?.headline || "—"}</p>
            <p className="mt-2 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {profile.workerProfile?.bio || "—"}
            </p>
          </div>
        )}
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Skills</h2>
        {profile.workerSkills.length === 0 ? (
          <p className="text-gray-500">No skills added yet</p>
        ) : (
          <ul className="space-y-2">
            {profile.workerSkills.map((s) => (
              <li key={s.id} className="flex justify-between">
                <span>{s.skillName}</span>
                <span className="text-gray-500">Proficiency: {s.proficiency}/5</span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/worker/profile/skills?workerId=${workerId}`}
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          Add skill
        </Link>
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Certifications</h2>
        {profile.certifications.length === 0 ? (
          <p className="text-gray-500">No certifications yet</p>
        ) : (
          <ul className="space-y-2">
            {profile.certifications.map((c) => (
              <li key={c.id}>
                <span className="font-medium">{c.name}</span> — {c.issuer}
                {c.documentUrl && (
                  <a
                    href={c.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-blue-600"
                  >
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/worker/profile/certifications?workerId=${workerId}`}
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          Add certification
        </Link>
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Portfolio</h2>
        {profile.portfolioItems.length === 0 ? (
          <p className="text-gray-500">No portfolio items yet</p>
        ) : (
          <ul className="space-y-2">
            {profile.portfolioItems.map((p) => (
              <li key={p.id}>
                <span className="font-medium">{p.title}</span>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-blue-600"
                  >
                    Link
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/worker/profile/portfolio?workerId=${workerId}`}
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          Add portfolio item
        </Link>
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Employment History</h2>
        <Link
          href="/worker/history"
          className="text-sm text-blue-600 hover:underline"
        >
          View affiliation history (from ledger)
        </Link>
      </section>
    </div>
  );
}
