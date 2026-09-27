"use client";

import { ResolvedProduct } from "@/components/ResolvedProduct";
import { VerdictView } from "./VerdictView";

export default function VerdictPage() {
  return <ResolvedProduct>{(product) => <VerdictView product={product} />}</ResolvedProduct>;
}
