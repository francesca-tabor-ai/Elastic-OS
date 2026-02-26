import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { Decimal } from "@prisma/client/runtime/library";
import { computeHumanCapitalReport } from "@/lib/human-capital-report";

function isEmployerOrAdmin(session: { user?: { role?: string; employerId?: string } } | null, employerId: string): boolean {
  if (!session?.user) return false;
  if (session.user.role === "ADMIN") return true;
  return session.user.role === "EMPLOYER" && session.user.employerId === employerId;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { employerId } = await params;
  if (!isEmployerOrAdmin(session, employerId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const reportDate = dateStr ? new Date(dateStr) : new Date();
  reportDate.setHours(0, 0, 0, 0);

  const report = await computeHumanCapitalReport(employerId, reportDate);

  return NextResponse.json(report);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { employerId } = await params;
  if (!isEmployerOrAdmin(session, employerId)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const dateStr = body.date ?? body.reportDate;
  const reportDate = dateStr ? new Date(dateStr) : new Date();
  reportDate.setHours(0, 0, 0, 0);

  const report = await computeHumanCapitalReport(employerId, reportDate);

  await prisma.humanCapitalReport.upsert({
    where: {
      employerId_reportDate: { employerId, reportDate },
    },
    create: {
      employerId,
      reportDate,
      totalAssetValue: new Decimal(report.totalAssetValue),
      workerCount: report.workerCount,
      payload: report as object,
    },
    update: {
      totalAssetValue: new Decimal(report.totalAssetValue),
      workerCount: report.workerCount,
      payload: report as object,
    },
  });

  return NextResponse.json(report);
}
