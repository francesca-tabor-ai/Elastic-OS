import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: opportunityId } = await params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    session.user.role !== "EMPLOYER" ||
    session.user.employerId !== opportunity.employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const applications = await prisma.opportunityApplication.findMany({
    where: { opportunityId },
    include: {
      worker: { include: { user: true, workerSkills: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    applications: applications.map((a) => ({
      id: a.id,
      workerId: a.workerId,
      email: a.worker?.user?.email,
      status: a.status,
      message: a.message,
      skills: a.worker?.workerSkills?.map((s) => s.skillName) ?? [],
      createdAt: a.createdAt,
    })),
  });
}
