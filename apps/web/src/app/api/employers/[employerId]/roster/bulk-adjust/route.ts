import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrAdjustAffiliation } from "@/lib/ledger";
import { prisma } from "@elastic-os/db";

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
    session.user.role !== "EMPLOYER" ||
    session.user.employerId !== employerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { departmentId, workerIds, intensity } = body;

  if (intensity == null || typeof intensity !== "number") {
    return NextResponse.json(
      { error: "intensity is required (0-1)" },
      { status: 400 }
    );
  }

  const validIntensity = Math.min(1, Math.max(0, Number(intensity)));

  let targetWorkerIds: string[];

  if (workerIds && Array.isArray(workerIds) && workerIds.length > 0) {
    targetWorkerIds = workerIds;
  } else if (departmentId) {
    const roster = await prisma.workforceRoster.findMany({
      where: { employerId, departmentId },
      select: { workerId: true },
    });
    targetWorkerIds = roster.map((r) => r.workerId);
  } else {
    return NextResponse.json(
      { error: "Provide either departmentId or workerIds array" },
      { status: 400 }
    );
  }

  const results: { workerId: string; success: boolean; error?: string }[] = [];

  for (const workerId of targetWorkerIds) {
    try {
      await createOrAdjustAffiliation({
        workerId,
        employerId,
        engagementIntensity: validIntensity,
        recordType: "ADJUSTED",
        createdBy: session.user.id,
        metadata: { source: "bulk_adjust", departmentId: departmentId ?? undefined },
      });
      results.push({ workerId, success: true });
    } catch (e) {
      results.push({
        workerId,
        success: false,
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;

  return NextResponse.json({
    adjusted: successCount,
    total: results.length,
    results,
  });
}
