"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ReportErrorSheet } from "@/components/ReportErrorSheet";
import {
  Badge,
  ButtonLink,
  Disclaimer,
  Screen,
  ScreenBody,
  SectionLabel,
  StatusPill,
  statusSurface,
} from "@/components/ui";
import {
  recordScan,
  selectMember,
  useHousehold,
} from "@/context/HouseholdContext";
import { allergenLabel, protocolLabel } from "@/lib/allergens";
import { computeVerdict, ruleLine, verdictHeadline } from "@/lib/engine";
import type { Product } from "@/lib/types";

export function VerdictView({ product }: { product: Product }) {
  const router = useRouter();
  const { hydrated, selectedMember, members } = useHousehold();
  const [reporting, setReporting] = useState(false);

  const verdict = useMemo(
    () => (selectedMember ? computeVerdict(product, selectedMember) : null),
    [product, selectedMember],
  );

  useEffect(() => {
    if (!selectedMember || !verdict) return;
    recordScan({
      productId: product.id,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      status: verdict.status,
      at: Date.now(),
    });
  }, [product.id, selectedMember, verdict]);

  useEffect(() => {
    if (hydrated && !selectedMember) router.replace("/");
  }, [hydrated, selectedMember, router]);

  if (!selectedMember || !verdict) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-[15px] text-ink-muted">Checking the panel…</p>
        </div>
      </Screen>
    );
  }

  const { kicker, title, detail } = verdictHeadline(verdict, selectedMember);
  const others = members.filter((member) => member.id !== selectedMember.id);

  return (
    <Screen>
      <ScreenHeader
        back
        action={
          <button
            type="button"
            onClick={() => setReporting(true)}
            className="text-[14px] font-medium text-ink-muted underline decoration-line underline-offset-4"
          >
            Report an error
          </button>
        }
      />

      <ScreenBody>
        <section
          className={`rounded-surface px-5 py-7 ${statusSurface[verdict.status]}`}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">
            {kicker}
          </p>
          <h1 className="mt-3 text-[36px] font-bold leading-[1.05] tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/85">
            {detail}
          </p>
        </section>

        <div className="mt-6">
          <h2 className="text-[22px] font-bold tracking-[-0.02em]">
            {product.name}
          </h2>
          <p className="mt-1 font-mono text-[13px] text-ink-muted">
            {product.brand} · {product.barcode}
          </p>
        </div>

        {verdict.hits.length > 0 ? (
          <section className="mt-7">
            <SectionLabel>What triggered this</SectionLabel>
            <div className="space-y-2">
              {verdict.hits.map((hit) => (
                <div
                  key={hit.ingredient.id}
                  className="rounded-surface border border-line bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[17px] font-semibold leading-snug">
                      {hit.ingredient.label}
                    </p>
                    <Badge tone="fail">{allergenLabel(hit.allergenId)}</Badge>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                    {hit.ingredient.plain ?? ruleLine(hit)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {verdict.unknowns.length > 0 ? (
          <section className="mt-7">
            <SectionLabel>Not in the mapping table</SectionLabel>
            <div className="space-y-2">
              {verdict.unknowns.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="rounded-surface border border-line bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[17px] font-semibold leading-snug">
                      {ingredient.label}
                    </p>
                    <Badge tone="unknown">Unknown</Badge>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                    {ingredient.plain}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-7">
          <SectionLabel>Checked against {selectedMember.name}&rsquo;s profile</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {selectedMember.allergens.length === 0 &&
            selectedMember.protocols.length === 0 ? (
              <p className="text-[14px] text-ink-muted">
                No restrictions set, so nothing could be flagged.
              </p>
            ) : (
              <>
                {selectedMember.allergens.map((allergen) => (
                  <Badge key={allergen} tone="pass">
                    {allergenLabel(allergen)}
                  </Badge>
                ))}
                {selectedMember.protocols.map((protocol) => (
                  <Badge key={protocol} tone="pass">
                    {protocolLabel(protocol)}
                  </Badge>
                ))}
              </>
            )}
          </div>
        </section>

        {others.length > 0 ? (
          <section className="mt-7">
            <SectionLabel>Same product, rest of the household</SectionLabel>
            <ul className="divide-y divide-line border-y border-line">
              {others.map((member) => {
                const theirs = computeVerdict(product, member);
                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      onClick={() => selectMember(member.id)}
                      className="flex w-full items-center gap-4 py-4 text-left"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-semibold">
                          {member.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
                          Tap to see this product read for {member.name}
                        </span>
                      </span>
                      <StatusPill status={theirs.status} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <div className="mt-8 space-y-3">
          <ButtonLink href={`/explain/${product.id}`}>
            Why this verdict
          </ButtonLink>
          <ButtonLink tone="outline" href={`/product/${product.id}`}>
            See all ingredients
          </ButtonLink>
          <Link
            href="/scan"
            className="block py-2 text-center text-[14px] font-medium text-ink-muted underline decoration-line underline-offset-4"
          >
            Scan another product
          </Link>
        </div>

        <Disclaimer className="mt-6" />
      </ScreenBody>

      {reporting ? (
        <ReportErrorSheet
          productName={product.name}
          onClose={() => setReporting(false)}
        />
      ) : null}
    </Screen>
  );
}
