import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { runAllocation } from "@/lib/subsidy";

function isGovernment(session: { user?: { role?: string } } | null): boolean {
  const role = session?.user?.role;
  return role === "GOVERNMENT" || role === "ADMIN";
}

export async function POST(
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

  const { id: policyId } = await params;
  const body = await req.json().catch(() => ({}));
  const periodStart = body.periodStart ? new Date(body.periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const periodEnd = body.periodEnd ? new Date(body.periodEnd) : new Date();

  const policy = await prisma.subsidyPolicy.findUnique({
    where: { id: policyId },
  });
  if (!policy) {
    return NextResponse.json({ error: "Policy not found" }, { status: 404 });
  }
  if (policy.status !== "ACTIVE") {
    await prisma.subsidyPolicy.update({
      where: { id: policyId },
      data: { status: "ACTIVE" },
    });
  }

  const result = await runAllocation(policyId, periodStart, periodEnd, session.user.id);
  return NextResponse.json(result);
}
