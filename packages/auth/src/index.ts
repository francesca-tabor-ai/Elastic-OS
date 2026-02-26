// Auth helpers and role checks for ElasticOS
import type { UserRole } from "@elastic-os/db";

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  workerId?: string;
  employerId?: string;
};

export function requireRole(
  user: SessionUser | null,
  allowedRoles: UserRole[]
): asserts user is SessionUser {
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: insufficient permissions");
  }
}

export function requireWorker(user: SessionUser | null): asserts user is SessionUser {
  requireRole(user, ["WORKER"]);
  if (!user.workerId) {
    throw new Error("Worker profile not found");
  }
}

export function requireEmployer(user: SessionUser | null): asserts user is SessionUser {
  requireRole(user, ["EMPLOYER"]);
  if (!user.employerId) {
    throw new Error("Employer profile not found");
  }
}

export function requireGovernment(user: SessionUser | null): asserts user is SessionUser {
  requireRole(user, ["GOVERNMENT"]);
}
