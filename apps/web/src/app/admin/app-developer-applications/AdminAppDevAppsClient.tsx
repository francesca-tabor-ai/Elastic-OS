"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "../components/AdminDataTable";
import { Modal } from "../components/Modal";

type AppDevApp = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  status: string;
  createdAt: string;
};

export function AdminAppDevAppsClient() {
  const [data, setData] = useState<AppDevApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppDevApp | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    country: "",
    targetAudience: "",
    appConcept: "",
    status: "PENDING",
  });

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/app-developer-applications");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      country: "",
      targetAudience: "",
      appConcept: "",
      status: "PENDING",
    });
    setModalOpen(true);
  }

  function openEdit(row: AppDevApp) {
    setEditing(row);
    setForm({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      company: row.company,
      country: "",
      targetAudience: "",
      appConcept: "",
      status: row.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const payload = editing
        ? { ...form, status: form.status }
        : {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            company: form.company,
            country: form.country,
            targetAudience: form.targetAudience,
            appConcept: form.appConcept,
            status: form.status,
            appType: [],
            hasIntegrationsExperience: false,
            marketingOptIn: false,
          };
      const url = editing
        ? `/api/admin/app-developer-applications/${editing.id}`
        : "/api/admin/app-developer-applications";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  async function handleDelete(row: AppDevApp) {
    if (!confirm("Delete this application?")) return;
    try {
      const res = await fetch(`/api/admin/app-developer-applications/${row.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
    } catch {
      setError("Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">App Developer Applications</h1>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <AdminDataTable
        columns={[
          { key: "firstName", label: "First Name" },
          { key: "lastName", label: "Last Name" },
          { key: "email", label: "Email" },
          { key: "company", label: "Company" },
          { key: "status", label: "Status" },
          {
            key: "createdAt",
            label: "Created",
            render: (r) => new Date(r.createdAt).toLocaleDateString(),
          },
        ]}
        data={data}
        onEdit={openEdit}
        onDelete={handleDelete}
        onCreate={openCreate}
        createLabel="Create Application"
        loading={loading}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Application" : "Create Application"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          {!editing && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience</label>
                <input
                  type="text"
                  value={form.targetAudience}
                  onChange={(e) => setForm((f) => ({ ...f, targetAudience: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">App Concept</label>
                <textarea
                  value={form.appConcept}
                  onChange={(e) => setForm((f) => ({ ...f, appConcept: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
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
              {editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
