import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function GET(
  _req: Request,
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

  const credentials = await prisma.affiliationCredential.findMany({
    where: { workerId },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({
    credentials: credentials.map((c) => ({
      id: c.id,
      recordId: c.recordId,
      issuedAt: c.issuedAt,
    })),
  });
}
