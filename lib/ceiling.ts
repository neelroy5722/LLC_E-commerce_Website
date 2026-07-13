/**
 * Ceiling-Height Recommendation Tool logic.
 *
 * Thresholds are data-driven so they can be tuned later without touching the
 * component (Milestone 2 moves this table into an admin-editable settings row).
 * A recommendation is the tallest bed height whose required minimum ceiling is
 * satisfied by the room, so the customer keeps comfortable sitting headroom.
 */
import type { HeightId } from "./products";

export interface CeilingRule {
  /** Recommend this height when the ceiling is at least `minCeilingFt`. */
  height: HeightId;
  label: string;
  minCeilingFt: number;
  rationale: string;
}

/**
 * Ordered from tallest requirement to shortest. Evaluated top-down; the first
 * rule the ceiling satisfies wins. Example baseline from the brief:
 *   ≤ 8 ft  → Low, ≤ 9 ft → Medium, else → High.
 */
export const CEILING_RULES: CeilingRule[] = [
  {
    height: "high",
    label: "High",
    minCeilingFt: 9.01,
    rationale: "Your ceiling comfortably clears the tall deck with room to sit up.",
  },
  {
    height: "medium",
    label: "Medium",
    minCeilingFt: 8.01,
    rationale: "A medium deck gives you storage while keeping safe sitting headroom.",
  },
  {
    height: "low",
    label: "Low",
    minCeilingFt: 0,
    rationale: "A low deck keeps a safe gap above your head on a shorter ceiling.",
  },
];

/** The shortest ceiling we consider valid input (in feet). */
export const MIN_VALID_CEILING_FT = 6;
export const MAX_VALID_CEILING_FT = 20;

export interface CeilingRecommendation {
  height: HeightId;
  label: string;
  rationale: string;
}

/**
 * Recommend a bed height for a given ceiling height in feet.
 * Returns null for out-of-range / invalid input so the UI can guide the user.
 */
export function recommendHeight(ceilingFt: number): CeilingRecommendation | null {
  if (!Number.isFinite(ceilingFt)) return null;
  if (ceilingFt < MIN_VALID_CEILING_FT || ceilingFt > MAX_VALID_CEILING_FT) return null;

  for (const rule of CEILING_RULES) {
    if (ceilingFt >= rule.minCeilingFt) {
      return { height: rule.height, label: rule.label, rationale: rule.rationale };
    }
  }
  // Fallback (rules always end at 0, so this is unreachable in practice).
  const fallback = CEILING_RULES[CEILING_RULES.length - 1];
  return { height: fallback.height, label: fallback.label, rationale: fallback.rationale };
}

/** Convert a feet + inches entry to decimal feet. */
export function toDecimalFeet(feet: number, inches: number): number {
  return feet + (inches || 0) / 12;
}
