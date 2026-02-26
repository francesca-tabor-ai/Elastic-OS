import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { authOptions } from "@/lib/auth";
import { prisma } from "@elastic-os/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = speakeasy.generateSecret({
    name: `ElasticOS (${session.user.email})`,
    length: 20,
  });

  // Store secret temporarily - user must verify before we enable MFA
  await prisma.mfaSecret.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      secret: secret.base32,
    },
    update: {
      secret: secret.base32,
    },
  });

  const otpauthUrl = secret.otpauth_url;
  if (!otpauthUrl) {
    return NextResponse.json({ error: "Failed to generate MFA secret" }, { status: 500 });
  }

  const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

  return NextResponse.json({
    secret: secret.base32,
    qrCode: qrDataUrl,
    message: "Scan QR code with authenticator app, then verify with /api/auth/mfa/verify",
  });
}
