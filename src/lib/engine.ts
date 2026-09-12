import { allergenLabel, listToProse } from "./allergens";
import type {
  HouseholdMember,
  Ingredient,
  Product,
  RuleHit,
  Verdict,
  VerdictStatus,
} from "./types";

/* The safety-critical core. Everything here is deterministic: same product plus
   same profile always returns the same verdict. No model is consulted. */

function evaluateIngredient(
  ingredient: Ingredient,
  member: HouseholdMember,
): { hit?: RuleHit; bystander?: RuleHit; unknown?: Ingredient } {
  if (ingredient.unknown) {
    // Missing mapping is never treated as safe.
    return { unknown: ingredient };
  }

  if (!ingredient.mappedTo) return {};

  if (member.allergens.includes(ingredient.mappedTo)) {
    return {
      hit: { ingredient, allergenId: ingredient.mappedTo, reason: "allergen" },
    };
  }

  if (ingredient.mappedTo === "wheat" && member.protocols.includes("gluten_free")) {
    return {
      hit: { ingredient, allergenId: ingredient.mappedTo, reason: "protocol" },
    };
  }

  // Maps to a tracked allergen, just not one this member reacts to.
  return {
    bystander: { ingredient, allergenId: ingredient.mappedTo, reason: "allergen" },
  };
}

export function computeVerdict(
  product: Product,
  member: HouseholdMember,
): Verdict {
  const hits: RuleHit[] = [];
  const bystanders: RuleHit[] = [];
  const unknowns: Ingredient[] = [];

  for (const ingredient of product.ingredients) {
    const result = evaluateIngredient(ingredient, member);
    if (result.hit) hits.push(result.hit);
    if (result.bystander) bystanders.push(result.bystander);
    if (result.unknown) unknowns.push(result.unknown);
  }

  const status: VerdictStatus =
    hits.length > 0
      ? "CONTAINS_ALLERGEN"
      : unknowns.length > 0
        ? "UNKNOWN_INGREDIENT"
        : "PASS";

  return { status, hits, unknowns, bystanders };
}

export function triggeredLabels(verdict: Verdict): string[] {
  return [...new Set(verdict.hits.map((hit) => allergenLabel(hit.allergenId)))];
}

export function verdictHeadline(
  verdict: Verdict,
  member: HouseholdMember,
): { kicker: string; title: string; detail: string } {
  if (verdict.status === "CONTAINS_ALLERGEN") {
    const labels = triggeredLabels(verdict);
    return {
      kicker: "Contains allergen",
      title: `Not safe for ${member.name}`,
      detail: `${listToProse(labels)} ${labels.length > 1 ? "were" : "was"} found in this product.`,
    };
  }

  if (verdict.status === "UNKNOWN_INGREDIENT") {
    return {
      kicker: "Unknown ingredient",
      title: `Not confirmed for ${member.name}`,
      detail: `One ingredient is missing from the mapping table, so FoodWise will not call this safe.`,
    };
  }

  return {
    kicker: "No match found",
    title: `Safe for ${member.name}`,
    detail: `Nothing in this panel matches ${member.name}'s profile.`,
  };
}

export function ruleLine(hit: RuleHit): string {
  const label = allergenLabel(hit.allergenId);
  return hit.reason === "protocol"
    ? `Maps to ${label}, flagged by the gluten-free protocol.`
    : `Maps to ${label} in the ingredient mapping table.`;
}
