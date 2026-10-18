"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ScanMark } from "@/components/ScanMark";
import { OutcomeMark } from "@/components/OutcomeMark";
import {
  Disclaimer,
  Screen,
  ScreenFooter,
  VerdictDisclaimer,
} from "@/components/ui";
import { useHousehold } from "@/context/HouseholdContext";
import { computeVerdict, verdictHeadline } from "@/lib/engine";
import { buildPrompts, explainOpening } from "@/lib/explain";
import { isUnverifiedLookup, type Product } from "@/lib/types";

type Turn = { id: string; role: "user" | "app"; text: string };

export function ExplainView({ product }: { product: Product }) {
  const { selectedMember } = useHousehold();
  const scrollRef = useRef<HTMLDivElement>(null);

  const verdict = useMemo(
    () => (selectedMember ? computeVerdict(product, selectedMember) : null),
    [product, selectedMember],
  );

  const prompts = useMemo(
    () =>
      selectedMember && verdict
        ? buildPrompts(product, selectedMember, verdict)
        : [],
    [product, selectedMember, verdict],
  );

  const [turns, setTurns] = useState<Turn[]>([]);
  const [asked, setAsked] = useState<string[]>([]);

  const remaining = prompts.filter((prompt) => !asked.includes(prompt.id));

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns]);

  if (!selectedMember || !verdict) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-[15px] text-ink-muted">Loading the verdict…</p>
        </div>
      </Screen>
    );
  }

  const { title } = verdictHeadline(verdict, selectedMember);

  const ask = (id: string) => {
    const prompt = prompts.find((item) => item.id === id);
    if (!prompt) return;
    setAsked((current) => [...current, id]);
    setTurns((current) => [
      ...current,
      { id: `${id}-q`, role: "user", text: prompt.question },
      { id: `${id}-a`, role: "app", text: prompt.answer },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader back />

      <div className="shrink-0 border-b border-line px-5 pb-4">
        <div className="flex items-center gap-3">
          <ScanMark />
          <h1 className="min-w-0 flex-1 text-[22px] font-bold leading-tight tracking-[-0.02em]">
            {title}
          </h1>
          <OutcomeMark status={verdict.status} className="w-[104px]" />
        </div>
        <p className="mt-1 ml-12 text-[13px] text-ink-muted">
          {isUnverifiedLookup(product.lookupStatus) ? product.barcode : product.name} · verdict locked by the rules engine
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-4">
          <div className="rounded-surface border border-line bg-surface p-4">
            <p className="label-eyebrow mb-2">Plain language</p>
            <p className="text-[15px] leading-relaxed">
              {explainOpening(product, selectedMember, verdict)}
            </p>
          </div>

          {turns.map((turn) =>
            turn.role === "user" ? (
              <p
                key={turn.id}
                className="ml-auto max-w-[85%] rounded-surface bg-forest px-4 py-3 text-[15px] leading-snug text-white"
              >
                {turn.text}
              </p>
            ) : (
              <p
                key={turn.id}
                className="max-w-[92%] text-[15px] leading-relaxed"
              >
                {turn.text}
              </p>
            ),
          )}
        </div>
      </div>

      <ScreenFooter>
        {remaining.length > 0 ? (
          <>
            <p className="label-eyebrow mb-3">Ask a follow-up</p>
            <div className="mb-4 flex max-h-[168px] flex-col gap-2 overflow-y-auto">
              {remaining.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => ask(prompt.id)}
                  className="rounded-full border border-line bg-surface px-4 py-3 text-left text-[14px] font-medium leading-snug active:scale-[0.99]"
                >
                  {prompt.question}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="mb-4 text-center text-[14px] leading-relaxed text-ink-muted">
            That is everything the explanation layer can say about this scan. The
            verdict did not change while you asked.
          </p>
        )}
        <VerdictDisclaimer className="mb-3" />
        <Disclaimer />
      </ScreenFooter>
    </Screen>
  );
}
