import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { getAffiliationStatus } from "@/lib/compensation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId } = await params;

  if (
    session.user.role === "WORKER" &&
    session.user.workerId !== workerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [snapshots, history] = await Promise.all([
    prisma.affiliationSnapshot.findMany({
      where: { workerId },
      include: {
        employer: { include: { employerProfile: true } },
      },
    }),
    prisma.affiliationRecord.findMany({
      where: { workerId },
      orderBy: { createdAt: "desc" },
      include: {
        employer: { include: { employerProfile: true } },
      },
    }),
  ]);

  const activeAffiliations = snapshots.map((s) => {
    const intensity = Number(s.engagementIntensity);
    return {
      employerId: s.employerId,
      employerName: s.employer?.employerProfile?.companyName ?? s.employerId,
      engagementIntensity: intensity,
      affiliationStatus: getAffiliationStatus(intensity),
      adjustedSalary: s.adjustedSalary
        ? Number(s.adjustedSalary.toString())
        : null,
      benefitsStatus: s.benefitsStatus,
      affiliationContinuityScore: s.affiliationContinuityScore
        ? Number(s.affiliationContinuityScore.toString())
        : null,
    };
  });

  const historyFormatted = history.map((r) => ({
    id: r.id,
    employerId: r.employerId,
    employerName: r.employer?.employerProfile?.companyName ?? r.employerId,
    engagementIntensity: Number(r.engagementIntensity),
    recordType: r.recordType,
    effectiveFrom: r.effectiveFrom,
    effectiveTo: r.effectiveTo,
    createdAt: r.createdAt,
  }));

  return NextResponse.json({
    activeAffiliations,
    history: historyFormatted,
  });
}
