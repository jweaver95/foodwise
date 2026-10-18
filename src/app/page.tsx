"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, Disclaimer, Screen } from "@/components/ui";
import { loadDemo, useHousehold } from "@/context/HouseholdContext";

export default function WelcomePage() {
  const router = useRouter();
  const { hydrated, ready, onboarded, source } = useHousehold();

  useEffect(() => {
    if (hydrated && ready && onboarded) router.replace("/home");
  }, [hydrated, ready, onboarded, router]);

  return (
    <Screen>
      <div className="relative flex flex-1 flex-col">
        <div className="relative min-h-[52%] flex-1 overflow-hidden">
          <Image
            src="/photos/welcome.png"
            alt="A grocery cart in a store aisle, waiting on a decision"
            fill
            priority
            sizes="430px"
            className="object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/35 via-forest-deep/10 to-paper" />
        </div>

        <Image
          src="/foodwise-lockup.png"
          alt="Foodwise"
          width={349}
          height={51}
          priority
          className="absolute left-5 top-5 z-20 h-10 w-auto"
        />

        <div className="relative z-10 -mt-24 bg-gradient-to-t from-paper via-paper to-transparent px-6 pb-6 pt-14">
          <h1 className="max-w-[34ch] text-[17px] font-medium leading-relaxed text-wrap-balance">
            A mobile app built around three components: ingredient data capture
            (barcode scan or OCR), a deterministic rules engine that computes
            the safety verdict against a household member&apos;s profile.
          </h1>

          <div className="mt-7 space-y-3">
            <Button onClick={() => router.push("/account")}>
              Save your household
            </Button>
            {source === "account" ? null : (
              <Button
                tone="outline"
                onClick={() => {
                  loadDemo();
                  router.push("/home");
                }}
              >
                Try a sample household
              </Button>
            )}
            <Disclaimer />
          </div>
        </div>
      </div>
    </Screen>
  );
}
