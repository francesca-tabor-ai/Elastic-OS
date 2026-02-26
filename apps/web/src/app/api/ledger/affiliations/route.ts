import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrAdjustAffiliation } from "@/lib/ledger";
import { AFFILIATION_RECORD_TYPES } from "@elastic-os/shared";
import type { AffiliationRecordType } from "@elastic-os/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { workerId, employerId, engagementIntensity, recordType } = body;

  if (!workerId || !employerId) {
    return NextResponse.json(
      { error: "workerId and employerId are required" },
      { status: 400 }
    );
  }

  if (
    !recordType ||
    !AFFILIATION_RECORD_TYPES.includes(recordType)
  ) {
    return NextResponse.json(
      { error: "recordType must be ACTIVE, ADJUSTED, TERMINATED, or REACTIVATED" },
      { status: 400 }
    );
  }

  const intensity = engagementIntensity ?? (recordType === "TERMINATED" ? 0 : 1);

  // RBAC: Employer can manage their roster; Worker cannot create affiliations for themselves
  // (affiliations are employer-initiated). Government could create for any.
  if (session.user.role === "EMPLOYER" && session.user.employerId !== employerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (session.user.role === "WORKER" && session.user.workerId !== workerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const record = await createOrAdjustAffiliation({
      workerId,
      employerId,
      engagementIntensity: Number(intensity),
      recordType: recordType as AffiliationRecordType,
      createdBy: session.user.id,
      metadata: { api: "ledger" },
    });

    return NextResponse.json(record);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create affiliation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
