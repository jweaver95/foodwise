import type { HouseholdMember, Product } from "./types";

export const DEMO_SHOPPER = "Priya";

export const DEMO_MEMBERS: HouseholdMember[] = [
  {
    id: "leo",
    name: "Leo",
    relation: "Son, 6",
    allergens: ["peanut", "tree_nut"],
    protocols: [],
  },
  {
    id: "maya",
    name: "Maya",
    relation: "Daughter, 11",
    allergens: ["milk"],
    protocols: ["gluten_free"],
  },
];

/* Stand-ins for Open Food Facts records. Ingredient panels are realistic so the
   mapping layer has hidden derivatives to catch, not just obvious names. */
export const PRODUCTS: Product[] = [
  {
    id: "maple-hill-granola",
    name: "Maple Hill Granola",
    brand: "Maple Hill",
    barcode: "8 50026 01234 5",
    capture: "barcode",
    source: "Open Food Facts",
    ingredients: [
      { id: "oats", label: "Rolled oats" },
      { id: "maple", label: "Maple syrup" },
      {
        id: "peanuts",
        label: "Peanut butter",
        mappedTo: "peanut",
        plain: "Peanut, listed under its own name.",
      },
      {
        id: "whey",
        label: "Whey protein concentrate",
        mappedTo: "milk",
        plain: "Whey is the milk protein left over after cheesemaking.",
      },
      { id: "sunflower-oil", label: "Sunflower oil" },
      { id: "salt", label: "Sea salt" },
    ],
  },
  {
    id: "oat-thins",
    name: "Sea Salt Oat Thins",
    brand: "Northline",
    barcode: "7 25272 73051 9",
    capture: "barcode",
    source: "Open Food Facts",
    ingredients: [
      { id: "oats-whole", label: "Whole grain oats" },
      { id: "oleic", label: "High-oleic sunflower oil" },
      { id: "salt", label: "Sea salt" },
      {
        id: "tocopherols",
        label: "Mixed tocopherols",
        mappedTo: "soy",
        plain: "Vitamin E used to keep oil fresh. This one is soy-derived.",
      },
    ],
  },
  {
    id: "tomato-bisque",
    name: "Garden Tomato Bisque",
    brand: "Hearth Jar",
    barcode: "0 41196 91022 7",
    capture: "barcode",
    source: "Open Food Facts",
    ingredients: [
      { id: "tomato", label: "Vine tomatoes" },
      { id: "stock", label: "Vegetable stock" },
      {
        id: "casein",
        label: "Sodium caseinate",
        mappedTo: "milk",
        plain: "Casein is a milk protein. The panel never says the word milk.",
      },
      { id: "onion", label: "Onion" },
      { id: "basil", label: "Basil" },
    ],
  },
  {
    id: "miso-dressing",
    name: "Miso Ginger Dressing",
    brand: "Kanto Pantry",
    barcode: "4 90218 44073 1",
    capture: "barcode",
    source: "Open Food Facts",
    ingredients: [
      { id: "rice-vinegar", label: "Rice vinegar" },
      {
        id: "soy-sauce",
        label: "Soy sauce (water, wheat, soybeans, salt)",
        mappedTo: "wheat",
        plain: "Brewed soy sauce is made with wheat, so it carries gluten.",
      },
      {
        id: "miso",
        label: "White miso",
        mappedTo: "soy",
        plain: "Miso is a fermented soybean paste.",
      },
      {
        id: "tahini",
        label: "Tahini",
        mappedTo: "sesame",
        plain: "Tahini is ground sesame seed.",
      },
      { id: "ginger", label: "Ginger puree" },
    ],
  },
  {
    id: "chili-crisp",
    name: "Kanto Chili Crisp",
    brand: "Kanto Pantry",
    barcode: "No barcode match",
    capture: "ocr",
    source: "Photo of ingredient panel",
    ingredients: [
      { id: "chili", label: "Chili pepper" },
      { id: "rapeseed", label: "Rapeseed oil" },
      { id: "garlic", label: "Fried garlic" },
      {
        id: "ribonucleotide",
        label: "Disodium ribonucleotide blend",
        unknown: true,
        plain:
          "This processing blend is not in the FoodWise mapping table yet, so the engine will not guess.",
      },
    ],
  },
];

/* Ordered for the demo: fail, pass, hidden derivative, protocol hit, unknown. */
export const SAMPLE_SCAN_ORDER = [
  "maple-hill-granola",
  "oat-thins",
  "tomato-bisque",
  "miso-dressing",
  "chili-crisp",
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}
