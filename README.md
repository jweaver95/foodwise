# FoodWise, look-and-feel prototype

A clickable mobile UI for FoodWise: scan a product, get a household-aware safety
verdict, then read a plain-language explanation of it.

This is the **design and interaction layer only**. Ingredient data is mocked,
there is no camera, no OCR, no live model, and no backend. It exists so the team
can agree on what the app feels like in the aisle before the data and engine work
lands.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL. It is a phone-framed web app, so it looks right on a laptop
and on a phone browser.

The fastest path through the demo: **Use the demo household** on the welcome
screen, then **Scan a product**, then **Use a sample product**.

## What the demo shows

Priya shops for two people with different profiles:

| Member | Profile |
| --- | --- |
| Leo | Peanut, tree nut |
| Maya | Milk, gluten-free |

Five sample products cover every verdict state:

| Product | Leo | Maya | Point it makes |
| --- | --- | --- | --- |
| Maple Hill Granola | Contains (peanut) | Contains (milk) | Same product, different reason per person |
| Sea Salt Oat Thins | Pass | Pass | A clean read, with soy called out as irrelevant to both |
| Garden Tomato Bisque | Pass | Contains (milk) | Hidden derivative: the panel says sodium caseinate, never "milk" |
| Miso Ginger Dressing | Pass | Contains (wheat) | A dietary protocol firing, not an allergy |
| Kanto Chili Crisp | Unknown | Unknown | Missing mapping reports unknown instead of guessing |

On any verdict screen, tapping another household member in **Same product, rest
of the household** recomputes the verdict live. That per-person answer is the
wedge against generalized scanners.

## How it is wired

```
src/lib/data.ts        Stand-in for Open Food Facts records
src/lib/engine.ts      Deterministic rules engine, the safety-critical core
src/lib/explain.ts     Explanation layer, scripted, reads the verdict as input
src/lib/householdStore.ts  Household + scan history, persisted to localStorage
src/components/ui.tsx  Design system primitives
```

The architecture mirrors the build roadmap on purpose:

1. `engine.ts` computes the verdict from the ingredient panel and one member
   profile. It returns `PASS`, `CONTAINS_ALLERGEN`, or `UNKNOWN_INGREDIENT`, and
   never treats a missing mapping as safe.
2. `explain.ts` only ever receives a verdict that is already decided. Every
   answer it produces is derived from that verdict, so no follow-up question can
   flip the result. Swapping it for a real model later should not change the
   verdict surface at all.

## Design rules in force

- One accent (forest green). Semantic color is reserved for verdicts: green pass,
  red contains, amber unknown. Amber is never styled like a pass.
- Verdicts never rely on color alone. The kicker, headline, and detail line all
  state the result in words.
- Surfaces use a 16px radius, interactive controls are pills. Tap targets are at
  least 44px for one-handed use in a store aisle.
- Works in light and dark, and honors `prefers-reduced-motion`.
- Every verdict screen carries a visible "Report an error" path and the
  "decision aid, not a medical device" line.

## Not built yet

Camera and barcode SDK, OCR with confidence handling and retake prompts, real
Open Food Facts and USDA lookups, accounts, hosted database, and a live
explanation model. `/settings` states these limits in the app itself.
