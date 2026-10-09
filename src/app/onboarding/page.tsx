"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  Button,
  Disclaimer,
  Screen,
  ScreenBody,
  ScreenFooter,
  SectionLabel,
} from "@/components/ui";
import { AllergenPicker, CategoryPicker, ProtocolPicker, TextField } from "@/components/pickers";
import {
  saveMember,
  setShopperName,
  useHousehold,
} from "@/context/HouseholdContext";
import { loadCategories } from "@/lib/account";
import { summarizeProfile } from "@/lib/allergens";
import type { AllergenId, ProtocolId } from "@/lib/types";

const STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { shopperName, source } = useHousehold();
  const account = source === "account";

  const [step, setStep] = useState(0);
  const [shopper, setShopper] = useState(shopperName);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [allergens, setAllergens] = useState<AllergenId[]>([]);
  const [protocols, setProtocols] = useState<ProtocolId[]>([]);
  const [categories, setCategories] = useState<
    { id: number; name: string; category_type: string }[]
  >([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    if (!account) return;
    void loadCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [account]);

  const canAdvance = step === 0 ? name.trim().length > 0 : true;

  const finish = () => {
    setShopperName(shopper.trim() || "you");
    const selected = categories.filter((category) => categoryIds.includes(category.id));
    saveMember({
      id: account
        ? crypto.randomUUID()
        : `${name.trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`,
      name: name.trim(),
      relation: relation.trim() || "Household member",
      allergens: account ? [] : allergens,
      protocols: account ? [] : protocols,
      categoryIds: account ? selected.map((category) => category.id) : undefined,
      categoryNames: account ? selected.map((category) => category.name) : undefined,
    });
    router.push("/home");
  };

  return (
    <Screen>
      <ScreenHeader
        back={step === 0}
        action={
          <p className="font-mono text-[12px] text-ink-muted">
            Step {step + 1} of {STEPS}
          </p>
        }
      />

      {step > 0 ? (
        <div className="px-5 pb-2">
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="text-[14px] font-medium text-ink-muted underline decoration-line underline-offset-4"
          >
            Back a step
          </button>
        </div>
      ) : null}

      <div className="flex gap-1.5 px-5 pb-5 pt-2" aria-hidden>
        {Array.from({ length: STEPS }).map((_, index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full ${
              index <= step ? "bg-forest" : "bg-line"
            }`}
          />
        ))}
      </div>

      <ScreenBody>
        {step === 0 ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-[30px] font-bold leading-tight tracking-[-0.03em] text-wrap-balance">
                Who are you protecting?
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                Start with the person whose allergies you check most often. You
                can add the rest of the household later.
              </p>
            </div>
            <div className="space-y-5">
              <TextField
                label="Their first name"
                value={name}
                onChange={setName}
                placeholder="Leo"
              />
              <TextField
                label="How they relate to you"
                hint="Optional. Shown on the member chip so you can switch quickly."
                value={relation}
                onChange={setRelation}
                placeholder="Son, 6"
              />
              <TextField
                label="Your name"
                hint="Optional. Used only on the home screen."
                value={shopper}
                onChange={setShopper}
                placeholder="Priya"
              />
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">
                What does {name.trim() || "they"} react to?
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                Every scan is checked against exactly this list. Leave it empty
                and FoodWise has nothing to protect against.
              </p>
            </div>
            {account ? (
              <CategoryPicker
                categories={categories.filter((category) => category.category_type === "allergen")}
                value={categoryIds}
                onChange={setCategoryIds}
              />
            ) : (
              <AllergenPicker value={allergens} onChange={setAllergens} />
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-8">
            <div>
              <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">
                Any dietary protocols?
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                These widen the net beyond allergens. Skip this if it does not
                apply.
              </p>
            </div>
            {account ? (
              <CategoryPicker
                categories={categories.filter((category) => category.category_type === "additive")}
                value={categoryIds}
                onChange={setCategoryIds}
              />
            ) : (
              <ProtocolPicker value={protocols} onChange={setProtocols} />
            )}

            <div>
              <SectionLabel>What gets checked</SectionLabel>
              <div className="rounded-surface border border-line bg-surface p-4">
                <p className="text-[17px] font-semibold">
                  {name.trim() || "Household member"}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                  {account
                    ? categories
                        .filter((category) => categoryIds.includes(category.id))
                        .map((category) => category.name)
                        .join(", ") || "No restrictions set"
                    : summarizeProfile(allergens, protocols)}
                </p>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
                {account
                  ? "This profile is saved to your FoodWise account."
                  : "This sample stays on this device."}
              </p>
            </div>
          </div>
        ) : null}
      </ScreenBody>

      <ScreenFooter>
        <div className="space-y-3">
          {step < STEPS - 1 ? (
            <Button
              disabled={!canAdvance}
              onClick={() => setStep((current) => current + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={finish}>Start scanning</Button>
          )}
          <Disclaimer />
        </div>
      </ScreenFooter>
    </Screen>
  );
}
