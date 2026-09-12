"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button, Screen, ScreenBody, SectionLabel } from "@/components/ui";
import { reset, useHousehold } from "@/context/HouseholdContext";

const BUILD_NOTES = [
  {
    term: "Ingredient data",
    detail:
      "Barcode lookups come from Open Food Facts, with USDA FoodData Central for nutrition. This prototype ships five fixed sample products.",
  },
  {
    term: "Safety verdict",
    detail:
      "A deterministic rules engine compares the panel to each profile and returns pass, contains, or unknown. No model is involved.",
  },
  {
    term: "Explanation layer",
    detail:
      "A language model translates the verdict into plain language and answers follow-ups. It receives the verdict as an input and cannot change it.",
  },
  {
    term: "Not wired up yet",
    detail:
      "Live camera, barcode SDK, OCR confidence handling, accounts, and the hosted database.",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { shopperName, members } = useHousehold();

  return (
    <Screen>
      <ScreenHeader back />
      <ScreenBody>
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">
          Settings
        </h1>

        <section className="mt-7">
          <SectionLabel>Household</SectionLabel>
          <Link
            href="/household"
            className="flex items-center gap-3 border-y border-line py-4"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-semibold">
                {members.length} {members.length === 1 ? "profile" : "profiles"}
              </span>
              <span className="mt-0.5 block truncate text-[13px] text-ink-muted">
                {members.map((member) => member.name).join(", ") || "None yet"}
              </span>
            </span>
            <CaretRight size={18} className="shrink-0 text-ink-muted" />
          </Link>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
            Shopping as {shopperName || "you"}. Profiles and scan history are
            stored in this browser only, never uploaded.
          </p>
        </section>

        <section className="mt-8">
          <SectionLabel>What is real in this prototype</SectionLabel>
          <dl className="divide-y divide-line border-y border-line">
            {BUILD_NOTES.map((note) => (
              <div key={note.term} className="py-4">
                <dt className="text-[15px] font-semibold">{note.term}</dt>
                <dd className="mt-1 max-w-[46ch] text-[14px] leading-relaxed text-ink-muted">
                  {note.detail}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8">
          <SectionLabel>Limits</SectionLabel>
          <p className="max-w-[46ch] text-[14px] leading-relaxed text-ink-muted">
            FoodWise is a decision aid, not a medical device, and not a substitute
            for reading the label. It does not interpret cross-contamination
            warnings, and it reports unknown rather than guessing when an
            ingredient is missing from the mapping table.
          </p>
        </section>

        <div className="mt-8">
          <Button
            tone="outline"
            onClick={() => {
              reset();
              router.push("/");
            }}
          >
            Reset this prototype
          </Button>
        </div>
      </ScreenBody>
    </Screen>
  );
}
