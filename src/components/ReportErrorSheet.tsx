"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui";

const REASONS = [
  "The package lists an ingredient FoodWise missed",
  "An ingredient here is not on the package",
  "The verdict is wrong for this person",
  "Wrong product came back for this barcode",
];

export function ReportErrorSheet({
  productName,
  onClose,
}: {
  productName: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute inset-0 bg-forest-deep/50"
      />
      <div className="relative max-h-[85%] overflow-y-auto rounded-t-[24px] border-t border-line bg-paper px-5 pb-6 pt-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.02em]">
              {sent ? "Thank you" : "Report an error"}
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
              {sent
                ? "A wrong verdict is the most important thing we can hear about."
                : productName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 flex size-10 items-center justify-center rounded-full text-ink"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-5">
            <p className="text-[15px] leading-relaxed">
              In the shipped app this goes into the review queue that feeds
              corrections back into the ingredient database. Keep reading the
              package until it is fixed.
            </p>
            <Button onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <ul className="divide-y divide-line border-y border-line">
              {REASONS.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => setReason(item)}
                    aria-pressed={reason === item}
                    className="flex w-full items-center gap-4 py-4 text-left"
                  >
                    <span
                      className={`size-5 shrink-0 rounded-full border ${
                        reason === item
                          ? "border-forest bg-forest"
                          : "border-line bg-surface"
                      }`}
                    />
                    <span className="text-[15px] leading-snug">{item}</span>
                  </button>
                </li>
              ))}
            </ul>
            <Button disabled={!reason} onClick={() => setSent(true)}>
              Send report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
