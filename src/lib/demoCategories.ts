import type { HouseholdMember } from "./types";

/** Catalog category names that match the sample household. */
const DEMO_CATEGORIES: Record<string, string[]> = {
  leo: ["peanuts", "tree nuts"],
  maya: ["milk", "wheat", "gluten"],
};

type NamedCategory = { id: number; name: string };

export function withDemoCategories(
  members: HouseholdMember[],
  categories: NamedCategory[],
): HouseholdMember[] {
  const byName = new Map(categories.map((category) => [category.name.toLowerCase(), category]));
  return members.map((member) => {
    const names = DEMO_CATEGORIES[member.id];
    if (!names) return member;
    const matched = names.flatMap((name) => {
      const category = byName.get(name);
      return category ? [category] : [];
    });
    if (matched.length === 0) return member;
    return {
      ...member,
      categoryIds: matched.map((category) => category.id),
      categoryNames: matched.map((category) => category.name),
    };
  });
}
