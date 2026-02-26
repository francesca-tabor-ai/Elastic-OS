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
    const employer = await prisma.employer.findUnique({
      where: { id },
      include: {
        user: true,
        employerProfile: true,
        departments: true,
        jobRoles: true,
        contractTypes: true,
      },
    });
    if (!employer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(employer);
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
    const { legalEntityVerifiedAt, companiesHouseNumber } = body;

    const employer = await prisma.employer.update({
      where: { id },
      data: {
        ...(legalEntityVerifiedAt !== undefined && {
          legalEntityVerifiedAt: legalEntityVerifiedAt ? new Date(legalEntityVerifiedAt) : null,
        }),
        ...(companiesHouseNumber !== undefined && { companiesHouseNumber }),
      },
      include: { user: true, employerProfile: true },
    });
    return NextResponse.json(employer);
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
    await prisma.employer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
