import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET() {
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

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    workerId: user.worker?.id,
    employerId: user.employer?.id,
    govtIdVerified: !!user.worker?.govtIdVerifiedAt ?? !!user.employer?.govtIdVerifiedAt,
    mfaEnabled: user.worker?.mfaEnabled ?? user.employer?.mfaEnabled ?? false,
    legalEntityVerified: !!user.employer?.legalEntityVerifiedAt,
    companiesHouseNumber: user.employer?.companiesHouseNumber,
  });
}
