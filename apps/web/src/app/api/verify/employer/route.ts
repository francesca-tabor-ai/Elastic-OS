import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

// Stub: Companies House - mock success if valid format, log
// UK Companies House numbers: 8 digits or 2 letters + 6 digits (e.g. 12345678, SC123456)
const COMPANIES_HOUSE_REGEX = /^(?:(?:[A-Z]{2}|[A-Z]{2})[0-9]{6}|[0-9]{8})$/i;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Only employers can verify legal entity" }, { status: 403 });
  }

  const body = await req.json();
  const { companiesHouseNumber } = body;

  if (!companiesHouseNumber || typeof companiesHouseNumber !== "string") {
    return NextResponse.json(
      { error: "companiesHouseNumber is required" },
      { status: 400 }
    );
  }

  const trimmed = companiesHouseNumber.trim().toUpperCase();
  const validFormat = COMPANIES_HOUSE_REGEX.test(trimmed);

  const employer = await prisma.employer.findUnique({
    where: { userId: session.user.id },
  });

  if (!employer) {
    return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
  }

  // Stub: succeed if valid format
  const success = validFormat;
  const verifiedAt = success ? new Date() : null;

  if (success) {
    await prisma.employer.update({
      where: { id: employer.id },
      data: {
        legalEntityVerifiedAt: verifiedAt,
        companiesHouseNumber: trimmed,
      },
    });
  }

  // Log verification attempt (append-only audit)
  await prisma.verificationLog.create({
    data: {
      userId: session.user.id,
      entityType: "EMPLOYER",
      entityId: employer.id,
      success,
      metadata: {
        stub: true,
        source: "companies-house-mock",
        companiesHouseNumber: trimmed,
        validFormat,
      },
    },
  });

  return NextResponse.json({
    verified: success,
    verifiedAt: verifiedAt?.toISOString() ?? null,
    companiesHouseNumber: success ? trimmed : null,
  });
}
