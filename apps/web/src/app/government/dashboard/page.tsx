import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { computeNationalElasticIndex, computeElasticIndexByIndustry } from "@/lib/government";
import { GovernmentDashboardClient } from "./GovernmentDashboardClient";

export default async function GovernmentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "GOVERNMENT" && session.user.role !== "ADMIN")
  ) {
    redirect("/login");
  }

  const [index, byIndustry] = await Promise.all([
    computeNationalElasticIndex(),
    computeElasticIndexByIndustry(),
  ]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">National Elastic Labour Index</h1>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <GovernmentDashboardClient
          index={index}
          byIndustry={byIndustry}
        />
      </div>
    </main>
  );
}
