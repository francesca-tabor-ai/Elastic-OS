import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { getAffiliationStatus } from "@/lib/compensation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  if (
    session.user.role === "EMPLOYER" &&
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snapshots = await prisma.affiliationSnapshot.findMany({
    where: { employerId },
    include: {
      worker: { include: { user: true } },
    },
  });

  const roster = await prisma.workforceRoster.findMany({
    where: { employerId },
    include: { worker: true, salaryBand: true },
  });

  const rosterByWorker = Object.fromEntries(
    roster.map((r) => [r.workerId, r])
  );

  let fullCount = 0;
  let partialCount = 0;
  let elasticCount = 0;
  let minimalCount = 0;

  let currentPayroll = 0;
  let fullCapacityPayroll = 0;

  const rosterWithSnapshots: Array<{
    workerId: string;
    email: string;
    intensity: number;
    status: string;
    baseSalary: number | null;
    adjustedSalary: number | null;
  }> = [];

  for (const s of snapshots) {
    const intensity = Number(s.engagementIntensity);
    const status = getAffiliationStatus(intensity);

    if (intensity >= 0.8) fullCount++;
    else if (intensity >= 0.5) partialCount++;
    else if (intensity >= 0.3) elasticCount++;
    else minimalCount++;

    let baseSalary: number | null = null;
    const rosterEntry = rosterByWorker[s.workerId];
    if (rosterEntry?.baseSalary) {
      baseSalary = Number(rosterEntry.baseSalary.toString());
    } else if (rosterEntry?.salaryBand) {
      const min = Number(rosterEntry.salaryBand.minAmount);
      const max = Number(rosterEntry.salaryBand.maxAmount);
      baseSalary = (min + max) / 2;
    }

    const adjusted = s.adjustedSalary
      ? Number(s.adjustedSalary.toString())
      : baseSalary != null
        ? baseSalary * intensity
        : null;

    if (baseSalary != null) {
      fullCapacityPayroll += baseSalary;
      currentPayroll += adjusted ?? baseSalary * intensity;
    }

    rosterWithSnapshots.push({
      workerId: s.workerId,
      email: s.worker?.user?.email ?? "",
      intensity,
      status,
      baseSalary,
      adjustedSalary: adjusted,
    });
  }

  const savings = fullCapacityPayroll - currentPayroll;

  return NextResponse.json({
    engagementDistribution: {
      fullCount,
      partialCount,
      elasticCount,
      minimalCount,
    },
    currentPayroll,
    fullCapacityPayroll,
    savings,
    rosterWithSnapshots,
  });
}
