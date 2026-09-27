import { PRODUCTS, getProduct } from "./data";
import type { Product } from "./types";

const KEY = "foodwise-scanned-products-v1";
const memory = new Map<string, Product>();

function readCache(): Record<string, Product> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Product>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function rememberProduct(product: Product) {
  if (typeof window === "undefined") return;
  memory.set(product.id, product);
  const cache = readCache();
  cache[product.id] = product;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    cache[product.id] = { ...product, image: "/photos/welcome.png" };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(cache));
    } catch {
      memory.set(product.id, product);
    }
  }
}

export function recallProduct(id: string): Product | undefined {
  return getProduct(id) ?? memory.get(id) ?? readCache()[id];
}

export function sampleProducts(): Product[] {
  return PRODUCTS;
}
