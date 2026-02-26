import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";
import { issueAffiliationCredential } from "@/lib/credentials";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId } = await params;

  if (
    session.user.role !== "WORKER" ||
    session.user.workerId !== workerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const recordIds = body.recordIds ?? body.recordId ? [body.recordId] : [];

  if (!Array.isArray(recordIds) || recordIds.length === 0) {
    return NextResponse.json(
      { error: "recordIds array required" },
      { status: 400 }
    );
  }

  const records = await prisma.affiliationRecord.findMany({
    where: { id: { in: recordIds }, workerId },
  });

  const issued: Array<{ recordId: string; credentialId: string }> = [];

  for (const record of records) {
    const existing = await prisma.affiliationCredential.findUnique({
      where: { recordId: record.id },
    });
    if (existing) continue;

    const jwt = await issueAffiliationCredential(record.id);
    if (!jwt) continue;

    const cred = await prisma.affiliationCredential.create({
      data: {
        workerId,
        recordId: record.id,
        credentialJwt: jwt,
      },
    });
    issued.push({ recordId: record.id, credentialId: cred.id });
  }

  return NextResponse.json({ issued });
}
