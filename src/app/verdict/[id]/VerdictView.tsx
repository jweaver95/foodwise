"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ReportErrorSheet } from "@/components/ReportErrorSheet";
import { Avatar } from "@/components/Avatar";
import { ProductPhoto } from "@/components/ProductPhoto";
import { OutcomeMark } from "@/components/OutcomeMark";
import { ScanMark } from "@/components/ScanMark";
import {
  Badge,
  Button,
  ButtonLink,
  Disclaimer,
  Screen,
  ScreenBody,
  VerdictDisclaimer,
  statusSurface,
} from "@/components/ui";
import {
  recordScan,
  selectMember,
  useHousehold,
} from "@/context/HouseholdContext";
import { getProduct } from "@/lib/data";
import { computeVerdict, memberRestrictionLabels, restrictionLabel, ruleLine, verdictHeadline } from "@/lib/engine";
import { dishesAvoiding } from "@/lib/kitchen";
import {
  noSwapLine,
  productContainsLine,
  swapsForMember,
  swapTryLine,
  type IngredientSwap,
} from "@/lib/swaps";
import { isUnverifiedLookup, type Product } from "@/lib/types";

export function VerdictView({ product }: { product: Product }) {
  const router = useRouter();
  const { hydrated, ready, selectedMember, members, source } = useHousehold();
  const [reporting, setReporting] = useState(false);
  const [swaps, setSwaps] = useState<IngredientSwap[]>([]);
  const [swapsReady, setSwapsReady] = useState(false);
  const [mealsOpen, setMealsOpen] = useState(false);

  const verdict = useMemo(
    () => (selectedMember ? computeVerdict(product, selectedMember) : null),
    [product, selectedMember],
  );

  useEffect(() => {
    if (!ready || !selectedMember || !verdict) return;
    recordScan({
      productId: product.id,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      status: verdict.status,
      at: Date.now(),
    });
  }, [ready, product.id, selectedMember, verdict]);

  useEffect(() => {
    if (!ready || !verdict || verdict.hits.length === 0) {
      setSwapsReady(true);
      return;
    }
    let cancelled = false;
    setSwapsReady(false);
    void fetch("/api/swaps")
      .then((response) => response.json() as Promise<{ swaps?: IngredientSwap[] }>)
      .then((body) => {
        if (cancelled) return;
        setSwaps(body.swaps ?? []);
        setSwapsReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setSwaps([]);
        setSwapsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, verdict]);

  useEffect(() => {
    if (hydrated && !selectedMember) router.replace("/");
  }, [hydrated, selectedMember, router]);

  if (!ready || !selectedMember || !verdict) {
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
  const unverified = isUnverifiedLookup(product.lookupStatus);
  const ideas = swapsForMember(swaps, product, selectedMember);
  const allergens = [
    ...new Set(verdict.hits.map((hit) => restrictionLabel(hit).toLowerCase())),
  ];
  const mealIdeas = dishesAvoiding(allergens);

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
        <div className="bezel">
          <div className={`bezel-inner ${statusSurface[verdict.status]}`}>
            {product.image ? (
              <div className="relative h-[168px]">
                <ProductPhoto
                  src={product.image}
                  alt=""
                  className="h-full w-full"
                  sizes="400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <ScanMark className="absolute left-3.5 top-3.5" />
              </div>
            ) : null}
            <div className="flex items-end gap-3 px-5 pb-5 pt-5">
              <div className="min-w-0 flex-1">
                {product.image ? null : <ScanMark className="mb-3" />}
                <p className="text-[12px] font-semibold tracking-[0.12em] text-white/80 uppercase">
                  {kicker}
                </p>
                <h1 className="mt-2 text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-wrap-balance">
                  {title}
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-white/88">
                  {detail}
                </p>
              </div>
              <OutcomeMark status={verdict.status} />
            </div>
          </div>
        </div>

        {source !== "account" && getProduct(product.id) ? (
          <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
            This sample stays on this device.{" "}
            <Link href="/account" className="font-semibold text-forest underline underline-offset-4">
              Save your household
            </Link>{" "}
            to keep real scans.
          </p>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <Avatar member={selectedMember} />
          <div>
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">
              {unverified ? "No product on record" : product.name}
            </h2>
            <p className="font-mono text-[12px] text-ink-muted">
              {unverified ? product.barcode : `${product.brand} · ${product.barcode}`}
            </p>
          </div>
        </div>

        {product.allergenMatches && product.allergenMatches.length > 0 ? (
          <section className="mt-6">
            <p className="mb-3 text-[18px] font-semibold tracking-[-0.01em]">
              Found in this product
            </p>
            <div className="flex flex-wrap gap-2">
              {product.allergenMatches.map((name) => (
                <Badge key={name}>
                  {name.replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        {product.disclosures && product.disclosures.length > 0 ? (
          <section className="mt-7 rounded-[22px] bg-surface p-4 ring-1 ring-ink/6">
            <p className="text-[12px] font-semibold tracking-[0.12em] text-ink-muted uppercase">
              Also on this label
            </p>
            <ul className="mt-3 space-y-3">
              {product.disclosures.map((notice) => (
                <li key={notice.name}>
                  <p className="text-[16px] font-semibold">{notice.name}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{notice.plain}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {verdict.hits.length > 0 ? (
          <section className="mt-7 rounded-[28px] bg-fail px-4 py-5 text-white shadow-[0_16px_32px_rgb(180_35_24/0.22)]">
            <p className="text-[18px] font-semibold tracking-[-0.01em]">
              What triggered this
            </p>
            <div className="mt-4 space-y-2">
              {verdict.hits.map((hit) => (
                <div key={hit.ingredient.id} className="rounded-[20px] bg-paper px-4 py-3.5 text-ink">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[17px] font-semibold leading-snug">
                      {hit.ingredient.label}
                    </p>
                    <Badge tone="fail">{restrictionLabel(hit)}</Badge>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                    {hit.ingredient.plain ?? ruleLine(hit)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {ideas.length > 0 ? (
          <section className="mt-7 rounded-[28px] bg-forest px-4 py-5 text-white shadow-[0_16px_32px_rgb(22_63_48/0.22)]">
            <p className="text-[18px] font-semibold tracking-[-0.01em]">Try instead</p>
            <p className="mt-1 text-[14px] leading-relaxed text-white/75">
              {productContainsLine(allergens)}
            </p>
            <div className="mt-4 space-y-2">
              {ideas.map((idea) => (
                <div key={idea.id} className="rounded-[20px] bg-paper px-4 py-3.5 text-ink">
                  <p className="text-[17px] font-semibold leading-snug">{idea.swapLabel}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{swapTryLine(idea)}</p>
                  {idea.note ? (
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{idea.note}</p>
                  ) : null}
                  {idea.source ? (
                    <p className="mt-2 text-[12px] text-ink-muted">Sources: {idea.source}</p>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-white/75">
              Scan one before you decide.
            </p>
            <ButtonLink href="/scan" tone="light" className="mt-4">
              Scan a substitute
            </ButtonLink>
          </section>
        ) : swapsReady && verdict.hits.length > 0 ? (
          <section className="mt-7 rounded-[22px] bg-surface p-4 ring-1 ring-ink/6">
            <p className="text-[15px] leading-relaxed">{noSwapLine(allergens)}</p>
          </section>
        ) : null}

        {mealIdeas.length > 0 ? (
          <section className="mt-7">
            <Button
              tone="forest"
              aria-expanded={mealsOpen}
              onClick={() => setMealsOpen((open) => !open)}
              className="shadow-[0_12px_24px_rgb(22_63_48/0.28)]"
            >
              Meal suggestions
            </Button>
            {mealsOpen ? (
              <div className="mt-3">
                <p className="text-[15px] leading-relaxed text-ink-muted">
                  Meals from the approved menu that leave this out. Read the label before you cook.
                </p>
                <ul className="mt-3 space-y-2">
                  {mealIdeas.map((dish) => (
                    <li key={dish.id}>
                      <Link
                        href={`/dishes/${dish.id}`}
                        className="block rounded-[20px] bg-surface px-4 py-3 text-[16px] font-semibold ring-1 ring-ink/6"
                      >
                        {dish.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {verdict.unknowns.length > 0 ? (
          <section className="mt-7">
            <p className="mb-3 text-[18px] font-semibold tracking-[-0.01em]">
              Product is not found
            </p>
            <div className="space-y-2">
              {verdict.unknowns.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="rounded-[22px] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/6"
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
          <p className="mb-3 text-[18px] font-semibold tracking-[-0.01em]">
            Checked against {selectedMember.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {memberRestrictionLabels(selectedMember).length === 0 ? (
              <p className="text-[14px] text-ink-muted">
                No restrictions set, so nothing could be flagged.
              </p>
            ) : (
              memberRestrictionLabels(selectedMember).map((label) => (
                <Badge key={label} tone="pass">
                  {label}
                </Badge>
              ))
            )}
          </div>
        </section>

        <div className="mt-8 space-y-3">
          <ButtonLink href={`/explain/${product.id}`}>
            Why this verdict
          </ButtonLink>
          {product.ingredients.length > 0 ? (
            <ButtonLink tone="outline" href={`/product/${product.id}`}>
              See all ingredients
            </ButtonLink>
          ) : null}
          <Link
            href="/scan"
            className="block py-2 text-center text-[14px] font-medium text-ink-muted underline decoration-line underline-offset-4"
          >
            Scan another product
          </Link>
        </div>

        {others.length > 0 ? (
          <section className="mt-7">
            <p className="mb-3 text-[18px] font-semibold tracking-[-0.01em]">
              Rest of the household
            </p>
            <ul className="space-y-2">
              {others.map((member) => {
                const theirs = computeVerdict(product, member);
                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      onClick={() => selectMember(member.id)}
                      className="flex w-full items-center gap-3 rounded-[22px] bg-surface p-3 pr-4 text-left shadow-[var(--shadow-card)] ring-1 ring-ink/6"
                    >
                      <Avatar member={member} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-semibold">
                          {member.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
                          Tap to read this for {member.name}
                        </span>
                      </span>
                      <OutcomeMark status={theirs.status} className="w-[92px]" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <VerdictDisclaimer className="mt-6" />
        <Disclaimer className="mt-3" />
      </ScreenBody>

      {reporting ? (
        <ReportErrorSheet
          productName={unverified ? product.barcode : product.name}
          onClose={() => setReporting(false)}
        />
      ) : null}
    </Screen>
  );
}
