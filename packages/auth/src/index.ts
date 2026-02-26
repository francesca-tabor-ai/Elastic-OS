// Auth helpers and role checks for ElasticOS
import type { UserRole } from "@elastic-os/db";

// Base session user - use for generic auth checks
export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  workerId?: string;
  employerId?: string;
};

// Discriminated union types for type-safe handling per user type
export type WorkerUser = SessionUser & {
  role: "WORKER";
  workerId: string;
  employerId?: never;
};

export type EmployerUser = SessionUser & {
  role: "EMPLOYER";
  employerId: string;
  workerId?: never;
};

export type GovernmentUser = SessionUser & {
  role: "GOVERNMENT";
  workerId?: never;
  employerId?: never;
};

export type AdminUser = SessionUser & {
  role: "ADMIN";
  workerId?: never;
  employerId?: never;
};

export type TypedUser = WorkerUser | EmployerUser | GovernmentUser | AdminUser;

/** Type guard: narrow SessionUser to WorkerUser */
export function isWorkerUser(user: SessionUser | null): user is WorkerUser {
  return !!user && user.role === "WORKER" && !!user.workerId;
}

/** Type guard: narrow SessionUser to EmployerUser */
export function isEmployerUser(user: SessionUser | null): user is EmployerUser {
  return !!user && user.role === "EMPLOYER" && !!user.employerId;
}

/** Type guard: narrow SessionUser to GovernmentUser */
export function isGovernmentUser(user: SessionUser | null): user is GovernmentUser {
  return !!user && user.role === "GOVERNMENT";
}

/** Type guard: narrow SessionUser to AdminUser */
export function isAdminUser(user: SessionUser | null): user is AdminUser {
  return !!user && user.role === "ADMIN";
}

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

export function requireGovernment(user: SessionUser | null): asserts user is GovernmentUser {
  requireRole(user, ["GOVERNMENT"]);
}

export function requireAdmin(user: SessionUser | null): asserts user is AdminUser {
  requireRole(user, ["ADMIN"]);
}
