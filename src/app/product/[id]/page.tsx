"use client";

import { ResolvedProduct } from "@/components/ResolvedProduct";
import { ProductView } from "./ProductView";

export default function ProductPage() {
  return <ResolvedProduct>{(product) => <ProductView product={product} />}</ResolvedProduct>;
}
