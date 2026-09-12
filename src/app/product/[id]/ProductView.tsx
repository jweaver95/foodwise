"use client";

import { useMemo } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  Badge,
  ButtonLink,
  Disclaimer,
  Screen,
  ScreenBody,
  SectionLabel,
} from "@/components/ui";
import { useHousehold } from "@/context/HouseholdContext";
import { allergenLabel } from "@/lib/allergens";
import { computeVerdict } from "@/lib/engine";
import type { Product } from "@/lib/types";

export function ProductView({ product }: { product: Product }) {
  const { selectedMember } = useHousehold();

  const verdict = useMemo(
    () => (selectedMember ? computeVerdict(product, selectedMember) : null),
    [product, selectedMember],
  );

  const hitIds = new Set(verdict?.hits.map((hit) => hit.ingredient.id) ?? []);

  return (
    <Screen>
      <ScreenHeader back />

      <ScreenBody>
        <div className="pt-1">
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-[13px] text-ink-muted">
            {product.brand} · {product.barcode}
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            Captured by {product.capture === "ocr" ? "panel photo" : "barcode lookup"} ·{" "}
            {product.source}
          </p>
        </div>

        <section className="mt-7">
          <SectionLabel>
            Every ingredient, {product.ingredients.length} total
          </SectionLabel>
          <ul className="divide-y divide-line border-y border-line">
            {product.ingredients.map((ingredient) => {
              const triggered = hitIds.has(ingredient.id);
              return (
                <li key={ingredient.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`text-[16px] leading-snug ${
                        triggered ? "font-semibold text-fail-ink" : "font-medium"
                      }`}
                    >
                      {ingredient.label}
                    </p>
                    {ingredient.unknown ? (
                      <Badge tone="unknown">Unknown</Badge>
                    ) : ingredient.mappedTo ? (
                      <Badge tone={triggered ? "fail" : "neutral"}>
                        {allergenLabel(ingredient.mappedTo)}
                      </Badge>
                    ) : null}
                  </div>
                  {ingredient.plain ? (
                    <p className="mt-1.5 max-w-[46ch] text-[13px] leading-relaxed text-ink-muted">
                      {ingredient.plain}
                      {triggered && selectedMember
                        ? ` On ${selectedMember.name}'s profile.`
                        : ingredient.mappedTo && selectedMember
                          ? ` Not on ${selectedMember.name}'s profile.`
                          : ""}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-7">
          <SectionLabel>How to read this list</SectionLabel>
          <p className="max-w-[46ch] text-[14px] leading-relaxed text-ink-muted">
            A tag means the mapping table connected a technical name to a tracked
            allergen. A red tag means it matched the profile you are shopping
            for. No tag means the ingredient is recognised and untracked.
          </p>
        </section>

        <div className="mt-8 space-y-3">
          <ButtonLink href={`/explain/${product.id}`}>
            Ask about an ingredient
          </ButtonLink>
          <ButtonLink tone="outline" href="/scan">
            Scan another product
          </ButtonLink>
        </div>

        <Disclaimer className="mt-6" />
      </ScreenBody>
    </Screen>
  );
}
