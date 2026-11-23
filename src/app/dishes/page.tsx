import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Disclaimer, Screen, ScreenBody, SectionLabel } from "@/components/ui";
import { DISHES, MENU_AVOIDS, MENU_SWAPS, SHOPPING } from "@/lib/kitchen";

const MEALS = ["Breakfast", "Lunch", "Dinner", "Birthday"] as const;

export default function DishesPage() {
  return (
    <Screen>
      <ScreenHeader back />
      <ScreenBody>
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">
          Approved dishes
        </h1>
        <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-ink-muted">
          Six meals and a birthday cake written to leave out milk and dairy,
          peanuts and tree nuts, eggs, beef, chicken, pork, and strawberries.
          Turkey, salmon, beans, and sunflower seeds do the work.
        </p>
        <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-ink-muted">
          Read every label. Brands change recipes. A dish here is not a scan
          verdict.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {MENU_AVOIDS.map((item) => (
            <span
              key={item}
              className="rounded-full bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink ring-1 ring-ink/8"
            >
              No {item.toLowerCase()}
            </span>
          ))}
        </div>

        {MEALS.map((meal) => (
          <section key={meal} className="mt-8">
            <SectionLabel>{meal}</SectionLabel>
            <ul className="overflow-hidden rounded-[22px] bg-surface shadow-[var(--shadow-card)] ring-1 ring-ink/6">
              {DISHES.filter((dish) => dish.meal === meal).map((dish) => (
                <li key={dish.id} className="border-t border-line first:border-t-0">
                  <Link href={`/dishes/${dish.id}`} className="flex items-center gap-3 px-4 py-4">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-semibold leading-snug">
                        {dish.name}
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">
                        {dish.book ? `Recipe in ${dish.book.title}` : dish.serves}
                      </span>
                    </span>
                    <CaretRight size={18} className="shrink-0 text-ink-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="mt-8">
          <SectionLabel>In these dishes</SectionLabel>
          <ul className="space-y-2">
            {MENU_SWAPS.map((swap) => (
              <li
                key={swap.instead}
                className="rounded-[22px] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-ink/6"
              >
                <p className="text-[16px] font-semibold">{swap.use}</p>
                <p className="mt-1 text-[13px] text-ink-muted">Instead of {swap.instead.toLowerCase()}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{swap.note}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
            Coconut left the FDA tree-nut list in 2025. Ask an allergist before
            using it. These menu choices are separate from the swap list a scan uses.
          </p>
        </section>

        <section className="mt-8">
          <SectionLabel>Shop for the week</SectionLabel>
          <div className="space-y-5">
            {SHOPPING.map((group) => (
              <div key={group.group}>
                <p className="text-[15px] font-semibold">{group.group}</p>
                <ul className="mt-2 space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item} className="text-[14px] leading-relaxed text-ink-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
            The “contains” line must name milk, egg, peanuts, and the specific
            tree nuts. It does not have to name beef, chicken, pork, or
            strawberry, so read the whole list. Dairy-free does not mean nut-free.
          </p>
        </section>

        <Link
          href="/resources"
          className="mt-8 block rounded-[28px] bg-forest px-4 py-5 text-white shadow-[0_16px_32px_rgb(22_63_48/0.22)]"
        >
          <span className="block text-[18px] font-semibold tracking-[-0.01em]">Cookbooks</span>
          <span className="mt-1 block text-[14px] leading-relaxed text-white/75">
            Three books behind this kitchen. Reading, not a verdict.
          </span>
          <span className="mt-4 flex min-h-[56px] items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-forest">
            See the cookbooks
          </span>
        </Link>

        <Disclaimer className="mt-8" />
      </ScreenBody>
    </Screen>
  );
}
