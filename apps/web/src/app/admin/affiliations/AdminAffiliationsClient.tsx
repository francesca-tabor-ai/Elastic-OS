"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "../components/AdminDataTable";
import { Modal } from "../components/Modal";

type AffiliationRecord = {
  id: string;
  workerId: string;
  employerId: string;
  engagementIntensity: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  recordType: string;
  worker?: { user?: { email: string } } | null;
  employer?: { user?: { email: string } } | null;
};

export function AdminAffiliationsClient() {
  const [data, setData] = useState<AffiliationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    workerId: "",
    employerId: "",
    engagementIntensity: "1",
    recordType: "ACTIVE",
  });
  const [workers, setWorkers] = useState<{ id: string; user?: { email: string } }[]>([]);
  const [employers, setEmployers] = useState<{ id: string; user?: { email: string } }[]>([]);

  async function fetchData() {
    setLoading(true);
    try {
      const [affRes, workersRes, employersRes] = await Promise.all([
        fetch("/api/admin/affiliations"),
        fetch("/api/admin/workers"),
        fetch("/api/admin/employers"),
      ]);
      if (!affRes.ok) throw new Error("Failed to fetch");
      const json = await affRes.json();
      setData(json);
      if (workersRes.ok) {
        const w = await workersRes.json();
        setWorkers(w);
      }
      if (employersRes.ok) {
        const e = await employersRes.json();
        setEmployers(e);
      }
    } catch {
      setError("Failed to load affiliations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreate() {
    setForm({
      workerId: workers[0]?.id ?? "",
      employerId: employers[0]?.id ?? "",
      engagementIntensity: "1",
      recordType: "ACTIVE",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/affiliations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: form.workerId,
          employerId: form.employerId,
          engagementIntensity: parseFloat(form.engagementIntensity),
          recordType: form.recordType,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  async function handleDelete(row: AffiliationRecord) {
    if (!confirm("Delete this affiliation record?")) return;
    try {
      const res = await fetch(`/api/admin/affiliations/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
    } catch {
      setError("Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Affiliation Records</h1>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <AdminDataTable
        columns={[
          { key: "recordType", label: "Type" },
          {
            key: "worker",
            label: "Worker",
            render: (r) => r.worker?.user?.email ?? r.workerId,
          },
          {
            key: "employer",
            label: "Employer",
            render: (r) => r.employer?.user?.email ?? r.employerId,
          },
          { key: "engagementIntensity", label: "Intensity" },
          {
            key: "effectiveFrom",
            label: "From",
            render: (r) => new Date(r.effectiveFrom).toLocaleDateString(),
          },
        ]}
        data={data}
        onDelete={handleDelete}
        onCreate={openCreate}
        createLabel="Create Affiliation"
        loading={loading}
      />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Affiliation">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Worker</label>
            <select
              value={form.workerId}
              onChange={(e) => setForm((f) => ({ ...f, workerId: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.user?.email ?? w.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Employer</label>
            <select
              value={form.employerId}
              onChange={(e) => setForm((f) => ({ ...f, employerId: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              {employers.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.user?.email ?? e.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Record Type</label>
            <select
              value={form.recordType}
              onChange={(e) => setForm((f) => ({ ...f, recordType: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="ADJUSTED">ADJUSTED</option>
              <option value="TERMINATED">TERMINATED</option>
              <option value="REACTIVATED">REACTIVATED</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Engagement Intensity (0-1)</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              max="1"
              value={form.engagementIntensity}
              onChange={(e) => setForm((f) => ({ ...f, engagementIntensity: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-md border border-border hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-dark"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
