"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "../components/AdminDataTable";
import { Modal } from "../components/Modal";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  worker?: { id: string } | null;
  employer?: { id: string } | null;
};

export function AdminUsersClient() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "WORKER" });

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ email: "", name: "", password: "", role: "WORKER" });
    setModalOpen(true);
  }

  function openEdit(row: User) {
    setEditing(row);
    setForm({
      email: row.email,
      name: row.name ?? "",
      password: "",
      role: row.role,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const payload = editing
        ? { ...form, ...(form.password && { password: form.password }) }
        : { ...form, password: form.password || "changeme123" };
      if (editing && !form.password) delete (payload as { password?: string }).password;

      const url = editing ? `/api/admin/users/${editing.id}` : "/api/admin/users";
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

  async function handleDelete(row: User) {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
    } catch {
      setError("Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <AdminDataTable
        columns={[
          { key: "email", label: "Email" },
          { key: "name", label: "Name" },
          { key: "role", label: "Role" },
          {
            key: "createdAt",
            label: "Created",
            render: (row) => new Date(row.createdAt).toLocaleDateString(),
          },
        ]}
        data={data}
        onEdit={openEdit}
        onDelete={handleDelete}
        onCreate={openCreate}
        createLabel="Create User"
        loading={loading}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit User" : "Create User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Password {editing && "(leave blank to keep)"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
              required={!editing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              <option value="WORKER">WORKER</option>
              <option value="EMPLOYER">EMPLOYER</option>
              <option value="GOVERNMENT">GOVERNMENT</option>
              <option value="ADMIN">ADMIN</option>
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
