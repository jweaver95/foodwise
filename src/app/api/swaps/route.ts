import { catalogClient } from "@/lib/catalog";
import type { IngredientSwap } from "@/lib/swaps";

export const dynamic = "force-dynamic";

type SwapRow = {
  id: number;
  replaces_label: string;
  swap_label: string;
  use_context: string | null;
  note: string | null;
  source: string | null;
  from_ingredient_id: number | null;
  swap_ingredient_id: number | null;
  sort_order: number | null;
  status: string;
};

type LinkRow = { ingredient_id: number; allergen_category_id: number };

export async function GET() {
  const supabase = catalogClient();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured for this app." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("ingredient_swaps")
    .select(
      "id,status,replaces_label,swap_label,use_context,note,source,from_ingredient_id,swap_ingredient_id,sort_order",
    )
    .eq("status", "approved")
    .order("sort_order");

  if (error) {
    return Response.json({ error: "The swap list could not be read." }, { status: 502 });
  }

  const rows = (data ?? []) as SwapRow[];
  const ingredientIds = [
    ...new Set(rows.flatMap((row) => (row.swap_ingredient_id ? [row.swap_ingredient_id] : []))),
  ];
  const categories = new Map<number, number[]>();
  if (ingredientIds.length > 0) {
    const { data: links } = await supabase
      .from("ingredient_categories")
      .select("ingredient_id,allergen_category_id")
      .in("ingredient_id", ingredientIds);
    for (const link of (links ?? []) as LinkRow[]) {
      const list = categories.get(link.ingredient_id) ?? [];
      list.push(link.allergen_category_id);
      categories.set(link.ingredient_id, list);
    }
  }

  const swaps: IngredientSwap[] = rows.map((row) => ({
    id: row.id,
    replacesLabel: row.replaces_label,
    swapLabel: row.swap_label,
    useContext: row.use_context ?? "",
    note: row.note ?? "",
    source: row.source ?? "",
    fromIngredientId: row.from_ingredient_id,
    swapIngredientId: row.swap_ingredient_id,
    swapCategoryIds: row.swap_ingredient_id ? (categories.get(row.swap_ingredient_id) ?? []) : [],
    sortOrder: row.sort_order ?? row.id,
  }));

  return Response.json({ swaps });
}
