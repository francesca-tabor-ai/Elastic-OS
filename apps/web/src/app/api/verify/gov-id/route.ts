import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

// Stub: GOV.UK Verify - mock success, log to VerificationLog
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { worker: true, employer: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Stub: always succeed
  const verifiedAt = new Date();

  // Update worker if present
  if (user.worker) {
    await prisma.worker.update({
      where: { id: user.worker.id },
      data: { govtIdVerifiedAt: verifiedAt },
    });
  }

  // Log verification attempt (append-only audit)
  await prisma.verificationLog.create({
    data: {
      userId: user.id,
      entityType: "GOV_ID",
      entityId: user.worker?.id ?? user.id,
      success: true,
      metadata: { stub: true, source: "gov-uk-verify-mock" },
    },
  });

  return NextResponse.json({ verified: true, verifiedAt: verifiedAt.toISOString() });
}
