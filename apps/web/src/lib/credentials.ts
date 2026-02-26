/**
 * Phase 3 Feature 12: Portable Affiliation Identity
 * Verifiable credentials via signed JWT (MVP)
 */

import { prisma } from "@elastic-os/db";
import crypto from "crypto";

const ISSUER = "https://elasticos.com";
const ALG = "HS256";

// MVP: Use env var for signing secret. In production use HSM/KMS.
function getSigningKey(): string {
  const key = process.env.CREDENTIAL_SIGNING_SECRET;
  return key ?? "elasticos-credential-mvp-secret-change-in-production";
}

/** Create a signed JWT payload for an affiliation record */
export async function issueAffiliationCredential(
  recordId: string
): Promise<string | null> {
  const record = await prisma.affiliationRecord.findUnique({
    where: { id: recordId },
    include: {
      worker: { include: { user: true } },
      employer: { include: { employerProfile: true } },
    },
  });

  if (!record) return null;

  const header = {
    alg: ALG,
    typ: "JWT",
  };

  const payload = {
    iss: ISSUER,
    sub: record.workerId,
    aud: "elasticos-credentials",
    iat: Math.floor(Date.now() / 1000),
    type: "ElasticAffiliationCredential",
    credentialSubject: {
      workerId: record.workerId,
      employerId: record.employerId,
      employerName: record.employer?.employerProfile?.companyName ?? record.employerId,
      engagementIntensity: Number(record.engagementIntensity),
      effectiveFrom: record.effectiveFrom.toISOString(),
      effectiveTo: record.effectiveTo?.toISOString() ?? null,
      recordType: record.recordType,
    },
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${headerB64}.${payloadB64}`;

  const signature = crypto
    .createHmac("sha256", getSigningKey())
    .update(signingInput)
    .digest("base64url");

  return `${signingInput}.${signature}`;
}

/** Verify a credential JWT; return payload or null */
export function verifyCredential(jwt: string): Record<string, unknown> | null {
  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;

    const expectedSig = crypto
      .createHmac("sha256", getSigningKey())
      .update(signingInput)
      .digest("base64url");

    if (sigB64 !== expectedSig) return null;

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );

    if (payload.iss !== ISSUER) return null;

    return payload;
  } catch {
    return null;
  }
}
