"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ReportErrorSheet } from "@/components/ReportErrorSheet";
import { Avatar } from "@/components/Avatar";
import { ProductPhoto } from "@/components/ProductPhoto";
import {
  Badge,
  ButtonLink,
  Disclaimer,
  Screen,
  ScreenBody,
  StatusPill,
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
import type { Product } from "@/lib/types";

export function VerdictView({ product }: { product: Product }) {
  const router = useRouter();
  const { hydrated, selectedMember, members, source } = useHousehold();
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
        <div className="bezel">
          <div className={`bezel-inner ${statusSurface[verdict.status]}`}>
            <div className="relative h-[168px]">
              <ProductPhoto
                src={product.image}
                alt=""
                className="h-full w-full"
                sizes="400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            </div>
            <div className="px-5 pb-6 pt-5">
              <p className="text-[12px] font-semibold tracking-[0.12em] text-white/80 uppercase">
                {kicker}
              </p>
              <h1 className="mt-2 text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-wrap-balance">
                {title}
              </h1>
              <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-white/88">
                {detail}
              </p>
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
              {product.name}
            </h2>
            <p className="font-mono text-[12px] text-ink-muted">
              {product.brand} · {product.barcode}
            </p>
          </div>
        </div>

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
          <section className="mt-7">
            <p className="mb-3 text-[18px] font-semibold tracking-[-0.01em]">
              What triggered this
            </p>
            <div className="space-y-2">
              {verdict.hits.map((hit) => (
                <div
                  key={hit.ingredient.id}
                  className="rounded-[22px] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/6"
                >
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

        {verdict.unknowns.length > 0 ? (
          <section className="mt-7">
            <p className="mb-3 text-[18px] font-semibold tracking-[-0.01em]">
              Not in the mapping table
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

        <VerdictDisclaimer className="mt-6" />
        <Disclaimer className="mt-3" />
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
