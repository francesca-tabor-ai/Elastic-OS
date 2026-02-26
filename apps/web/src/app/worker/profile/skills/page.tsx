"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

function AddSkillForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get("workerId");
  const [skillName, setSkillName] = useState("");
  const [proficiency, setProficiency] = useState(3);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workerId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workers/${workerId}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName, proficiency }),
      });
      if (res.ok) router.push("/worker/profile");
      else alert((await res.json()).error);
    } finally {
      setSaving(false);
    }
  }

  if (!workerId) return <p>Missing workerId</p>;

  return (
    <main className="min-h-screen p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Skill</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Skill name</label>
          <input
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Proficiency (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={proficiency}
            onChange={(e) => setProficiency(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded"
        >
          {saving ? "Saving..." : "Add"}
        </button>
      </form>
      <Link href="/worker/profile" className="mt-4 inline-block text-sm text-blue-600">
        Back
      </Link>
    </main>
  );
}

export default function AddSkillPage() {
  return (
    <Suspense fallback={<main className="min-h-screen p-8"><p>Loading...</p></main>}>
      <AddSkillForm />
    </Suspense>
  );
}
