"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "../components/AdminDataTable";
import { Modal } from "../components/Modal";

type Worker = {
  id: string;
  userId: string;
  govtIdVerifiedAt: string | null;
  mfaEnabled: boolean;
  createdAt: string;
  user?: { email: string; name: string | null } | null;
};

export function AdminWorkersClient() {
  const [data, setData] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ userId: "", mfaEnabled: false });
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);

  async function fetchData() {
    setLoading(true);
    try {
      const [workersRes, usersRes] = await Promise.all([
        fetch("/api/admin/workers"),
        fetch("/api/admin/users"),
      ]);
      if (!workersRes.ok) throw new Error("Failed to fetch workers");
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u.map((x: { id: string; email: string }) => ({ id: x.id, email: x.email })));
      }
      const json = await workersRes.json();
      setData(json);
    } catch {
      setError("Failed to load workers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ userId: users[0]?.id ?? "", mfaEnabled: false });
    setModalOpen(true);
  }

  function openEdit(row: Worker) {
    setEditing(row);
    setForm({ userId: row.userId, mfaEnabled: row.mfaEnabled });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        const res = await fetch(`/api/admin/workers/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Request failed");
      } else {
        const res = await fetch("/api/admin/workers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: form.userId }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Request failed");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  async function handleDelete(row: Worker) {
    if (!confirm("Delete this worker? This will remove the worker profile.")) return;
    try {
      const res = await fetch(`/api/admin/workers/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
    } catch {
      setError("Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Workers</h1>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <AdminDataTable
        columns={[
          { key: "id", label: "ID", render: (r) => r.id.slice(0, 8) + "…" },
          { key: "user", label: "User", render: (r) => r.user?.email ?? r.userId },
          {
            key: "govtIdVerifiedAt",
            label: "Gov ID Verified",
            render: (r) => (r.govtIdVerifiedAt ? new Date(r.govtIdVerifiedAt).toLocaleDateString() : "—"),
          },
          { key: "mfaEnabled", label: "MFA", render: (r) => (r.mfaEnabled ? "Yes" : "No") },
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
        createLabel="Create Worker"
        loading={loading}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Worker" : "Create Worker"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium mb-1">User</label>
              <select
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          {editing && (
            <div>
              <label className="block text-sm font-medium mb-1">MFA Enabled</label>
              <input
                type="checkbox"
                checked={form.mfaEnabled}
                onChange={(e) => setForm((f) => ({ ...f, mfaEnabled: e.target.checked }))}
              />
            </div>
          )}
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
