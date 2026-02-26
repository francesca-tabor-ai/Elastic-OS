"use client";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface AdminDataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onCreate?: () => void;
  createLabel?: string;
  loading?: boolean;
}

export function AdminDataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  onCreate,
  createLabel = "Create",
  loading = false,
}: AdminDataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-foreground-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {onCreate && (
        <div className="p-4 border-b border-border bg-background-alt">
          <button
            type="button"
            onClick={onCreate}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
          >
            {createLabel}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="px-4 py-3 text-left font-medium text-foreground">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right font-medium text-foreground">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-4 py-8 text-center text-foreground-muted"
                >
                  No records
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-border hover:bg-surface/50">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      {col.render
                        ? col.render(row)
                        : (row[col.key as keyof T] as React.ReactNode) ?? "—"}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right space-x-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="text-accent hover:underline"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
