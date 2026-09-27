import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CatalogCategory, CatalogTerm } from "@/lib/classify";

type CategoryRow = {
  id: number;
  name: string;
  category_type: "allergen" | "additive";
};

type TermRow = {
  technical_name: string;
  allergen_categories: CategoryRow | CategoryRow[] | null;
};

export type IngredientCatalog = {
  categories: CatalogCategory[];
  terms: CatalogTerm[];
};

export function catalogClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function loadIngredientCatalog(
  supabase: SupabaseClient,
): Promise<{ ok: true; catalog: IngredientCatalog } | { ok: false; error: string; status: number }> {
  const [{ data: categoryRows, error: categoryError }, { data: termRows, error: termError }] =
    await Promise.all([
      supabase.from("allergen_categories").select("id,name,category_type").order("id"),
      supabase
        .from("ingredient_terms")
        .select("technical_name, allergen_categories(id,name,category_type)"),
    ]);

  if (categoryError || termError) {
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
      },
    ];
  });

  return { ok: true, catalog: { categories, terms } };
}
