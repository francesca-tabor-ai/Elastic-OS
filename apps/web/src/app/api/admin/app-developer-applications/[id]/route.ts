import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import { getAdminSession } from "@/lib/admin";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    const { id } = await params;
    const app = await prisma.appDeveloperApplication.findUnique({ where: { id } });
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(app);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    const { id } = await params;
    const body = await req.json();

    const app = await prisma.appDeveloperApplication.update({
      where: { id },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.email && { email: body.email }),
        ...(body.company && { company: body.company }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.country && { country: body.country }),
        ...(Array.isArray(body.appType) && { appType: body.appType }),
        ...(body.targetAudience && { targetAudience: body.targetAudience }),
        ...(body.appConcept && { appConcept: body.appConcept }),
        ...(body.problemSolved !== undefined && { problemSolved: body.problemSolved }),
        ...(body.hasIntegrationsExperience !== undefined && { hasIntegrationsExperience: body.hasIntegrationsExperience }),
        ...(body.technicalApproach !== undefined && { technicalApproach: body.technicalApproach }),
        ...(body.marketingOptIn !== undefined && { marketingOptIn: body.marketingOptIn }),
        ...(body.status && { status: body.status }),
      },
    });
    return NextResponse.json(app);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    const { id } = await params;
    await prisma.appDeveloperApplication.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
