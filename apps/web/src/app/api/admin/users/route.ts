import { NextResponse } from "next/server";
import { prisma } from "@elastic-os/db";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/admin";
import { USER_ROLES } from "@elastic-os/shared";

const SALT_ROUNDS = 10;

export async function GET() {
  try {
    await getAdminSession();
    const users = await prisma.user.findMany({
      include: { worker: true, employer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await getAdminSession();
    const body = await req.json();
    const { email, name, password, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "email and role are required" },
        { status: 400 }
      );
    }
    if (!USER_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const passwordHash = password
      ? await bcrypt.hash(password, SALT_ROUNDS)
      : undefined;
    if (!passwordHash && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Password required for non-admin users" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name ?? undefined,
        passwordHash,
        role,
      },
    });

    if (role === "WORKER") {
      await prisma.worker.create({ data: { userId: user.id } });
    } else if (role === "EMPLOYER") {
      await prisma.employer.create({ data: { userId: user.id } });
    }

    const created = await prisma.user.findUnique({
      where: { id: user.id },
      include: { worker: true, employer: true },
    });
    return NextResponse.json(created);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json({ error: msg }, { status: e instanceof Error && e.message === "Unauthorized" ? 401 : 500 });
  }
}
