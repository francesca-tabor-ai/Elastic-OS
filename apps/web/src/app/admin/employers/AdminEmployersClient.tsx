"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "../components/AdminDataTable";
import { Modal } from "../components/Modal";

type Employer = {
  id: string;
  userId: string;
  companiesHouseNumber: string | null;
  createdAt: string;
  user?: { email: string; name: string | null } | null;
  employerProfile?: { companyName: string } | null;
};

export function AdminEmployersClient() {
  const [data, setData] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employer | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ userId: "", companiesHouseNumber: "" });
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);

  async function fetchData() {
    setLoading(true);
    try {
      const [employersRes, usersRes] = await Promise.all([
        fetch("/api/admin/employers"),
        fetch("/api/admin/users"),
      ]);
      if (!employersRes.ok) throw new Error("Failed to fetch employers");
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u.map((x: { id: string; email: string }) => ({ id: x.id, email: x.email })));
      }
      const json = await employersRes.json();
      setData(json);
    } catch {
      setError("Failed to load employers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ userId: users[0]?.id ?? "", companiesHouseNumber: "" });
    setModalOpen(true);
  }

  function openEdit(row: Employer) {
    setEditing(row);
    setForm({
      userId: row.userId,
      companiesHouseNumber: row.companiesHouseNumber ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        const res = await fetch(`/api/admin/employers/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companiesHouseNumber: form.companiesHouseNumber || undefined }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Request failed");
      } else {
        const res = await fetch("/api/admin/employers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: form.userId,
            companiesHouseNumber: form.companiesHouseNumber || undefined,
          }),
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

  async function handleDelete(row: Employer) {
    if (!confirm("Delete this employer?")) return;
    try {
      const res = await fetch(`/api/admin/employers/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
    } catch {
      setError("Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Employers</h1>
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
            key: "employerProfile",
            label: "Company",
            render: (r) => r.employerProfile?.companyName ?? "—",
          },
          { key: "companiesHouseNumber", label: "Companies House", render: (r) => r.companiesHouseNumber ?? "—" },
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
        createLabel="Create Employer"
        loading={loading}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Employer" : "Create Employer"}
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
          <div>
            <label className="block text-sm font-medium mb-1">Companies House Number</label>
            <input
              type="text"
              value={form.companiesHouseNumber}
              onChange={(e) => setForm((f) => ({ ...f, companiesHouseNumber: e.target.value }))}
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
              {editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
