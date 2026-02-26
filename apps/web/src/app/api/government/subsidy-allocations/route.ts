import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

function isGovernment(session: { user?: { role?: string } } | null): boolean {
  const role = session?.user?.role;
  return role === "GOVERNMENT" || role === "ADMIN";
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isGovernment(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const policyId = searchParams.get("policyId");
  const format = searchParams.get("format") ?? "json";

  const where = policyId ? { policyId } : {};
  const allocations = await prisma.subsidyAllocation.findMany({
    where,
    include: { policy: true },
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const header = "policyId,workerId,employerId,engagementIntensity,subsidyAmount,periodStart,periodEnd,status\n";
    const rows = allocations.map(
      (a) =>
        `${a.policyId},${a.workerId},${a.employerId},${Number(a.engagementIntensity)},${Number(a.subsidyAmount)},${a.periodStart.toISOString()},${a.periodEnd.toISOString()},${a.status}`
    );
    return new NextResponse(header + rows.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=subsidy-allocations.csv",
      },
    });
  }

  return NextResponse.json({
    allocations: allocations.map((a) => ({
      id: a.id,
      policyId: a.policyId,
      workerId: a.workerId,
      employerId: a.employerId,
      engagementIntensity: Number(a.engagementIntensity),
      subsidyAmount: Number(a.subsidyAmount),
      periodStart: a.periodStart,
      periodEnd: a.periodEnd,
      status: a.status,
    })),
  });
}
