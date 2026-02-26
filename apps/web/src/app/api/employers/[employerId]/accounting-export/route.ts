import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  const format = searchParams.get("format") ?? "json";
  const dateStr = searchParams.get("date");
  const reportDate = dateStr ? new Date(dateStr) : new Date();
  reportDate.setHours(0, 0, 0, 0);

  const report = await computeHumanCapitalReport(employerId, reportDate);

  if (format === "csv") {
    const header = "reportDate,totalAssetValue,workerCount,workerId,score,replacementCost,timeToReplace\n";
    const rows = report.breakdown.map(
      (b) =>
        `${report.reportDate},${report.totalAssetValue},${report.workerCount},${b.workerId},${b.score},${b.replacementCost ?? ""},${b.timeToReplace ?? ""}`
    );
    const csv = header + rows.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=human-capital-report-${report.reportDate}.csv`,
      },
    });
  }

  return NextResponse.json({
    schema: "ElasticOS-HumanCapital-1.0",
    reportDate: report.reportDate,
    totalAssetValue: report.totalAssetValue,
    workerCount: report.workerCount,
    breakdown: report.breakdown,
  });
}
