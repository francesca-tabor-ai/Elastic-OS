import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@elastic-os/auth";
import type { AdminUser } from "@elastic-os/auth";

export async function getAdminSession(): Promise<AdminUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  requireAdmin(session.user as Parameters<typeof requireAdmin>[0]);
  return session.user as AdminUser;
}
