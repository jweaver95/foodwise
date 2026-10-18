import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { VerdictStatus } from "@/lib/types";

/* Shape rule for the whole app: interactive controls are pills, surfaces are 16px. */

export function Screen({
  children,
  tone = "paper",
}: {
  children: ReactNode;
  tone?: "paper" | "dark";
}) {
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${
        tone === "dark" ? "bg-viewfinder text-white" : "bg-paper text-ink"
      }`}
    >
      {children}
    </div>
  );
}

export function ScreenBody({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
      {children}
    </div>
  );
}

export function ScreenFooter({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 border-t border-line bg-paper px-5 pb-5 pt-4">
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="label-eyebrow mb-3">{children}</p>;
}

export const LEGAL_DISCLAIMER =
  "For informational purposes only. Scan results, ingredient flags, and product verdicts are provided for general educational and informational purposes—not as personalized medical or nutrition advice. If you have a health condition, severe allergy, or an unclear ingredient, please consult a qualified healthcare professional or registered dietitian.";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-[11px] text-ink-muted ${className}`}>
      Not medical advice.
    </p>
  );
}

export function VerdictDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[12px] leading-relaxed text-ink-muted ${className}`}>
      {LEGAL_DISCLAIMER}
    </p>
  );
}

type ButtonTone = "primary" | "outline" | "danger" | "light";

const buttonTones: Record<ButtonTone, string> = {
  primary: "bg-ink text-paper",
  outline: "border border-line bg-transparent text-ink",
  danger: "bg-fail text-white",
  light: "bg-white text-forest",
};

const buttonBase =
  "flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-40";

export function Button({
  tone = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { tone?: ButtonTone }) {
  return (
    <button
      type="button"
      className={`${buttonBase} ${buttonTones[tone]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  tone = "primary",
  className = "",
  href,
  children,
}: {
  tone?: ButtonTone;
  className?: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${buttonBase} ${buttonTones[tone]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-surface border border-line bg-surface p-4 ${className}`}
    >
      {children}
    </div>
  );
}

type BadgeTone = "neutral" | "pass" | "fail" | "unknown";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-paper-2 text-ink-muted",
  pass: "bg-pass-soft text-pass-ink",
  fail: "bg-fail-soft text-fail-ink",
  unknown: "bg-unknown-soft text-unknown-ink",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

export const statusBadgeTone: Record<VerdictStatus, BadgeTone> = {
  PASS: "pass",
  CONTAINS_ALLERGEN: "fail",
  UNKNOWN_INGREDIENT: "unknown",
  LOOKUP_FAILED: "unknown",
  UNKNOWN_PRODUCT: "unknown",
  INSUFFICIENT_DATA: "unknown",
};

export const statusShortLabel: Record<VerdictStatus, string> = {
  PASS: "Safe",
  CONTAINS_ALLERGEN: "Contains",
  UNKNOWN_INGREDIENT: "Unknown",
  LOOKUP_FAILED: "No lookup",
  UNKNOWN_PRODUCT: "No product",
  INSUFFICIENT_DATA: "No panel",
};

/* Verdict surfaces: the one moment where color carries the whole message. */
export const statusSurface: Record<VerdictStatus, string> = {
  PASS: "bg-pass text-white",
  CONTAINS_ALLERGEN: "bg-fail text-white",
  UNKNOWN_INGREDIENT: "bg-unknown text-white",
  LOOKUP_FAILED: "bg-unknown text-white",
  UNKNOWN_PRODUCT: "bg-unknown text-white",
  INSUFFICIENT_DATA: "bg-unknown text-white",
};

export function StatusPill({ status }: { status: VerdictStatus }) {
  return <Badge tone={statusBadgeTone[status]}>{statusShortLabel[status]}</Badge>;
}
