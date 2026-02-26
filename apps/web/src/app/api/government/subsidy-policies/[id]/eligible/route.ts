import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { computeEligibleWorkers } from "@/lib/subsidy";

function isGovernment(session: { user?: { role?: string } } | null): boolean {
  const role = session?.user?.role;
  return role === "GOVERNMENT" || role === "ADMIN";
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isGovernment(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const periodStart = searchParams.get("periodStart");
  const periodEnd = searchParams.get("periodEnd");

  const start = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = periodEnd ? new Date(periodEnd) : new Date();

  const eligible = await computeEligibleWorkers(id, start, end);
  const totalSubsidy = eligible.reduce((sum, e) => sum + e.subsidyAmount, 0);

  return NextResponse.json({
    eligibleCount: eligible.length,
    totalSubsidy,
    eligible: eligible.slice(0, 100).map((e) => ({
      workerId: e.workerId,
      employerId: e.employerId,
      engagementIntensity: e.engagementIntensity,
      subsidyAmount: e.subsidyAmount,
    })),
  });
}
