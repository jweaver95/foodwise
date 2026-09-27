"use client";

import { ResolvedProduct } from "@/components/ResolvedProduct";
import { ExplainView } from "./ExplainView";

export default function ExplainPage() {
  return <ResolvedProduct>{(product) => <ExplainView product={product} />}</ResolvedProduct>;
}