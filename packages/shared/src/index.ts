// Shared types and constants for ElasticOS (defined locally for Vercel/module resolution compatibility)
export const USER_ROLES = ["WORKER", "EMPLOYER", "GOVERNMENT", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export type UserRoleType = UserRole;

/** Roles that can self-register (ADMIN is created by other admins or seed) */
export const REGISTRABLE_ROLES = ["WORKER", "EMPLOYER", "GOVERNMENT"] as const;
export type RegistrableRoleType = (typeof REGISTRABLE_ROLES)[number];

export const AFFILIATION_RECORD_TYPES = ["ACTIVE", "ADJUSTED", "TERMINATED", "REACTIVATED"] as const;
export type AffiliationRecordType = (typeof AFFILIATION_RECORD_TYPES)[number];

// Engagement intensity bounds
export const MIN_ENGAGEMENT_INTENSITY = 0;
export const MAX_ENGAGEMENT_INTENSITY = 1;

// Proficiency scale for skills (1-5)
export const MIN_PROFICIENCY = 1;
export const MAX_PROFICIENCY = 5;

// Phase 1: Affiliation status and benefits
export const BENEFITS_STATUS = ["FULL", "PRO_RATED", "MINIMAL", "NONE"] as const;
export type BenefitsStatusType = (typeof BENEFITS_STATUS)[number];

export const AFFILIATION_STATUS = [
  "FULL_ENGAGEMENT",
  "PARTIAL_ENGAGEMENT",
  "ELASTIC_RETENTION",
  "MINIMAL_AFFILIATION",
  "FULLY_DETACHED",
] as const;
export type AffiliationStatusType = (typeof AFFILIATION_STATUS)[number];
