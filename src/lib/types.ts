export type AllergenId =
  | "milk"
  | "egg"
  | "fish"
  | "shellfish"
  | "tree_nut"
  | "peanut"
  | "wheat"
  | "soy"
  | "sesame"
  | "sulfite"
  | "lupin"
  | "mustard";

export type ProtocolId = "gluten_free" | "additive_averse";

export type LookupStatus = "LOOKUP_FAILED" | "UNKNOWN_PRODUCT" | "INSUFFICIENT_DATA";

/** A barcode neither Foodwise nor Open Food Facts could identify. It is a result, not a product. */
export function isUnverifiedLookup(status: string | null | undefined): boolean {
  return status === "LOOKUP_FAILED" || status === "UNKNOWN_PRODUCT";
}

export type VerdictStatus =
  | LookupStatus
  | "PASS"
  | "CONTAINS_ALLERGEN"
  | "UNKNOWN_INGREDIENT";

export type Disclosure = {
  name: string;
  plain: string;
};

export type HouseholdMember = {
  id: string;
  name: string;
  relation: string;
  allergens: AllergenId[];
  protocols: ProtocolId[];
  /** Selected rows from `allergen_categories` for a signed-in household. */
  categoryIds?: number[];
  categoryNames?: string[];
};

export type Ingredient = {
  id: string;
  label: string;
  /** Set when the ingredient maps to a tracked allergen in the mapping table. */
  mappedTo?: AllergenId;
  /** Database category from `allergen_categories`, used for account profiles. */
  categoryId?: number;
  categoryName?: string;
  categoryType?: "allergen" | "additive";
  /** True when the mapping table has no entry, so safety cannot be computed. */
  unknown?: boolean;
  /** Plain-language translation of a technical name. */
  plain?: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  capture: "barcode" | "ocr";
  source: string;
  image: string;
  ingredients: Ingredient[];
  /** Set when the catalog itself cannot support a pass, before any member is compared. */
  lookupStatus?: LookupStatus;
  /** Label notices such as Prop 65. They never change the verdict. */
  disclosures?: Disclosure[];
};

export type RuleHit = {
  ingredient: Ingredient;
  allergenId?: AllergenId;
  categoryName?: string;
  /** Why the rule fired: a direct allergen match or a dietary protocol. */
  reason: "allergen" | "protocol";
};

export type Verdict = {
  status: VerdictStatus;
  hits: RuleHit[];
  unknowns: Ingredient[];
  /** Ingredients that map to an allergen this member does not react to. */
  bystanders: RuleHit[];
};

export type RecentScan = {
  productId: string;
  memberId: string;
  memberName: string;
  status: VerdictStatus;
  at: number;
};

export type HouseholdState = {
  shopperName: string;
  members: HouseholdMember[];
  selectedMemberId: string | null;
  recentScans: RecentScan[];
  onboarded: boolean;
  /** Demo stays on this device. Account households are stored in Supabase. */
  source: "local" | "demo" | "account";
};
