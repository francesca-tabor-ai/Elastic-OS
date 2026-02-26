// Shared types and constants for ElasticOS
import type { UserRole, AffiliationRecordType } from "@elastic-os/db";

export type { UserRole, AffiliationRecordType };

export const USER_ROLES = ["WORKER", "EMPLOYER", "GOVERNMENT", "ADMIN"] as const;
export type UserRoleType = (typeof USER_ROLES)[number];

/** Roles that can self-register (ADMIN is created by other admins or seed) */
export const REGISTRABLE_ROLES = ["WORKER", "EMPLOYER", "GOVERNMENT"] as const;
export type RegistrableRoleType = (typeof REGISTRABLE_ROLES)[number];

export const AFFILIATION_RECORD_TYPES = ["ACTIVE", "ADJUSTED", "TERMINATED", "REACTIVATED"] as const;

// Engagement intensity bounds
export const MIN_ENGAGEMENT_INTENSITY = 0;
export const MAX_ENGAGEMENT_INTENSITY = 1;

// Proficiency scale for skills (1-5)
export const MIN_PROFICIENCY = 1;
export const MAX_PROFICIENCY = 5;
