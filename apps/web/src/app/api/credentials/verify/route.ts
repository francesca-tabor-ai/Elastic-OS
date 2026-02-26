import { NextResponse } from "next/server";
import { verifyCredential } from "@/lib/credentials";

/** Public endpoint to verify a presented credential JWT */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const jwt = body.jwt ?? body.credential ?? body.token;

  if (!jwt || typeof jwt !== "string") {
    return NextResponse.json(
      { valid: false, error: "jwt required" },
      { status: 400 }
    );
  }

  const payload = verifyCredential(jwt);

  if (!payload) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    credentialSubject: payload.credentialSubject,
    issuer: payload.iss,
    issuedAt: payload.iat,
  });
}
