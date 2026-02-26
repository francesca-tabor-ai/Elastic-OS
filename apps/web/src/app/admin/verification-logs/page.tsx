import { prisma } from "@elastic-os/db";

export const dynamic = "force-dynamic";

export default async function AdminVerificationLogsPage() {
  const logs = await prisma.verificationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Verification Logs</h1>
      <p className="text-sm text-foreground-muted">
        Read-only audit log. Last 500 entries.
      </p>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Entity Type</th>
                <th className="px-4 py-3 text-left font-medium">Entity ID</th>
                <th className="px-4 py-3 text-left font-medium">Success</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-border">
                  <td className="px-4 py-3">{log.entityType}</td>
                  <td className="px-4 py-3">{log.entityId ?? "—"}</td>
                  <td className="px-4 py-3">{log.success ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
