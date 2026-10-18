import { allergenMatchNames, classifyIngredients } from "@/lib/classify";
import { catalogClient, loadIngredientCatalog } from "@/lib/catalog";
import { cleanPanelText } from "@/lib/panelText";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

function panelProductId(text: string): string {
  let hash = 2166136261;
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  for (const char of normalized) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `panel-${(hash >>> 0).toString(16)}`;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "The panel text could not be read." }, { status: 400 });
  }

  const raw =
    payload && typeof payload === "object" && "text" in payload
      ? (payload as { text?: unknown }).text
      : "";
  const text = cleanPanelText(typeof raw === "string" ? raw.slice(0, 4000) : "");
  if (text.replace(/[^a-z]/gi, "").length < 8) {
    return Response.json(
      { error: "That photo did not contain a readable ingredient list." },
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

  const mapping = await loadIngredientCatalog(supabase);
  if (!mapping.ok) {
    return Response.json({ error: mapping.error }, { status: mapping.status });
  }

  const ingredients = classifyIngredients(text, mapping.catalog.terms, mapping.catalog.categories);
  const product: Product = {
    id: panelProductId(text),
    name: "Ingredient panel",
    brand: "Read from the package",
    barcode: "Panel photo",
    capture: "ocr",
    source: "Photo of ingredient panel",
    image: "/photos/welcome.png",
    ingredients,
    allergenMatches: allergenMatchNames(ingredients),
  };

  return Response.json({ product });
}
