"use client";

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
      <div className="flex flex-1 flex-col justify-between px-6 pb-6 pt-16">
        <div>
          <p className="label-eyebrow">FoodWise</p>
          <h1 className="mt-6 max-w-[16ch] text-[40px] font-bold leading-[1.05] tracking-[-0.03em]">
            Know before it goes in the cart.
          </h1>
          <p className="mt-5 max-w-[34ch] text-[17px] leading-relaxed text-ink-muted">
            Scan a product and see whether it is safe for the person you are
            shopping for. Not a score. A verdict.
          </p>
        </div>

        <div className="space-y-6">
          <dl className="divide-y divide-line border-t border-line">
            {[
              {
                term: "The panel, translated",
                detail: "Casein, whey, tocopherols, mapped to what they actually are.",
              },
              {
                term: "One profile per person",
                detail: "Leo's peanut allergy and Maya's milk allergy are separate answers.",
              },
              {
                term: "The database decides",
                detail: "A rules engine computes the verdict. AI only explains it.",
              },
            ].map((item) => (
              <div key={item.term} className="py-4">
                <dt className="text-[15px] font-semibold">{item.term}</dt>
                <dd className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>

          <div className="space-y-3">
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
              Use the demo household
            </Button>
          </div>

          <Disclaimer />
        </div>
      </div>
    </Screen>
  );
}
