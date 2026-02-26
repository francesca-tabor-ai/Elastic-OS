import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@elastic-os/db";
import { SubsidyClient } from "./SubsidyClient";

export default async function GovernmentSubsidyPage() {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "GOVERNMENT" && session.user.role !== "ADMIN")
  ) {
    redirect("/login");
  }

  const policies = await prisma.subsidyPolicy.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { allocations: true } } },
  });

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Wage Stabilisation</h1>
          <Link
            href="/government/dashboard"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>

        <SubsidyClient
          policies={policies.map((p) => ({
            id: p.id,
            name: p.name,
            maxEngagementThreshold: Number(p.maxEngagementThreshold),
            minEngagementThreshold: Number(p.minEngagementThreshold),
            subsidyAmountPerWorker: Number(p.subsidyAmountPerWorker),
            totalBudget: p.totalBudget ? Number(p.totalBudget) : null,
            effectiveFrom: p.effectiveFrom.toISOString(),
            effectiveTo: p.effectiveTo?.toISOString() ?? null,
            status: p.status,
            allocationCount: p._count.allocations,
          }))}
        />
      </div>
    </main>
  );
}
