import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { getWorkerAffiliationHistory } from "@/lib/ledger";

export default async function WorkerHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "WORKER" || !session.user.workerId) {
    redirect("/login");
  }

  const history = await getWorkerAffiliationHistory(session.user.workerId);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Employment History</h1>
          <Link
            href="/worker/profile"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Back to Profile
          </Link>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Derived from the Employment Affiliation Ledger.
        </p>

        {history.length === 0 ? (
          <p className="text-gray-500">No affiliation history yet.</p>
        ) : (
          <ul className="space-y-4">
            {history.map((r) => (
              <li
                key={r.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    {r.employer?.employerProfile?.companyName ?? r.employerId}
                  </span>
                  <span className="text-gray-500">{r.recordType}</span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Engagement: {(Number(r.engagementIntensity) * 100).toFixed(0)}% •{" "}
                  {new Date(r.effectiveFrom).toLocaleDateString()}
                  {r.effectiveTo && ` – ${new Date(r.effectiveTo).toLocaleDateString()}`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
