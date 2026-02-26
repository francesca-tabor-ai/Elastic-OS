"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "../components/AdminDataTable";
import { Modal } from "../components/Modal";

type Department = {
  id: string;
  employerId: string;
  name: string;
  parentDepartmentId: string | null;
  employer?: { user?: { email: string } } | null;
  parentDepartment?: { name: string } | null;
};

export function AdminDepartmentsClient() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ employerId: "", name: "", parentDepartmentId: "" });
  const [employers, setEmployers] = useState<{ id: string; user?: { email: string } }[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  async function fetchData() {
    setLoading(true);
    try {
      const [deptsRes, employersRes] = await Promise.all([
        fetch("/api/admin/departments"),
        fetch("/api/admin/employers"),
      ]);
      if (!deptsRes.ok) throw new Error("Failed to fetch");
      const json = await deptsRes.json();
      setData(json);
      setDepartments(json);
      if (employersRes.ok) {
        const e = await employersRes.json();
        setEmployers(e);
      }
    } catch {
      setError("Failed to load departments");
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
      employerId: employers[0]?.id ?? "",
      name: "",
      parentDepartmentId: "",
    });
    setModalOpen(true);
  }

  function openEdit(row: Department) {
    setEditing(row);
    setForm({
      employerId: row.employerId,
      name: row.name,
      parentDepartmentId: row.parentDepartmentId ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const url = editing ? `/api/admin/departments/${editing.id}` : "/api/admin/departments";
      const payload = editing
        ? { name: form.name, parentDepartmentId: form.parentDepartmentId || null }
        : {
            employerId: form.employerId,
            name: form.name,
            parentDepartmentId: form.parentDepartmentId || undefined,
          };
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

  async function handleDelete(row: Department) {
    if (!confirm("Delete this department?")) return;
    try {
      const res = await fetch(`/api/admin/departments/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
    } catch {
      setError("Delete failed");
    }
  }

  const parentOptions = departments.filter(
    (d) => !editing || (d.employerId === form.employerId && d.id !== editing.id)
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Departments</h1>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <AdminDataTable
        columns={[
          { key: "name", label: "Name" },
          {
            key: "employer",
            label: "Employer",
            render: (r) => r.employer?.user?.email ?? r.employerId,
          },
          {
            key: "parentDepartment",
            label: "Parent",
            render: (r) => r.parentDepartment?.name ?? "—",
          },
        ]}
        data={data}
        onEdit={openEdit}
        onDelete={handleDelete}
        onCreate={openCreate}
        createLabel="Create Department"
        loading={loading}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Department" : "Create Department"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
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
          )}
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
            <label className="block text-sm font-medium mb-1">Parent Department</label>
            <select
              value={form.parentDepartmentId}
              onChange={(e) => setForm((f) => ({ ...f, parentDepartmentId: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              <option value="">None</option>
              {parentOptions
                .filter((d) => (!editing ? d.employerId === form.employerId : true))
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
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
