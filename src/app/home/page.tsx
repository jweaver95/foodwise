"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { GearSix, Plus } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/Avatar";
import { ProductPhoto } from "@/components/ProductPhoto";
import { Disclaimer, Screen, ScreenBody, StatusPill } from "@/components/ui";
import { selectMember, useHousehold } from "@/context/HouseholdContext";
import { memberRestrictionLabels } from "@/lib/engine";
import { greetingFor } from "@/lib/greeting";
import { recallProduct } from "@/lib/productCache";

export default function HomePage() {
  const router = useRouter();
  const { hydrated, ready, onboarded, shopperName, members, selectedMember, recentScans } =
    useHousehold();

  useEffect(() => {
    if (hydrated && ready && !onboarded) router.replace("/");
  }, [hydrated, ready, onboarded, router]);

  const todayCount = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return recentScans.filter((scan) => scan.at >= start.getTime()).length;
  }, [recentScans]);

  if (!hydrated || !ready) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-[15px] text-ink-muted">Opening your household…</p>
        </div>
      </Screen>
    );
  }

  if (!selectedMember) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-[15px] text-ink-muted">Taking you to set up…</p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <header className="flex shrink-0 items-start justify-between px-5 pb-2 pt-7">
        <div>
          <p className="text-[14px] text-ink-muted">
            {greetingFor(shopperName || "you")}
          </p>
          <h1 className="mt-1 max-w-[16ch] text-[30px] font-bold leading-[1.05] tracking-[-0.03em] text-wrap-balance">
            Protecting {selectedMember.name} today
          </h1>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex size-11 items-center justify-center rounded-full bg-surface text-ink shadow-[var(--shadow-card)] ring-1 ring-ink/6"
        >
          <GearSix size={20} />
        </Link>
      </header>

      <ScreenBody>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 pt-3">
            {members.map((member) => {
              const active = member.id === selectedMember.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => selectMember(member.id)}
                  aria-pressed={active}
                  className={`flex min-w-[148px] shrink-0 items-center gap-3 rounded-[22px] px-3 py-3 text-left transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                    active
                      ? "bg-forest text-white shadow-[0_12px_24px_rgb(31_92_69/0.28)]"
                      : "bg-surface text-ink ring-1 ring-ink/6"
                  }`}
                >
                  <Avatar member={member} size="sm" />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-tight">
                      {member.name}
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-[12px] leading-tight ${
                        active ? "text-white/75" : "text-ink-muted"
                      }`}
                    >
                      {member.relation}
                    </span>
                  </span>
                </button>
              );
            })}
            <Link
              href="/household"
              aria-label="Add a household member"
              className="flex size-[62px] shrink-0 items-center justify-center rounded-[22px] bg-surface text-ink ring-1 ring-ink/6"
            >
              <Plus size={22} />
            </Link>
          </div>

        <Link href="/scan" className="bezel mt-6 block active:scale-[0.99]">
            <div className="bezel-inner relative h-[210px]">
              <ProductPhoto
                src={
                  recallProduct(recentScans[0]?.productId ?? "")?.image ??
                  "/photos/welcome.png"
                }
                alt=""
                className="h-full w-full"
                sizes="400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[13px] font-medium text-white/75">
                  {memberRestrictionLabels(selectedMember).join(", ") ||
                    "No restrictions set"}
                </p>
                <p className="mt-1 text-[26px] font-bold tracking-[-0.02em]">
                  Scan the next thing
                </p>
                <p className="mt-1 text-[14px] text-white/75">
                  Barcode or a photo of the panel
                </p>
              </div>
            </div>
          </Link>

        <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/6">
              <p className="text-[12px] text-ink-muted">Checked today</p>
              <p className="mt-2 font-mono text-[32px] font-semibold leading-none tabular-nums">
                {todayCount}
              </p>
              <p className="mt-2 text-[13px] text-ink-muted">
                {todayCount === 1 ? "product" : "products"} for this trip
              </p>
            </div>
            <div className="rounded-[22px] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/6">
              <p className="text-[12px] text-ink-muted">This trip is for</p>
              <div className="mt-3 flex items-center gap-2">
                <Avatar member={selectedMember} size="sm" />
                <p className="text-[16px] font-semibold">{selectedMember.name}</p>
              </div>
              <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-ink-muted">
                {memberRestrictionLabels(selectedMember).join(", ") ||
                  "No restrictions set"}
              </p>
            </div>
          </div>

        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <p className="text-[18px] font-semibold tracking-[-0.01em]">
              Recent checks
            </p>
          </div>
          {recentScans.length === 0 ? (
            <div className="rounded-[22px] bg-surface px-5 py-8 text-center ring-1 ring-ink/6">
              <p className="text-[16px] font-semibold">The aisle is still quiet</p>
              <p className="mx-auto mt-2 max-w-[28ch] text-[14px] leading-relaxed text-ink-muted">
                Scan something and {selectedMember.name}&rsquo;s verdict lands here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentScans.map((scan, index) => {
                const product = recallProduct(scan.productId);
                if (!product) return null;
                return (
                  <li key={`${scan.productId}-${scan.memberId}-${index}`}>
                    <Link
                      href={`/verdict/${product.id}`}
                      className="flex items-center gap-3 rounded-[22px] bg-surface p-2 pr-4 shadow-[var(--shadow-card)] ring-1 ring-ink/6"
                    >
                      <ProductPhoto
                        src={product.image}
                        alt=""
                        className="size-[64px] shrink-0 rounded-[16px]"
                        sizes="64px"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-semibold">
                          {product.name}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-ink-muted">
                          For {scan.memberName}
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
