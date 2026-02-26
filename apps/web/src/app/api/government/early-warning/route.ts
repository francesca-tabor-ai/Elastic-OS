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

  const alerts = await prisma.earlyWarningAlert.findMany({
    where: { acknowledgedAt: null },
    orderBy: { triggeredAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    alerts: alerts.map((a) => ({
      id: a.id,
      alertType: a.alertType,
      severity: a.severity,
      summary: a.summary,
      payload: a.payload,
      triggeredAt: a.triggeredAt,
    })),
  });
}
