import type { BenefitsStatusType, AffiliationStatusType } from "@elastic-os/shared";

/**
 * Phase 1: Compensation Modulation Engine
 * Formula: Compensation = BaseSalary × EngagementIntensity
 */
export function calculateCompensation(baseSalary: number, intensity: number): number {
  return baseSalary * intensity;
}

/**
 * Benefit eligibility by engagement intensity
 * FULL > 0.8, PRO_RATED 0.5-0.8, MINIMAL 0.2-0.5, NONE < 0.2
 */
export function getBenefitsStatus(intensity: number): BenefitsStatusType {
  if (intensity > 0.8) return "FULL";
  if (intensity >= 0.5) return "PRO_RATED";
  if (intensity >= 0.2) return "MINIMAL";
  return "NONE";
}

/**
 * Elastic affiliation status by engagement intensity
 */
export function getAffiliationStatus(intensity: number): AffiliationStatusType {
  if (intensity >= 0.8) return "FULL_ENGAGEMENT";
  if (intensity >= 0.5) return "PARTIAL_ENGAGEMENT";
  if (intensity >= 0.3) return "ELASTIC_RETENTION";
  if (intensity >= 0.1) return "MINIMAL_AFFILIATION";
  return "FULLY_DETACHED";
}
