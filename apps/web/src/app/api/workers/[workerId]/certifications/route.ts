import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "WORKER" || session.user.workerId !== (await params).workerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { workerId } = await params;
  const body = await req.json();
  const { name, issuer, issuedAt, expiryAt, documentUrl } = body;

  if (!name || !issuer || !issuedAt) {
    return NextResponse.json(
      { error: "name, issuer, and issuedAt are required" },
      { status: 400 }
    );
  }

  const cert = await prisma.certification.create({
    data: {
      workerId,
      name,
      issuer,
      issuedAt: new Date(issuedAt),
      expiryAt: expiryAt ? new Date(expiryAt) : undefined,
      documentUrl: documentUrl ?? undefined,
    },
  });

  return NextResponse.json(cert);
}
