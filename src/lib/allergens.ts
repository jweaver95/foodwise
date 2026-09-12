import type { AllergenId, ProtocolId } from "./types";

/* The nine allergens US labels are legally required to call out. */
export const BIG_NINE: { id: AllergenId; label: string }[] = [
  { id: "milk", label: "Milk" },
  { id: "egg", label: "Egg" },
  { id: "peanut", label: "Peanut" },
  { id: "tree_nut", label: "Tree nut" },
  { id: "soy", label: "Soy" },
  { id: "wheat", label: "Wheat" },
  { id: "fish", label: "Fish" },
  { id: "shellfish", label: "Shellfish" },
  { id: "sesame", label: "Sesame" },
];

/* Tracked beyond the legal minimum, which is the point of the product. */
export const EXTRA_IRRITANTS: { id: AllergenId; label: string }[] = [
  { id: "sulfite", label: "Sulfites" },
  { id: "lupin", label: "Lupin" },
  { id: "mustard", label: "Mustard" },
];

export const ALL_ALLERGENS = [...BIG_NINE, ...EXTRA_IRRITANTS];

export const PROTOCOLS: { id: ProtocolId; label: string; hint: string }[] = [
  {
    id: "gluten_free",
    label: "Gluten-free",
    hint: "Flags wheat and gluten-bearing derivatives",
  },
  {
    id: "additive_averse",
    label: "Additive-averse",
    hint: "Calls out processing agents by name",
  },
];

export function allergenLabel(id: AllergenId): string {
  return ALL_ALLERGENS.find((item) => item.id === id)?.label ?? id;
}

export function protocolLabel(id: ProtocolId): string {
  return PROTOCOLS.find((item) => item.id === id)?.label ?? id;
}

export function summarizeProfile(
  allergens: AllergenId[],
  protocols: ProtocolId[] = [],
): string {
  const parts = [
    ...allergens.map(allergenLabel),
    ...protocols.map(protocolLabel),
  ];
  if (parts.length === 0) return "No restrictions set";
  return parts.join(", ");
}

export function listToProse(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}
