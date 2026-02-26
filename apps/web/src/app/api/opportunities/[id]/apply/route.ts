import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { getWorkerHeadroom } from "@/lib/marketplace";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.workerId) {
    return NextResponse.json({ error: "Workers only" }, { status: 403 });
  }

  const { id: opportunityId } = await params;
  const body = await req.json().catch(() => ({}));
  const message = body.message ?? null;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  if (opportunity.status !== "OPEN") {
    return NextResponse.json({ error: "Opportunity is not open" }, { status: 400 });
  }

  const headroom = await getWorkerHeadroom(session.user.workerId);
  const intensity = Number(opportunity.engagementIntensity);

  if (!headroom.openToOpportunities || intensity > headroom.headroom) {
    return NextResponse.json(
      { error: "Not enough engagement headroom" },
      { status: 400 }
    );
  }

  const existing = await prisma.affiliationSnapshot.findUnique({
    where: {
      workerId_employerId: {
        workerId: session.user.workerId,
        employerId: opportunity.employerId,
      },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Already affiliated with this employer" },
      { status: 400 }
    );
  }

  await prisma.opportunityApplication.create({
    data: {
      opportunityId,
      workerId: session.user.workerId,
      status: "PENDING",
      message,
    },
  });

  return NextResponse.json({ success: true });
}
