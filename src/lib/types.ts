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

export type VerdictStatus = "PASS" | "CONTAINS_ALLERGEN" | "UNKNOWN_INGREDIENT";

export type HouseholdMember = {
  id: string;
  name: string;
  relation: string;
  allergens: AllergenId[];
  protocols: ProtocolId[];
};

export type Ingredient = {
  id: string;
  label: string;
  /** Set when the ingredient maps to a tracked allergen in the mapping table. */
  mappedTo?: AllergenId;
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
};

export type RuleHit = {
  ingredient: Ingredient;
  allergenId: AllergenId;
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
};
