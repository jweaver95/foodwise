"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Barcode, ImageSquare, X } from "@phosphor-icons/react/dist/ssr";
import { Button, Screen } from "@/components/ui";
import { useHousehold } from "@/context/HouseholdContext";
import { PRODUCTS, SAMPLE_SCAN_ORDER } from "@/lib/data";

type Mode = "barcode" | "ocr";

const SAMPLES = SAMPLE_SCAN_ORDER.map(
  (id) => PRODUCTS.find((product) => product.id === id)!,
);

export default function ScanPage() {
  const router = useRouter();
  const { selectedMember } = useHousehold();
  const [mode, setMode] = useState<Mode>("barcode");
  const [picking, setPicking] = useState(false);
  const [capturing, setCapturing] = useState<string | null>(null);

  useEffect(() => {
    if (!capturing) return;
    const timer = setTimeout(() => router.push(`/verdict/${capturing}`), 900);
    return () => clearTimeout(timer);
  }, [capturing, router]);

  return (
    <Screen tone="dark">
      <div className="relative flex flex-1 flex-col">
        {/* Viewfinder stand-in. A real build opens the camera here. */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,#1b241e_0%,#0d120f_70%)]" />

        <div className="relative flex flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between px-5 pt-5">
            <button
              type="button"
              onClick={() => router.push("/home")}
              aria-label="Close scanner"
              className="-ml-2 flex size-11 items-center justify-center rounded-full text-white active:scale-95"
            >
              <X size={24} weight="bold" />
            </button>
            <p className="rounded-full bg-white/15 px-4 py-2 text-[13px] font-medium text-white">
              Scanning for {selectedMember?.name ?? "your household"}
            </p>
          </header>

          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div className="relative size-[220px]">
              {[
                "left-0 top-0 border-l-2 border-t-2 rounded-tl-[14px]",
                "right-0 top-0 border-r-2 border-t-2 rounded-tr-[14px]",
                "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-[14px]",
                "right-0 bottom-0 border-r-2 border-b-2 rounded-br-[14px]",
              ].map((corner) => (
                <span
                  key={corner}
                  className={`absolute size-12 border-white/80 ${corner}`}
                />
              ))}
              {capturing ? null : (
                <span className="scanline absolute left-6 right-6 top-1/2 h-px bg-white/70" />
              )}
              {capturing ? (
                <span className="absolute inset-0 flex items-center justify-center text-[15px] font-medium text-white">
                  Reading panel…
                </span>
              ) : null}
            </div>

            <p className="mt-10 text-center text-[17px] font-medium text-white/90">
              {mode === "barcode"
                ? "Point at the barcode"
                : "Fill the frame with the ingredient panel"}
            </p>
            <p className="mt-2 max-w-[30ch] text-center text-[13px] leading-relaxed text-white/55">
              {mode === "barcode"
                ? "No barcode match? Switch to a photo of the panel."
                : "Low-confidence reads ask for a retake instead of guessing."}
            </p>
          </div>

          <div className="shrink-0 px-5 pb-6">
            <div className="mb-4 flex rounded-full bg-white/10 p-1">
              {(
                [
                  { id: "barcode" as Mode, label: "Barcode", Icon: Barcode },
                  { id: "ocr" as Mode, label: "Ingredient photo", Icon: ImageSquare },
                ]
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  aria-pressed={mode === id}
                  className={`flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors ${
                    mode === id ? "bg-white text-viewfinder" : "text-white/70"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>

            {picking ? (
              <div className="space-y-2">
                <p className="px-1 pb-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">
                  Pick a sample product
                </p>
                {SAMPLES.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setCapturing(product.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-surface bg-white/10 px-4 py-3 text-left active:scale-[0.99]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-white">
                        {product.name}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-white/55">
                        {product.capture === "ocr"
                          ? "No barcode match, panel photo"
                          : product.barcode}
                      </span>
                    </span>
                    {product.capture === "ocr" ? (
                      <ImageSquare size={18} className="shrink-0 text-white/70" />
                    ) : (
                      <Barcode size={18} className="shrink-0 text-white/70" />
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPicking(false)}
                  className="w-full py-3 text-[14px] font-medium text-white/60"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <Button
                  tone="light"
                  disabled={Boolean(capturing)}
                  onClick={() => setPicking(true)}
                >
                  {capturing ? "Reading panel…" : "Use a sample product"}
                </Button>
                <p className="mt-3 text-center text-[11px] text-white/45">
                  Demo mode. No camera or barcode SDK wired up yet.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Screen>
  );
}
