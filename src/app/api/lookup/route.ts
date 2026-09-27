import { classifyIngredients } from "@/lib/classify";
import { catalogClient, loadIngredientCatalog } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

type StoredProduct = {
  barcode: string;
  name: string | null;
  brand: string | null;
  raw_ingredient_text: string | null;
  source: string | null;
};

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

export async function GET(request: Request) {
  const barcode = digits(new URL(request.url).searchParams.get("barcode") ?? "");
  if (barcode.length < 8 || barcode.length > 14) {
    return Response.json(
      { error: "That does not look like a product barcode." },
      { status: 400 },
    );
  }

  const supabase = catalogClient();
  if (!supabase) {
    return Response.json(
      { error: "Supabase is not configured for this app." },
      { status: 500 },
    );
  }

  const [mapping, { data: stored }] = await Promise.all([
    loadIngredientCatalog(supabase),
    supabase
      .from("products")
      .select("barcode,name,brand,raw_ingredient_text,source")
      .eq("barcode", barcode)
      .maybeSingle(),
  ]);

  if (!mapping.ok) {
    return Response.json({ error: mapping.error }, { status: mapping.status });
  }

  const { categories, terms } = mapping.catalog;

  const storedProduct = stored as StoredProduct | null;
  if (storedProduct?.source === "not_found") {
    return Response.json(
      { error: "This barcode is not in the product catalog." },
      { status: 404 },
    );
  }

  let name = storedProduct?.name?.trim() || "";
  let brand = storedProduct?.brand?.trim() || "";
  let ingredientText = "";
  let image = "/photos/welcome.png";
  let allergenTags: string[] = [];
  let source = "Open Food Facts";

  const offResponse = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,ingredients_text,ingredients_text_en,allergens_tags,traces_tags,image_front_small_url,image_front_url`,
    {
      headers: { "User-Agent": "FoodWise/1.0 (household allergen decision aid)" },
      cache: "no-store",
    },
  );

  if (offResponse.ok) {
    const payload = (await offResponse.json()) as {
      status?: number;
      product?: {
        product_name?: string;
        brands?: string;
        ingredients_text?: string;
        ingredients_text_en?: string;
        allergens_tags?: string[];
        traces_tags?: string[];
        image_front_small_url?: string;
        image_front_url?: string;
      };
    };
    const product = payload.status === 1 ? payload.product : undefined;
    if (product) {
      name = product.product_name?.trim() || name;
      brand = product.brands?.split(",")[0]?.trim() || brand;
      ingredientText =
        product.ingredients_text_en?.trim() || product.ingredients_text?.trim() || "";
      image = product.image_front_small_url || product.image_front_url || image;
      const traces = new Set(product.traces_tags ?? []);
      allergenTags = (product.allergens_tags ?? []).filter((tag) => !traces.has(tag));
    }
  }

  if (!ingredientText) {
    ingredientText = storedProduct?.raw_ingredient_text?.trim() || "";
    source = "FoodWise catalog";
  }

  if (!ingredientText && !name && !storedProduct) {
    return Response.json(
      { error: "No product was found for that barcode." },
      { status: 404 },
    );
  }

  if (!ingredientText) {
    return Response.json(
      {
        error:
          "This product has no ingredient panel on file, so FoodWise will not guess.",
      },
      { status: 422 },
    );
  }

  const result: Product = {
    id: `barcode-${barcode}`,
    name: name || "Unnamed product",
    brand: brand || "Unknown brand",
    barcode,
    capture: "barcode",
    source,
    image,
    ingredients: classifyIngredients(ingredientText, terms, categories, allergenTags),
  };

  return Response.json({ product: result });
}
