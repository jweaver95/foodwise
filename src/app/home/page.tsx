"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Barcode, Gear, Plus } from "@phosphor-icons/react/dist/ssr";
import {
  Disclaimer,
  Screen,
  ScreenBody,
  SectionLabel,
  StatusPill,
} from "@/components/ui";
import { selectMember, useHousehold } from "@/context/HouseholdContext";
import { summarizeProfile } from "@/lib/allergens";
import { getProduct } from "@/lib/data";

export default function HomePage() {
  const router = useRouter();
  const { hydrated, onboarded, shopperName, members, selectedMember, recentScans } =
    useHousehold();

  useEffect(() => {
    if (hydrated && !onboarded) router.replace("/");
  }, [hydrated, onboarded, router]);

  if (!hydrated || !selectedMember) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-[15px] text-ink-muted">Loading your household…</p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <header className="flex shrink-0 items-start justify-between px-5 pb-6 pt-8">
        <div>
          <p className="text-[14px] text-ink-muted">Shopping as</p>
          <h1 className="mt-1 text-[32px] font-bold leading-none tracking-[-0.02em]">
            {shopperName || "You"}
          </h1>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex size-11 items-center justify-center rounded-full border border-line text-ink"
        >
          <Gear size={20} />
        </Link>
      </header>

      <ScreenBody>
        <section className="mb-7">
          <SectionLabel>Who is this trip for</SectionLabel>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {members.map((member) => {
              const active = member.id === selectedMember.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => selectMember(member.id)}
                  aria-pressed={active}
                  className={`flex min-h-[62px] shrink-0 flex-col justify-center rounded-full px-5 text-left transition-transform duration-150 active:scale-[0.98] ${
                    active
                      ? "bg-forest text-white"
                      : "border border-line bg-surface text-ink"
                  }`}
                >
                  <span className="text-[16px] font-semibold leading-tight">
                    {member.name}
                  </span>
                  <span
                    className={`mt-0.5 max-w-[22ch] truncate text-[13px] leading-tight ${
                      active ? "text-white/75" : "text-ink-muted"
                    }`}
                  >
                    {summarizeProfile(member.allergens, member.protocols)}
                  </span>
                </button>
              );
            })}
            <Link
              href="/household"
              aria-label="Add a household member"
              className="flex size-[62px] shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink"
            >
              <Plus size={22} />
            </Link>
          </div>
        </section>

        <Link
          href="/scan"
          className="mb-8 flex flex-col items-center justify-center gap-3 rounded-surface bg-forest px-6 py-12 text-center text-white transition-transform duration-150 active:scale-[0.99]"
        >
          <Barcode size={44} weight="light" />
          <span className="text-[24px] font-bold tracking-[-0.01em]">
            Scan a product
          </span>
          <span className="text-[14px] text-white/75">
            Barcode, or a photo of the panel
          </span>
        </Link>

        <section>
          <SectionLabel>Recent scans</SectionLabel>
          {recentScans.length === 0 ? (
            <div className="rounded-surface border border-dashed border-line px-4 py-8 text-center">
              <p className="text-[15px] font-semibold">No scans yet</p>
              <p className="mx-auto mt-2 max-w-[28ch] text-[14px] leading-relaxed text-ink-muted">
                Scan something and the verdict for {selectedMember.name} shows up
                here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {recentScans.map((scan) => {
                const product = getProduct(scan.productId);
                if (!product) return null;
                return (
                  <li key={`${scan.productId}-${scan.memberId}`}>
                    <Link
                      href={`/verdict/${product.id}`}
                      className="flex items-center gap-4 py-4"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-semibold">
                          {product.name}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-ink-muted">
                          Checked for {scan.memberName}
                        </span>
                      </span>
                      <StatusPill status={scan.status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <Disclaimer className="mt-8" />
      </ScreenBody>
    </Screen>
  );
}
