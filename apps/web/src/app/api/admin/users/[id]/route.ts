import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/admin";
import { USER_ROLES } from "@elastic-os/shared";

const SALT_ROUNDS = 10;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAdminSession();
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { worker: true, employer: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
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
    const { email, name, password, role } = body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (role && !USER_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const passwordHash = password
      ? await bcrypt.hash(password, SALT_ROUNDS)
      : undefined;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(name !== undefined && { name }),
        ...(passwordHash && { passwordHash }),
        ...(role && { role }),
      },
      include: { worker: true, employer: true },
    });
    return NextResponse.json(user);
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
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
