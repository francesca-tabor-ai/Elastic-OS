"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

function AddCertificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get("workerId");
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiryAt, setExpiryAt] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workerId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/workers/${workerId}/certifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          issuer,
          issuedAt,
          expiryAt: expiryAt || undefined,
          documentUrl: documentUrl || undefined,
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
      <h1 className="text-xl font-bold mb-4">Add Certification</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Issuer</label>
          <input
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Issued at</label>
          <input
            type="date"
            value={issuedAt}
            onChange={(e) => setIssuedAt(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expiry (optional)</label>
          <input
            type="date"
            value={expiryAt}
            onChange={(e) => setExpiryAt(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Document URL (optional)</label>
          <input
            type="url"
            value={documentUrl}
            onChange={(e) => setDocumentUrl(e.target.value)}
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

export default function AddCertificationPage() {
  return (
    <Suspense fallback={<main className="min-h-screen p-8"><p>Loading...</p></main>}>
      <AddCertificationForm />
    </Suspense>
  );
}
