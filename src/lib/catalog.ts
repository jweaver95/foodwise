import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CatalogCategory, CatalogTerm } from "@/lib/classify";

type CategoryRow = {
  id: number;
  name: string;
  category_type: "allergen" | "additive";
};

type TermRow = {
  technical_name: string;
  whole_word: boolean | null;
  qualifier_exceptions: string[] | null;
  allergen_categories: CategoryRow | CategoryRow[] | null;
};

type LinkRow = {
  ingredient_id: number;
  allergen_category_id: number;
};

type AliasRow = {
  alias: string | null;
  ingredient_id: number;
  whole_word: boolean | null;
  qualifier_exceptions: string[] | null;
};

export type IngredientCatalog = {
  categories: CatalogCategory[];
  terms: CatalogTerm[];
};

const CACHE_MS = 10 * 60 * 1000;
let catalogCache: { at: number; catalog: IngredientCatalog } | null = null;

export function catalogClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function fetchAll<T>(
  load: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<{ ok: true; rows: T[] } | { ok: false; error: string }> {
  const page = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += page) {
    const { data, error } = await load(from, from + page - 1);
    if (error) return { ok: false, error: error.message };
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < page) return { ok: true, rows };
  }
}

export async function loadIngredientCatalog(
  supabase: SupabaseClient,
): Promise<{ ok: true; catalog: IngredientCatalog } | { ok: false; error: string; status: number }> {
  if (catalogCache && Date.now() - catalogCache.at < CACHE_MS) {
    return { ok: true, catalog: catalogCache.catalog };
  }

  const [
    { data: categoryRows, error: categoryError },
    { data: termRows, error: termError },
    links,
    aliases,
  ] = await Promise.all([
    supabase.from("allergen_categories").select("id,name,category_type").order("id"),
    supabase
      .from("ingredient_terms")
      .select(
        "technical_name, whole_word, qualifier_exceptions, allergen_categories(id,name,category_type)",
      ),
    fetchAll<LinkRow>((from, to) =>
      supabase
        .from("ingredient_categories")
        .select("ingredient_id,allergen_category_id")
        .order("ingredient_id")
        .range(from, to),
    ),
    fetchAll<AliasRow>((from, to) =>
      supabase
        .from("ingredient_aliases")
        .select("alias,ingredient_id,whole_word,qualifier_exceptions")
        .order("id")
        .range(from, to),
    ),
  ]);

  if (categoryError || termError || !links.ok || !aliases.ok) {
    return {
      ok: false,
      error: "The ingredient mapping table could not be read.",
      status: 502,
    };
  }

  const categories: CatalogCategory[] = ((categoryRows ?? []) as CategoryRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    categoryType: row.category_type,
  }));
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const categoriesByIngredient = new Map<number, CatalogCategory[]>();
  for (const link of links.rows) {
    const category = categoryById.get(link.allergen_category_id);
    if (!category) continue;
    const list = categoriesByIngredient.get(link.ingredient_id) ?? [];
    list.push(category);
    categoriesByIngredient.set(link.ingredient_id, list);
  }

  const terms: CatalogTerm[] = ((termRows ?? []) as TermRow[]).flatMap((row) => {
    const category = Array.isArray(row.allergen_categories)
      ? row.allergen_categories[0]
      : row.allergen_categories;
    if (!category) return [];
    return [
      {
        technicalName: row.technical_name,
        categoryId: category.id,
        categoryName: category.name,
        categoryType: category.category_type,
        wholeWord: row.whole_word ?? false,
        exceptions: row.qualifier_exceptions ?? [],
      },
    ];
  });

  for (const row of aliases.rows) {
    const technicalName = row.alias?.trim() ?? "";
    if (technicalName.length < 3) continue;
    const linked = categoriesByIngredient.get(row.ingredient_id) ?? [];
    const shared = {
      technicalName,
      wholeWord: row.whole_word ?? false,
      exceptions: row.qualifier_exceptions ?? [],
    };
    if (linked.length === 0) {
      terms.push(shared);
      continue;
    }
    for (const category of linked) {
      terms.push({
        ...shared,
        categoryId: category.id,
        categoryName: category.name,
        categoryType: category.categoryType,
      });
    }
  }

  const catalog = { categories, terms };
  catalogCache = { at: Date.now(), catalog };
  return { ok: true, catalog };
}
