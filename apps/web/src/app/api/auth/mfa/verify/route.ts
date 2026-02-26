import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import speakeasy from "speakeasy";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { token } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const mfaRecord = await prisma.mfaSecret.findUnique({
    where: { userId: session.user.id },
  });

  if (!mfaRecord) {
    return NextResponse.json(
      { error: "MFA not set up. Call /api/auth/mfa/setup first." },
      { status: 400 }
    );
  }

  const valid = speakeasy.totp.verify({
    secret: mfaRecord.secret,
    encoding: "base32",
    token: token.replace(/\s/g, ""),
    window: 1,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { worker: true, employer: true },
  });

  if (user?.worker) {
    await prisma.worker.update({
      where: { id: user.worker.id },
      data: { mfaEnabled: true },
    });
  }

  return NextResponse.json({
    success: true,
    mfaEnabled: true,
    message: "MFA enabled successfully",
  });
}
