"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function AddPortfolioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get("workerId");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workerId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workers/${workerId}/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          url: url || undefined,
          fileUrl: fileUrl || undefined,
        }),
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
      <h1 className="text-xl font-bold mb-4">Add Portfolio Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL (optional)</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">File URL (optional)</label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
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
