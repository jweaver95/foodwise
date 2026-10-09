"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button, Screen, ScreenBody, SectionLabel } from "@/components/ui";
import { reset, useHousehold } from "@/context/HouseholdContext";
import { signOutAccount } from "@/lib/account";

const BUILD_NOTES = [
  {
    term: "Ingredient data",
    detail:
      "A barcode looks the product up in Open Food Facts. A panel photo is read on this device, then you confirm the words. Either way, the mapping table decides, and a name that is not in that table stays unknown.",
  },
  {
    term: "Safety verdict",
    detail:
      "A deterministic rules engine compares the panel to each profile and returns pass, contains, or unknown. No model is involved.",
  },
  {
    term: "Explanation layer",
    detail:
      "Plain-language answers are derived from the verdict. They cannot change pass, contains, or unknown.",
  },
  {
    term: "Your household",
    detail:
      "Signed-in profiles are stored in Supabase. The Priya walkthrough stays on this device.",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { shopperName, members, source, syncError } = useHousehold();
  const account = source === "account";

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
            Shopping as {shopperName || "you"}.{" "}
            {account
              ? "Profiles and scan history are saved to your account."
              : "This sample stays on this device."}
          </p>
          {syncError ? (
            <p className="mt-3 text-[13px] leading-relaxed text-fail-ink">{syncError}</p>
          ) : null}
        </section>

        <section className="mt-8">
          <SectionLabel>How a verdict is made</SectionLabel>
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
              if (account) {
                void signOutAccount().then(() => router.push("/"));
                return;
              }
              reset();
              router.push("/");
            }}
          >
            {account ? "Sign out" : "Reset this demo"}
          </Button>
        </div>
      </ScreenBody>
    </Screen>
  );
}
