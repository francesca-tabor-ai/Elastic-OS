"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "../components/AdminDataTable";
import { Modal } from "../components/Modal";

type App = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  scope: string;
  vendor: string;
  isBuiltIn: boolean;
};

export function AdminAppsClient() {
  const [data, setData] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<App | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    category: "WORKFLOW",
    scope: "BOTH",
    vendor: "ElasticOS",
    isBuiltIn: true,
  });

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/apps");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Failed to load apps");
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
      slug: "",
      name: "",
      description: "",
      category: "WORKFLOW",
      scope: "BOTH",
      vendor: "ElasticOS",
      isBuiltIn: true,
    });
    setModalOpen(true);
  }

  function openEdit(row: App) {
    setEditing(row);
    setForm({
      slug: row.slug,
      name: row.name,
      description: row.description,
      category: row.category,
      scope: row.scope,
      vendor: row.vendor,
      isBuiltIn: row.isBuiltIn,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const url = editing ? `/api/admin/apps/${editing.id}` : "/api/admin/apps";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  async function handleDelete(row: App) {
    if (!confirm("Delete this app?")) return;
    try {
      const res = await fetch(`/api/admin/apps/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
    } catch {
      setError("Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Apps</h1>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <AdminDataTable
        columns={[
          { key: "slug", label: "Slug" },
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "scope", label: "Scope" },
          { key: "vendor", label: "Vendor" },
          { key: "isBuiltIn", label: "Built-in", render: (r) => (r.isBuiltIn ? "Yes" : "No") },
        ]}
        data={data}
        onEdit={openEdit}
        onDelete={handleDelete}
        onCreate={openCreate}
        createLabel="Create App"
        loading={loading}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit App" : "Create App"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              <option value="WORKFLOW">WORKFLOW</option>
              <option value="INTEGRATION">INTEGRATION</option>
              <option value="REPORTING">REPORTING</option>
              <option value="COMPLIANCE">COMPLIANCE</option>
              <option value="PRODUCTIVITY">PRODUCTIVITY</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Scope</label>
            <select
              value={form.scope}
              onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              <option value="WORKER">WORKER</option>
              <option value="EMPLOYER">EMPLOYER</option>
              <option value="BOTH">BOTH</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isBuiltIn}
                onChange={(e) => setForm((f) => ({ ...f, isBuiltIn: e.target.checked }))}
              />
              Built-in
            </label>
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
