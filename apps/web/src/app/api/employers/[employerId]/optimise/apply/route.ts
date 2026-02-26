import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { createOrAdjustAffiliation } from "@/lib/ledger";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employerId } = await params;

  if (
    session.user.role === "EMPLOYER" &&
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { runId } = body;

  if (!runId) {
    return NextResponse.json({ error: "runId required" }, { status: 400 });
  }

  const run = await prisma.optimisationRun.findFirst({
    where: { id: runId, employerId },
  });

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  if (run.status !== "PENDING") {
    return NextResponse.json({ error: "Run already applied or rejected" }, { status: 400 });
  }

  const recommendations = run.recommendations as Array<{
    workerId: string;
    suggestedIntensity: number;
  }>;

  for (const r of recommendations) {
    await createOrAdjustAffiliation({
      workerId: r.workerId,
      employerId,
      engagementIntensity: r.suggestedIntensity,
      recordType: "ADJUSTED",
      createdBy: session.user.id,
    });
  }

  await prisma.optimisationRun.update({
    where: { id: runId },
    data: { status: "APPLIED" },
  });

  return NextResponse.json({
    applied: recommendations.length,
  });
}
