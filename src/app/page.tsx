"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, Disclaimer, Screen } from "@/components/ui";
import { loadDemo, useHousehold } from "@/context/HouseholdContext";

export default function WelcomePage() {
  const router = useRouter();
  const { hydrated, onboarded } = useHousehold();

  useEffect(() => {
    if (hydrated && onboarded) router.replace("/home");
  }, [hydrated, onboarded, router]);

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
          <p className="absolute left-6 top-8 text-[13px] font-semibold tracking-[0.18em] text-white uppercase">
            FoodWise
          </p>
        </div>

        <div className="relative z-10 -mt-24 bg-gradient-to-t from-paper via-paper to-transparent px-6 pb-6 pt-16">
          <h1 className="max-w-[13ch] text-[38px] font-bold leading-[1.04] tracking-[-0.035em] text-wrap-balance">
            Know before it goes in the cart.
          </h1>
          <p className="mt-4 max-w-[32ch] text-[16px] leading-relaxed text-ink-muted">
            A verdict for the person you are shopping for. Not a cleanliness
            score. Not a guess.
          </p>

          <div className="mt-7 space-y-3">
            <Button onClick={() => router.push("/onboarding")}>
              Set up your household
            </Button>
            <Button
              tone="outline"
              onClick={() => {
                loadDemo();
                router.push("/home");
              }}
            >
              Walk through as Priya
            </Button>
            <Disclaimer />
          </div>
        </div>
      </div>
    </Screen>
  );
}
