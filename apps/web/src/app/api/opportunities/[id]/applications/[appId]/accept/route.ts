import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { createOrAdjustAffiliation } from "@/lib/ledger";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: opportunityId, appId } = await params;

  const [opportunity, application] = await Promise.all([
    prisma.opportunity.findUnique({ where: { id: opportunityId } }),
    prisma.opportunityApplication.findUnique({
      where: { id: appId },
      include: { opportunity: true },
    }),
  ]);

  if (!opportunity || !application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (application.opportunityId !== opportunityId) {
    return NextResponse.json({ error: "Application not for this opportunity" }, { status: 400 });
  }

  if (
    session.user.role !== "EMPLOYER" ||
    session.user.employerId !== opportunity.employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (application.status !== "PENDING") {
    return NextResponse.json({ error: "Application already processed" }, { status: 400 });
  }

  const intensity = Number(opportunity.engagementIntensity);

  await prisma.$transaction(async (tx) => {
    await tx.opportunityApplication.update({
      where: { id: appId },
      data: { status: "ACCEPTED" },
    });

    await tx.workforceRoster.upsert({
      where: {
        employerId_workerId: {
          employerId: opportunity.employerId,
          workerId: application.workerId,
        },
      },
      create: {
        employerId: opportunity.employerId,
        workerId: application.workerId,
      },
      update: {},
    });
  });

  await createOrAdjustAffiliation({
    workerId: application.workerId,
    employerId: opportunity.employerId,
    engagementIntensity: intensity,
    recordType: "ACTIVE",
    createdBy: session.user.id,
  });

  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { status: "FILLED" },
  });

  return NextResponse.json({ success: true });
}
