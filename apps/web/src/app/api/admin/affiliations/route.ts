import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";
import { createOrAdjustAffiliation } from "@/lib/ledger";
import { AFFILIATION_RECORD_TYPES, type AffiliationRecordType } from "@elastic-os/shared";

export async function GET() {
  try {
    await getAdminSession();
    const records = await prisma.affiliationRecord.findMany({
      include: { worker: { include: { user: true } }, employer: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(records);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAdminSession();
    const body = await req.json();
    const { workerId, employerId, engagementIntensity, recordType } = body;

    if (!workerId || !employerId) {
      return NextResponse.json(
        { error: "workerId and employerId are required" },
        { status: 400 }
      );
    }
    if (!recordType || !AFFILIATION_RECORD_TYPES.includes(recordType)) {
      return NextResponse.json(
        { error: "recordType must be ACTIVE, ADJUSTED, TERMINATED, or REACTIVATED" },
        { status: 400 }
      );
    }

    const intensity = engagementIntensity ?? (recordType === "TERMINATED" ? 0 : 1);
    const record = await createOrAdjustAffiliation({
      workerId,
      employerId,
      engagementIntensity: Number(intensity),
      recordType: recordType as AffiliationRecordType,
      createdBy: user.id,
      metadata: { api: "admin" },
    });
    return NextResponse.json(record);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
