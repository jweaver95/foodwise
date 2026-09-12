"use client";

import { useRouter } from "next/navigation";
import { CaretLeft, X } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

export function ScreenHeader({
  back,
  dismiss,
  action,
  tone = "paper",
}: {
  back?: boolean;
  dismiss?: boolean;
  action?: ReactNode;
  tone?: "paper" | "dark";
}) {
  const router = useRouter();
  const iconColor = tone === "dark" ? "text-white" : "text-ink";

  return (
    <header className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
      {back || dismiss ? (
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={dismiss ? "Close" : "Go back"}
          className={`-ml-2 flex size-11 items-center justify-center rounded-full ${iconColor} transition-transform duration-150 active:scale-95`}
        >
          {dismiss ? <X size={24} weight="bold" /> : <CaretLeft size={24} weight="bold" />}
        </button>
      ) : (
        <span className="size-11" aria-hidden />
      )}
      {action}
    </header>
  );
}
