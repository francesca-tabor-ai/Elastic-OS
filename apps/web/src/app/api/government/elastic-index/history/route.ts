import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

function isGovernment(session: { user?: { role?: string } } | null): boolean {
  const role = session?.user?.role;
  return role === "GOVERNMENT" || role === "ADMIN";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isGovernment(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snapshots = await prisma.nationalElasticIndexSnapshot.findMany({
    orderBy: { snapshotDate: "desc" },
    take: 30,
  });

  return NextResponse.json({
    history: snapshots.map((s) => ({
      snapshotDate: s.snapshotDate,
      engagementDistribution: s.engagementDistribution,
      elasticityRate: Number(s.elasticityRate),
      meanContinuity: Number(s.meanContinuity),
      multiEmployerRate: s.multiEmployerRate ? Number(s.multiEmployerRate) : null,
      totalWorkers: s.totalWorkers,
      totalEmployers: s.totalEmployers,
    })),
  });
}
