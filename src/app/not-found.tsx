import { ButtonLink, Screen } from "@/components/ui";

export default function NotFound() {
  return (
    <Screen>
      <div className="flex flex-1 flex-col justify-center gap-5 px-6">
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">
            No product here
          </h1>
          <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-ink-muted">
            That barcode is not in the sample set. Scan again to pick one of the
            demo products.
          </p>
        </div>
        <ButtonLink href="/home">Back to home</ButtonLink>
      </div>
    </Screen>
  );
}
