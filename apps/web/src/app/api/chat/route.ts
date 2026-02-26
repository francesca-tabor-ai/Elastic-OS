import { NextResponse } from "next/server";

// Platform knowledge base for ElasticOS - answers questions about the platform
const KNOWLEDGE: Array<{
  keywords: string[];
  response: string;
}> = [
  {
    keywords: ["what is elasticos", "elasticos", "platform", "employment elasticity"],
    response:
      "ElasticOS is Employment Elasticity Infrastructure. It transforms employment from binary states (employed/unemployed) into continuous, measurable engagement. Workers and employers can track flexible work arrangements, engagement intensity (0–1 scale), and affiliation records (active, adjusted, terminated, reactivated).",
  },
  {
    keywords: ["worker", "register", "registration"],
    response:
      "To register as a worker, use the registration flow at /api/auth/register with the WORKER role. You'll create an account linked to a Worker profile. After sign-up, you can set up MFA for extra security and complete identity verification.",
  },
  {
    keywords: ["employer", "employer verification", "verify employer"],
    response:
      "Employer verification is handled through the /api/verify/employer endpoint. Employers can verify their organization to establish trust on the platform. The process validates your business credentials so workers know they're engaging with legitimate employers.",
  },
  {
    keywords: ["government", "gov-id", "government id", "gov-id verification"],
    response:
      "Government ID verification is available via /api/verify/gov-id. This lets workers verify their identity to employers while protecting privacy. ElasticOS supports GOVERNMENT as a user role for oversight and compliance.",
  },
  {
    keywords: ["engagement intensity", "affiliation", "affiliation record"],
    response:
      "Engagement intensity is a 0–1 scale measuring how much you're working with an employer. Affiliation records track your relationship status: ACTIVE (ongoing), ADJUSTED (terms changed), TERMINATED (ended), or REACTIVATED (resumed). These replace binary employed/unemployed states.",
  },
  {
    keywords: ["mfa", "multi-factor", "two-factor", "2fa", "authenticator"],
    response:
      "To set up MFA, call POST /api/auth/mfa/setup first to get a QR code. Add it to your authenticator app, then verify with POST /api/auth/mfa/verify using the generated token. MFA is available for both workers and employers.",
  },
  {
    keywords: ["role", "roles", "user role", "worker", "employer", "government"],
    response:
      "ElasticOS has three user roles: WORKER (people who take on engagements), EMPLOYER (organizations offering work), and GOVERNMENT (for oversight and compliance). Your role determines what you can do and what verification flows apply.",
  },
  {
    keywords: ["skill", "proficiency", "skills"],
    response:
      "Skills use a proficiency scale of 1–5. Workers can record their skills and proficiency levels, helping employers match engagements to capability.",
  },
  {
    keywords: ["help", "how", "guide", "start", "getting started"],
    response:
      "Here's a quick guide: 1) Register as a worker or employer. 2) Set up MFA for security. 3) Complete verification (employer or gov-id for workers). 4) Start recording engagements and affiliation records. Ask me about any step in more detail!",
  },
];

function getReply(message: string): string {
  const normalized = message.toLowerCase().trim();

  for (const { keywords, response } of KNOWLEDGE) {
    if (keywords.some((k) => normalized.includes(k))) {
      return response;
    }
  }

  return "I can help with questions about ElasticOS: what it is, registration, employer/government verification, MFA, user roles, engagement intensity, affiliation records, and skills. Try: \"What is ElasticOS?\" or \"How do I set up MFA?\"";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message ?? "";
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const reply = getReply(message);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
