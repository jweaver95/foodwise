import { barcodeCandidates, normalizeBarcode } from "@/lib/barcode";
import { classifyIngredients } from "@/lib/classify";
import { catalogClient, loadIngredientCatalog } from "@/lib/catalog";
import type { Disclosure, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const FRESH_MS = 30 * 24 * 60 * 60 * 1000;

type StoredProduct = {
  barcode: string;
  name: string | null;
  brand: string | null;
  raw_ingredient_text: string | null;
  source: string | null;
  last_synced_at: string | null;
  off_allergen_tags: string[] | null;
};

function isFresh(syncedAt: string | null): boolean {
  if (!syncedAt) return false;
  const synced = Date.parse(syncedAt);
  return Number.isFinite(synced) && Date.now() - synced < FRESH_MS;
}

function catalogProduct(
  barcode: string,
  fields: {
    name: string;
    brand: string;
    source: string;
    image: string;
    ingredients: Product["ingredients"];
    lookupStatus?: Product["lookupStatus"];
    disclosures?: Disclosure[];
  },
): Product {
  const unidentified =
    fields.lookupStatus === "UNKNOWN_PRODUCT" || fields.lookupStatus === "LOOKUP_FAILED";
  return {
    id: `barcode-${barcode}`,
    name: fields.name || (unidentified ? "" : "Unnamed product"),
    brand: fields.brand || (unidentified ? "" : "Unknown brand"),
    barcode,
    capture: "barcode",
    source: fields.source,
    image: fields.image,
    ingredients: fields.ingredients,
    lookupStatus: fields.lookupStatus,
    disclosures: fields.disclosures,
  };
}

export async function GET(request: Request) {
  const read = normalizeBarcode(new URL(request.url).searchParams.get("barcode") ?? "");
  if (!read.ok) {
    return Response.json({ error: read.error }, { status: 400 });
  }
  const barcode = read.barcode;

  const supabase = catalogClient();
  if (!supabase) {
    return Response.json(
      { error: "Supabase is not configured for this app." },
      { status: 500 },
    );
  }

  const [mapping, storedResult, prop65Result] = await Promise.all([
    loadIngredientCatalog(supabase),
    supabase
      .from("products")
      .select("barcode,name,brand,raw_ingredient_text,source,last_synced_at,off_allergen_tags")
      .in("barcode", barcodeCandidates(barcode))
      .limit(1)
      .maybeSingle(),
    supabase
      .from("prop65_ingredient_terms")
      .select("technical_name, prop65_chemicals(chemical_name)")
      .limit(500),
  ]);

  if (!mapping.ok) {
    return Response.json({ error: mapping.error }, { status: mapping.status });
  }

  const { categories, terms } = mapping.catalog;
  const stored = (storedResult.data ?? null) as StoredProduct | null;
  const fresh = isFresh(stored?.last_synced_at ?? null);
  const disclosures = prop65Result.error
    ? []
    : disclosuresFrom(prop65Result.data, stored?.raw_ingredient_text ?? "");

  if (fresh && stored?.source === "not_found") {
    return Response.json({
      product: catalogProduct(barcode, {
        name: "",
        brand: "",
        source: "",
        image: "",
        ingredients: [],
        lookupStatus: "UNKNOWN_PRODUCT",
      }),
    });
  }

  let name = stored?.name?.trim() || "";
  let brand = stored?.brand?.trim() || "";
  let ingredientText = fresh ? stored?.raw_ingredient_text?.trim() || "" : "";
  let image = "/photos/welcome.png";
  let allergenTags = fresh ? (stored?.off_allergen_tags ?? []) : [];
  let source = fresh ? "FoodWise catalog" : "Open Food Facts";
  let offReached = fresh;
  let offFound = fresh && stored?.source !== "not_found" && Boolean(name || ingredientText);

  if (!fresh) {
    try {
      const offResponse = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,brands,ingredients_text,ingredients_text_en,allergens_tags,traces_tags,image_front_small_url,image_front_url`,
        {
          headers: { "User-Agent": "FoodWise/1.0 (household allergen decision aid)" },
          cache: "no-store",
        },
      );
      offReached = offResponse.ok;
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
        offFound = Boolean(product);
        if (product) {
          name = product.product_name?.trim() || name;
          brand = product.brands?.split(",")[0]?.trim() || brand;
          ingredientText =
            product.ingredients_text_en?.trim() || product.ingredients_text?.trim() || "";
          image = product.image_front_small_url || product.image_front_url || image;
          const traces = new Set(product.traces_tags ?? []);
          allergenTags = (product.allergens_tags ?? []).filter((tag) => !traces.has(tag));
          source = "Open Food Facts";
        }
      }
    } catch {
      offReached = false;
    }

    if (!ingredientText) {
      ingredientText = stored?.raw_ingredient_text?.trim() || "";
      if (ingredientText) source = "FoodWise catalog, saved copy";
    }
  }

  if (!offReached && !ingredientText && !name) {
    return Response.json({
      product: catalogProduct(barcode, {
        name: "",
        brand: "",
        source: "",
        image: "",
        ingredients: [],
        lookupStatus: "LOOKUP_FAILED",
      }),
    });
  }

  if (!offFound && !stored && !ingredientText) {
    return Response.json({
      product: catalogProduct(barcode, {
        name: "",
        brand: "",
        source: "",
        image: "",
        ingredients: [],
        lookupStatus: "UNKNOWN_PRODUCT",
      }),
    });
  }

  if (!ingredientText) {
    return Response.json({
      product: catalogProduct(barcode, {
        name,
        brand,
        source,
        image,
        ingredients: [],
        lookupStatus: "INSUFFICIENT_DATA",
        disclosures: disclosuresFrom(prop65Result.error ? null : prop65Result.data, ""),
      }),
    });
  }

  const matchedDisclosures = prop65Result.error
    ? []
    : disclosuresFrom(prop65Result.data, ingredientText);

  return Response.json({
    product: catalogProduct(barcode, {
      name,
      brand,
      source,
      image,
      ingredients: classifyIngredients(ingredientText, terms, categories, allergenTags),
      disclosures: matchedDisclosures.length > 0 ? matchedDisclosures : disclosures,
    }),
  });
}

function disclosuresFrom(rows: unknown, ingredientText: string): Disclosure[] {
  if (!Array.isArray(rows) || !ingredientText) return [];
  const haystack = ingredientText.toLowerCase();
  const found: Disclosure[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const term = "technical_name" in row ? String(row.technical_name ?? "") : "";
    if (!term || !haystack.includes(term.toLowerCase())) continue;
    const chemical = "prop65_chemicals" in row ? row.prop65_chemicals : null;
    const record = Array.isArray(chemical) ? chemical[0] : chemical;
    const name =
      record && typeof record === "object" && "chemical_name" in record
        ? String(record.chemical_name)
        : term;
    found.push({
      name,
      plain: "Cited under California's Prop 65 disclosure list. This is a labeling requirement, not an allergy match, and it does not change the verdict.",
    });
  }
  return found;
}
