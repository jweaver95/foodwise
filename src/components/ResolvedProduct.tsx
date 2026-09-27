"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Screen } from "@/components/ui";
import { recallProduct } from "@/lib/productCache";
import type { Product } from "@/lib/types";

export function ResolvedProduct({
  children,
}: {
  children: (product: Product) => ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id ?? "");
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    setProduct(recallProduct(id) ?? null);
  }, [id]);

  if (product === undefined) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-[15px] text-ink-muted">Opening this product…</p>
        </div>
      </Screen>
    );
  }

  if (!product) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="max-w-[28ch] text-[15px] leading-relaxed text-ink-muted">
            This product is not on this device. Scan it again.
          </p>
        </div>
      </Screen>
    );
  }

  return children(product);
}
