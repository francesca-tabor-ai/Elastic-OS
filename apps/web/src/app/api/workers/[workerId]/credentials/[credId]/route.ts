import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

/** Get credential JWT for presentation (worker only) */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workerId: string; credId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId, credId } = await params;

  if (
    session.user.role !== "WORKER" ||
    session.user.workerId !== workerId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cred = await prisma.affiliationCredential.findFirst({
    where: { id: credId, workerId },
  });

  if (!cred) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    jwt: cred.credentialJwt,
    recordId: cred.recordId,
    issuedAt: cred.issuedAt,
  });
}
