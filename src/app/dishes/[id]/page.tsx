"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Disclaimer, Screen, ScreenBody } from "@/components/ui";
import { dishById } from "@/lib/kitchen";

export default function DishPage() {
  const params = useParams<{ id: string }>();
  const dish = dishById(params.id ?? "");

  if (!dish) {
    return (
      <Screen>
        <ScreenHeader back />
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="max-w-[28ch] text-[15px] leading-relaxed text-ink-muted">
            That dish is not on this menu.
          </p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader back />
      <ScreenBody>
        <p className="text-[12px] font-semibold tracking-[0.12em] text-ink-muted uppercase">
          {dish.meal}
        </p>
        <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.02em]">
          {dish.name}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{dish.summary}</p>
        <p className="mt-2 text-[13px] text-ink-muted">{dish.serves}</p>

        {dish.book && dish.parts.length === 0 ? (
          <div className="mt-5 rounded-[28px] bg-forest px-4 py-5 text-white shadow-[0_16px_32px_rgb(22_63_48/0.22)]">
            <p className="text-[18px] font-semibold tracking-[-0.01em]">Full recipe</p>
            <div className="mt-4 rounded-[20px] bg-paper px-4 py-3.5 text-ink">
              <p className="text-[16px] font-semibold leading-snug">{dish.book.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{dish.book.where}</p>
            </div>
            <Link
              href="/resources"
              className="mt-4 flex min-h-[56px] items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-forest"
            >
              See the cookbooks
            </Link>
          </div>
        ) : null}

        {dish.parts.map((part) => (
          <section key={part.title} className="mt-7">
            <h2 className="text-[18px] font-semibold tracking-[-0.01em]">{part.title}</h2>
            <ul className="mt-3 space-y-1.5">
              {part.ingredients.map((item) => (
                <li key={item} className="text-[15px] leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
            <ol className="mt-4 space-y-3">
              {part.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-[15px] leading-relaxed">
                  <span className="font-mono text-[13px] text-ink-muted">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}

        {dish.book && dish.parts.length > 0 ? (
          <p className="mt-7 text-[13px] leading-relaxed text-ink-muted">
            From {dish.book.title}
            {dish.book.where ? ` — ${dish.book.where}` : ""}.{" "}
            <Link href="/resources" className="font-semibold text-forest underline-offset-2 hover:underline">
              See the cookbooks
            </Link>
            .
          </p>
        ) : null}

        <section className="mt-7">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em]">Gluten-free option</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{dish.glutenFree}</p>
        </section>

        {dish.notes.length > 0 ? (
          <section className="mt-7">
            <h2 className="text-[18px] font-semibold tracking-[-0.01em]">Before you cook</h2>
            <ul className="mt-3 space-y-2">
              {dish.notes.map((note) => (
                <li key={note} className="text-[15px] leading-relaxed text-ink-muted">
                  {note}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Disclaimer className="mt-8" />
      </ScreenBody>
    </Screen>
  );
}
