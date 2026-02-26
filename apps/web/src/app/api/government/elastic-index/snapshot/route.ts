import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { Decimal } from "@prisma/client/runtime/library";
import { computeNationalElasticIndex } from "@/lib/government";

function isGovernment(session: { user?: { role?: string } } | null): boolean {
  const role = session?.user?.role;
  return role === "GOVERNMENT" || role === "ADMIN";
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isGovernment(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const index = await computeNationalElasticIndex();
  const snapshotDate = new Date();
  snapshotDate.setHours(0, 0, 0, 0);

  const toDec = (n: number) => new Decimal(n);
  await prisma.nationalElasticIndexSnapshot.upsert({
    where: { snapshotDate },
    create: {
      snapshotDate,
      engagementDistribution: index.engagementDistribution as object,
      elasticityRate: toDec(index.elasticityRate),
      meanContinuity: toDec(index.meanContinuity),
      multiEmployerRate: index.multiEmployerRate != null ? toDec(index.multiEmployerRate) : null,
      totalWorkers: index.totalWorkers,
      totalEmployers: index.totalEmployers,
    },
    update: {
      engagementDistribution: index.engagementDistribution as object,
      elasticityRate: toDec(index.elasticityRate),
      meanContinuity: toDec(index.meanContinuity),
      multiEmployerRate: index.multiEmployerRate != null ? toDec(index.multiEmployerRate) : null,
      totalWorkers: index.totalWorkers,
      totalEmployers: index.totalEmployers,
    },
  });

  return NextResponse.json({ snapshotDate, ...index });
}
