import type { Ingredient } from "./types";

export type CatalogCategory = {
  id: number;
  name: string;
  categoryType: "allergen" | "additive";
};

export type CatalogTerm = {
  technicalName: string;
  categoryId: number;
  categoryName: string;
  categoryType: "allergen" | "additive";
  wholeWord?: boolean;
  exceptions?: string[];
};

/** Whole-word aliases for category names. Short words stay bounded so "egg" does not match "eggplant". */
const ALIASES: Record<string, string[]> = {
  milk: ["milk", "butter", "cream", "cheese", "ghee", "yogurt", "yoghurt"],
  eggs: ["egg", "eggs"],
  peanuts: ["peanut", "peanuts", "groundnut", "groundnuts"],
  "tree nuts": [
    "almond",
    "almonds",
    "cashew",
    "cashews",
    "walnut",
    "walnuts",
    "hazelnut",
    "hazelnuts",
    "pecan",
    "pecans",
    "pistachio",
    "pistachios",
    "macadamia",
    "brazil nut",
    "pine nut",
  ],
  wheat: ["wheat"],
  soy: ["soy", "soya", "soybean", "soybeans", "edamame", "tofu"],
  fish: ["fish", "anchovy", "anchovies", "cod", "salmon", "tuna", "sardine", "sardines"],
  shellfish: [
    "shellfish",
    "shrimp",
    "prawn",
    "prawns",
    "crab",
    "lobster",
    "crayfish",
    "oyster",
    "mussel",
    "scallop",
  ],
  sesame: ["sesame", "tahini"],
  gluten: ["gluten", "barley", "rye"],
  sulfites: ["sulfite", "sulfites", "sulphite", "sulphites"],
  msg: ["msg"],
  mustard: ["mustard"],
  celery: ["celery"],
};

const OFF_TAG_TO_CATEGORY: Record<string, string> = {
  "en:milk": "milk",
  "en:eggs": "eggs",
  "en:peanuts": "peanuts",
  "en:nuts": "tree nuts",
  "en:gluten": "gluten",
  "en:soybeans": "soy",
  "en:wheat": "wheat",
  "en:fish": "fish",
  "en:crustaceans": "shellfish",
  "en:molluscs": "shellfish",
  "en:sesame-seeds": "sesame",
  "en:sulphur-dioxide-and-sulphites": "sulfites",
  "en:mustard": "mustard",
  "en:celery": "celery",
};

/** Phrases that contain an alias but are not that allergen. */
const ALIAS_EXCEPTIONS: Record<string, string[]> = {
  butter: [
    "peanut butter",
    "cocoa butter",
    "cacao butter",
    "shea butter",
    "apple butter",
    "almond butter",
    "cashew butter",
    "sunflower butter",
    "nut butter",
  ],
  cream: ["cream of tartar"],
};

const PLAIN = new Set([
  "water",
  "salt",
  "sea salt",
  "sugar",
  "cane sugar",
  "brown sugar",
  "vinegar",
  "rice vinegar",
  "citric acid",
  "ascorbic acid",
  "phosphoric acid",
  "carbon dioxide",
  "honey",
  "molasses",
  "vanilla",
  "caffeine",
  "sunflower oil",
  "rapeseed oil",
  "canola oil",
  "olive oil",
  "palm oil",
  "cocoa",
  "cocoa butter",
  "cocoa mass",
  "cacao",
  "natural flavor",
  "natural flavors",
  "natural flavorings",
  "natural flavourings",
  "sodium bicarbonate",
  "baking soda",
  "oats",
  "whole oats",
  "whole grain oats",
  "rolled oats",
]);

function isPlain(phrase: string): boolean {
  if (PLAIN.has(phrase)) return true;
  for (const term of PLAIN) {
    if (term.includes(" ")) {
      if (phrase.includes(term)) return true;
    } else if (containsWord(phrase, term)) {
      return true;
    }
  }
  return false;
}

function containsWord(haystack: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z])${escaped}(?:$|[^a-z])`, "i").test(haystack);
}

function aliasHits(haystack: string, word: string): boolean {
  if (!containsWord(haystack, word)) return false;
  const exceptions = ALIAS_EXCEPTIONS[word] ?? [];
  return !exceptions.some((phrase) => haystack.includes(phrase));
}

function normalizePhrase(label: string): string {
  return label
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\d+(\.\d+)?\s*%/g, " ")
    .replace(/[^a-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitIngredientText(text: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;

  for (const char of text) {
    if (char === "(" || char === "[") depth += 1;
    if ((char === ")" || char === "]") && depth > 0) depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current);

  return parts
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => /[a-z]/i.test(part));
}

function slug(label: string, index: number): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${base || "ingredient"}-${index}`;
}

function termMatches(raw: string, term: CatalogTerm): boolean {
  const name = term.technicalName.toLowerCase();
  const hit = term.wholeWord ? containsWord(raw, name) : raw.includes(name);
  if (!hit) return false;
  return !(term.exceptions ?? []).some(
    (phrase) => phrase && raw.includes(phrase.toLowerCase()),
  );
}

function mappedIngredient(
  label: string,
  index: number,
  category: CatalogCategory,
  plain: string,
): Ingredient {
  return {
    id: slug(label, index),
    label,
    categoryId: category.id,
    categoryName: category.name,
    categoryType: category.categoryType,
    plain,
  };
}

export function classifyIngredients(
  text: string,
  terms: CatalogTerm[],
  categories: CatalogCategory[],
  allergenTags: string[] = [],
): Ingredient[] {
  const byName = new Map(categories.map((category) => [category.name, category]));
  const ingredients = splitIngredientText(text).map((label, index) => {
    const raw = label.toLowerCase();
    const term = terms
      .filter((item) => termMatches(raw, item))
      .sort((a, b) => b.technicalName.length - a.technicalName.length)[0];

    if (term) {
      const category = byName.get(term.categoryName);
      if (category) {
        return mappedIngredient(
          label,
          index,
          category,
          `${term.technicalName} is in the mapping table as ${category.name}.`,
        );
      }
    }

    for (const category of categories) {
      const words = ALIASES[category.name] ?? [category.name];
      const word = words.find((candidate) => aliasHits(raw, candidate));
      if (word) {
        return mappedIngredient(
          label,
          index,
          category,
          `The name matches ${category.name} in the mapping table.`,
        );
      }
    }

    const phrase = normalizePhrase(label);
    if (isPlain(phrase)) {
      return { id: slug(label, index), label };
    }

    return {
      id: slug(label, index),
      label,
      unknown: true,
      plain:
        "The product is not found, so it is not treated as safe.",
    };
  });

  const seen = new Set(
    ingredients
      .map((ingredient) => ingredient.categoryName)
      .filter((name): name is string => Boolean(name)),
  );

  for (const tag of allergenTags) {
    const categoryName = OFF_TAG_TO_CATEGORY[tag];
    const category = categoryName ? byName.get(categoryName) : undefined;
    if (!category || seen.has(category.name)) continue;
    seen.add(category.name);
    ingredients.push(
      mappedIngredient(
        `Declared allergen: ${category.name}`,
        ingredients.length,
        category,
        "Open Food Facts lists this allergen on the product, even when the ingredient line uses another language.",
      ),
    );
  }

  return ingredients;
}
