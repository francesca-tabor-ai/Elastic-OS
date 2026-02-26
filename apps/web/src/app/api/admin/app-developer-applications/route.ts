import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";

export async function GET() {
  try {
    await getAdminSession();
    const apps = await prisma.appDeveloperApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(apps);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await getAdminSession();
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      company,
      website,
      country,
      appType,
      targetAudience,
      appConcept,
      problemSolved,
      hasIntegrationsExperience,
      technicalApproach,
      marketingOptIn,
      status,
    } = body;

    if (!firstName || !lastName || !email || !company || !country || !targetAudience || !appConcept) {
      return NextResponse.json(
        { error: "firstName, lastName, email, company, country, targetAudience, appConcept are required" },
        { status: 400 }
      );
    }

    const app = await prisma.appDeveloperApplication.create({
      data: {
        firstName,
        lastName,
        email,
        company,
        website: website ?? undefined,
        country,
        appType: Array.isArray(appType) ? appType : [],
        targetAudience,
        appConcept,
        problemSolved: problemSolved ?? undefined,
        hasIntegrationsExperience: hasIntegrationsExperience ?? false,
        technicalApproach: technicalApproach ?? undefined,
        marketingOptIn: marketingOptIn ?? false,
        status: status ?? "PENDING",
      },
    });
    return NextResponse.json(app);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
