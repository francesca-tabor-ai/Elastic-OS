"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "../components/AdminDataTable";
import { Modal } from "../components/Modal";

type JobRole = {
  id: string;
  employerId: string;
  title: string;
  departmentId: string | null;
  employer?: { user?: { email: string } } | null;
  department?: { name: string } | null;
};

export function AdminJobRolesClient() {
  const [data, setData] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobRole | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ employerId: "", title: "", departmentId: "" });
  const [employers, setEmployers] = useState<{ id: string; user?: { email: string } }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string; employerId: string }[]>([]);

  async function fetchData() {
    setLoading(true);
    try {
      const [rolesRes, employersRes, deptsRes] = await Promise.all([
        fetch("/api/admin/job-roles"),
        fetch("/api/admin/employers"),
        fetch("/api/admin/departments"),
      ]);
      if (!rolesRes.ok) throw new Error("Failed to fetch");
      const json = await rolesRes.json();
      setData(json);
      if (employersRes.ok) {
        const e = await employersRes.json();
        setEmployers(e);
      }
      if (deptsRes.ok) {
        const d = await deptsRes.json();
        setDepartments(d);
      }
    } catch {
      setError("Failed to load job roles");
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
      title: "",
      departmentId: "",
    });
    setModalOpen(true);
  }

  function openEdit(row: JobRole) {
    setEditing(row);
    setForm({
      employerId: row.employerId,
      title: row.title,
      departmentId: row.departmentId ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const url = editing ? `/api/admin/job-roles/${editing.id}` : "/api/admin/job-roles";
      const payload = editing
        ? { title: form.title, departmentId: form.departmentId || null }
        : {
            employerId: form.employerId,
            title: form.title,
            departmentId: form.departmentId || undefined,
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

  async function handleDelete(row: JobRole) {
    if (!confirm("Delete this job role?")) return;
    try {
      const res = await fetch(`/api/admin/job-roles/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchData();
    } catch {
      setError("Delete failed");
    }
  }

  const deptOptions = departments.filter((d) => d.employerId === form.employerId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Job Roles</h1>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <AdminDataTable
        columns={[
          { key: "title", label: "Title" },
          {
            key: "employer",
            label: "Employer",
            render: (r) => r.employer?.user?.email ?? r.employerId,
          },
          {
            key: "department",
            label: "Department",
            render: (r) => r.department?.name ?? "—",
          },
        ]}
        data={data}
        onEdit={openEdit}
        onDelete={handleDelete}
        onCreate={openCreate}
        createLabel="Create Job Role"
        loading={loading}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Job Role" : "Create Job Role"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium mb-1">Employer</label>
              <select
                value={form.employerId}
                onChange={(e) => setForm((f) => ({ ...f, employerId: e.target.value, departmentId: "" }))}
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
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={form.departmentId}
              onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              <option value="">None</option>
              {deptOptions.map((d) => (
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
