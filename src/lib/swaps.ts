import { computeVerdict } from "./engine";
import type { HouseholdMember, Product, RuleHit } from "./types";

export type IngredientSwap = {
  id: number;
  replacesLabel: string;
  swapLabel: string;
  useContext: string;
  note: string;
  source: string;
  fromIngredientId: number | null;
  swapIngredientId: number | null;
  swapCategoryIds: number[];
  sortOrder: number;
};

export function joinNames(names: string[]): string {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  if (unique.length <= 1) return unique[0] ?? "";
  if (unique.length === 2) return `${unique[0]} and ${unique[1]}`;
  return `${unique.slice(0, -1).join(", ")}, and ${unique[unique.length - 1]}`;
}

export function productContainsLine(allergens: string[]): string {
  return `This product contains ${joinNames(allergens)}.`;
}

export function swapTryLine(swap: IngredientSwap): string {
  const use = swap.useContext.trim().replace(/\.+$/, "");
  const where = use
    ? ` It works well in ${use.charAt(0).toLowerCase()}${use.slice(1)}.`
    : "";
  return `Try ${swap.swapLabel} instead.${where}`;
}

export function noSwapLine(allergens: string[]): string {
  return `Contains ${joinNames(allergens)}. We don’t have a swap for this one yet — check the label of other products.`;
}

/** Approved substitutes for this member's conflicts. A swap the member also reacts to is left out. */
export function swapsForMember(
  swaps: IngredientSwap[],
  product: Product,
  member: HouseholdMember,
): IngredientSwap[] {
  const hits = computeVerdict(product, member).hits;
  if (hits.length === 0) return [];

  const texts = [product.name, product.brand, ...product.ingredients.map((item) => item.label)]
    .join("\n")
    .toLowerCase();
  const blocked = new Set(member.categoryIds ?? []);
  const candidates = swaps.filter((swap) => {
    if (swap.swapCategoryIds.some((id) => blocked.has(id))) return false;
    return matchesSwap(swap, hits, texts);
  });
  return preferSpecific(candidates, texts);
}

function matchesSwap(swap: IngredientSwap, hits: RuleHit[], texts: string): boolean {
  const role = swap.replacesLabel.toLowerCase();
  if (role && texts.includes(role)) return true;
  if (
    swap.fromIngredientId != null &&
    hits.some((hit) => hit.ingredient.ingredientId === swap.fromIngredientId)
  ) {
    return true;
  }
  if (
    role === "cow's milk" &&
    hits.some(
      (hit) =>
        hit.categoryName === "milk" &&
        /\b(milk|lait)\b/i.test(hit.ingredient.label) &&
        !/\b(butter|almond|amande)\b/i.test(hit.ingredient.label),
    )
  ) {
    return true;
  }
  if (
    role === "nut butters" &&
    hits.some((hit) => hit.categoryName === "tree nuts") &&
    /\b(spread|nutella|hazelnut)\b/i.test(texts) &&
    !/\bpeanut butter\b/i.test(texts)
  ) {
    return true;
  }
  return false;
}

function preferSpecific(swaps: IngredientSwap[], texts: string): IngredientSwap[] {
  const roles = [...new Set(swaps.map((swap) => swap.replacesLabel.toLowerCase()))];
  const present = roles.filter((role) => texts.includes(role));
  const shadowed = new Set(
    roles.filter((role) =>
      present.some((other) => other !== role && other.includes(role) && other.length > role.length),
    ),
  );
  const presentIds = new Set(
    swaps
      .filter((swap) => {
        const role = swap.replacesLabel.toLowerCase();
        return present.includes(role) && !shadowed.has(role) && swap.fromIngredientId != null;
      })
      .map((swap) => swap.fromIngredientId),
  );
  const chosen = swaps.filter((swap) => {
    const role = swap.replacesLabel.toLowerCase();
    if (shadowed.has(role)) return false;
    if (
      swap.fromIngredientId != null &&
      presentIds.has(swap.fromIngredientId) &&
      !present.includes(role)
    ) {
      return false;
    }
    return true;
  });
  const seen = new Set<number>();
  return chosen
    .filter((swap) => {
      if (seen.has(swap.id)) return false;
      seen.add(swap.id);
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}
