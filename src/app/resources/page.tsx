import { ScreenHeader } from "@/components/ScreenHeader";
import { ButtonLink, Disclaimer, Screen, ScreenBody } from "@/components/ui";
import { COOKBOOKS } from "@/lib/kitchen";

export default function ResourcesPage() {
  return (
    <Screen>
      <ScreenHeader back />
      <ScreenBody>
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">
          Resources
        </h1>
        <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-ink-muted">
          Scan the package before you decide.
        </p>

        <section className="mt-8 rounded-[28px] bg-forest px-4 py-5 text-white shadow-[0_16px_32px_rgb(22_63_48/0.22)]">
          <p className="text-[18px] font-semibold tracking-[-0.01em]">Cookbooks</p>
          <p className="mt-1 text-[14px] leading-relaxed text-white/75">
            Three books for this kitchen. They are reading, not a verdict.
          </p>
          <ol className="mt-4 space-y-2">
            {COOKBOOKS.map((book, index) => (
              <li key={book.id} className="rounded-[20px] bg-paper px-4 py-3.5 text-ink">
                <p className="font-mono text-[12px] text-ink-muted">{index + 1}</p>
                <p className="mt-2 text-[17px] font-semibold leading-snug">{book.title}</p>
                {book.by ? (
                  <p className="mt-2 text-[14px] text-ink-muted">{book.by}</p>
                ) : null}
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{book.note}</p>
              </li>
            ))}
          </ol>
          <ButtonLink href="/dishes" tone="light" className="mt-4">
            Back to the approved dishes
          </ButtonLink>
        </section>

        <Disclaimer className="mt-8" />
      </ScreenBody>
    </Screen>
  );
}
