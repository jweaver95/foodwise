import type { Ingredient } from "./types";

export type CatalogCategory = {
  id: number;
  name: string;
  categoryType: "allergen" | "additive";
};

export type CatalogTerm = {
  technicalName: string;
  /** Missing when this alias only blocks a shorter, less specific match. */
  categoryId?: number;
  categoryName?: string;
  categoryType?: "allergen" | "additive";
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

function presentName(name: string): string {
  return name.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function termSpans(raw: string, term: CatalogTerm): { start: number; end: number; term: CatalogTerm }[] {
  const name = term.technicalName.toLowerCase().trim();
  if (name.length < 3 || !raw.includes(name)) return [];
  if ((term.exceptions ?? []).some((phrase) => phrase && raw.includes(phrase.toLowerCase()))) {
    return [];
  }

  const spans: Array<[number, number]> = [];
  if (term.wholeWord) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?:^|[^a-z])(${escaped})(?:$|[^a-z])`, "gi");
    for (const match of raw.matchAll(pattern)) {
      const index = match.index ?? 0;
      const start = index + match[0].indexOf(match[1]);
      spans.push([start, start + match[1].length]);
    }
  } else {
    let from = 0;
    while (from < raw.length) {
      const start = raw.indexOf(name, from);
      if (start < 0) break;
      spans.push([start, start + name.length]);
      from = start + 1;
    }
  }

  return spans.map(([start, end]) => ({ start, end, term }));
}

/** Every category in this line. A longer alias wins over a shorter one it covers. */
function categorizedMatches(raw: string, terms: CatalogTerm[]): CatalogTerm[] {
  const hits = terms.flatMap((term) => termSpans(raw, term));
  const kept = hits.filter(
    (hit) =>
      !hits.some(
        (other) =>
          other.start <= hit.start &&
          other.end >= hit.end &&
          other.end - other.start > hit.end - hit.start,
      ),
  );
  const seen = new Set<number>();
  const matched: CatalogTerm[] = [];
  for (const hit of kept.sort((a, b) => a.start - b.start || b.end - a.end)) {
    if (hit.term.categoryId == null || !hit.term.categoryName) continue;
    if (seen.has(hit.term.categoryId)) continue;
    seen.add(hit.term.categoryId);
    matched.push(hit.term);
  }
  return matched;
}

function decodeIngredientText(text: string): string {
  return text
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/g, "'");
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

export function allergenMatchNames(ingredients: Ingredient[]): string[] {
  return [
    ...new Set(
      ingredients.flatMap((ingredient) => (ingredient.categoryName ? [ingredient.categoryName] : [])),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

export function classifyIngredients(
  text: string,
  terms: CatalogTerm[],
  categories: CatalogCategory[],
  allergenTags: string[] = [],
): Ingredient[] {
  const source = decodeIngredientText(text);
  const byName = new Map(categories.map((category) => [category.name, category]));
  const seenCategory = new Set<number>();
  const ingredients: Ingredient[] = [];

  splitIngredientText(source).forEach((label, index) => {
    const raw = label.toLowerCase();
    const matched = categorizedMatches(raw, terms);
    if (matched.length > 0) {
      for (const term of matched) {
        if (term.categoryId == null || seenCategory.has(term.categoryId) || !term.categoryName) continue;
        const category = byName.get(term.categoryName) ?? {
          id: term.categoryId,
          name: term.categoryName,
          categoryType: term.categoryType ?? "allergen",
        };
        seenCategory.add(category.id);
        ingredients.push(
          mappedIngredient(
            presentName(term.technicalName),
            ingredients.length,
            category,
            `${presentName(term.technicalName)} is in the mapping table as ${category.name}.`,
          ),
        );
      }
      return;
    }

    let hardcoded = false;
    for (const category of categories) {
      if (seenCategory.has(category.id)) continue;
      const words = ALIASES[category.name] ?? [category.name];
      const word = words.find((candidate) => aliasHits(raw, candidate));
      if (!word) continue;
      hardcoded = true;
      seenCategory.add(category.id);
      ingredients.push(
        mappedIngredient(
          presentName(word),
          ingredients.length,
          category,
          `The name matches ${category.name} in the mapping table.`,
        ),
      );
    }
    if (hardcoded) return;

    const phrase = normalizePhrase(label);
    if (isPlain(phrase)) {
      ingredients.push({ id: slug(label, index), label });
      return;
    }

    ingredients.push({
      id: slug(label, index),
      label,
      unknown: true,
      plain: "The product is not found, so it is not treated as safe.",
    });
  });

  const seen = new Set(
    ingredients
      .map((ingredient) => ingredient.categoryName)
      .filter((name): name is string => Boolean(name)),
  );

  for (const tag of allergenTags) {
    const categoryName = OFF_TAG_TO_CATEGORY[tag];
    const category = categoryName ? byName.get(categoryName) : undefined;
    if (category) {
      if (seen.has(category.name)) continue;
      seen.add(category.name);
      ingredients.push(
        mappedIngredient(
          `Declared allergen: ${category.name}`,
          ingredients.length,
          category,
          "Open Food Facts lists this allergen on the product, even when the ingredient line uses another language.",
        ),
      );
      continue;
    }

    const label = tag.replace(/^[a-z]{2}:/, "").replace(/-/g, " ").trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    ingredients.push({
      id: slug(`declared ${label}`, ingredients.length),
      label: `Declared allergen: ${presentName(label)}`,
      categoryName: label,
      plain: "Open Food Facts lists this on the product.",
    });
  }

  return ingredients;
}
