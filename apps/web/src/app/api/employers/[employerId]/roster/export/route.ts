import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  if (session.user.role === "EMPLOYER" && session.user.employerId !== employerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const roster = await prisma.workforceRoster.findMany({
    where: { employerId },
    include: {
      worker: { include: { user: true } },
      department: true,
      jobRole: true,
      contractType: true,
    },
  });

  const header = "workerId,email,department,jobRole,contractType\n";
  const rows = roster.map(
    (r) =>
      `${r.workerId},${r.worker?.user?.email ?? ""},${r.department?.name ?? ""},${r.jobRole?.title ?? ""},${r.contractType?.name ?? ""}`
  );
  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="roster-${employerId}.csv"`,
    },
  });
}
