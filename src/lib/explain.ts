import { allergenLabel, listToProse } from "./allergens";
import { triggeredLabels, verdictHeadline } from "./engine";
import type { HouseholdMember, Product, Verdict } from "./types";

/* Stand-in for the downstream explanation layer. In the real build a language
   model writes this copy from USER_PROFILE + PRODUCT_DATA + DATABASE_VERDICT.
   Every answer here is derived from the verdict it was handed, so no answer can
   contradict or re-decide it. */

export type ExplainPrompt = {
  id: string;
  question: string;
  answer: string;
};

export function explainOpening(
  product: Product,
  member: HouseholdMember,
  verdict: Verdict,
): string {
  const { title } = verdictHeadline(verdict, member);

  if (verdict.status === "CONTAINS_ALLERGEN") {
    const lines = verdict.hits.map(
      (hit) =>
        `${hit.ingredient.label}, which maps to ${allergenLabel(hit.allergenId).toLowerCase()}`,
    );
    const closing = verdict.hits.some((hit) => hit.reason === "allergen")
      ? `That is a direct match against ${member.name}'s profile, so the answer is no rather than maybe.`
      : `That came from ${member.name}'s dietary protocol rather than an allergy, so the call is yours, but the engine will keep saying no.`;
    return `${title}. The engine flagged ${listToProse(lines)}. ${closing}`;
  }

  if (verdict.status === "UNKNOWN_INGREDIENT") {
    const names = verdict.unknowns.map((item) => item.label);
    return `${title}. Everything else in ${product.name} came back clear, but ${listToProse(names)} is not in the mapping table. FoodWise reports unknown instead of guessing.`;
  }

  return `${title}. The engine checked all ${product.ingredients.length} ingredients against ${member.name}'s profile and none of them matched.`;
}

export function buildPrompts(
  product: Product,
  member: HouseholdMember,
  verdict: Verdict,
): ExplainPrompt[] {
  const prompts: ExplainPrompt[] = [];

  for (const hit of verdict.hits) {
    const label = allergenLabel(hit.allergenId);
    const reason =
      hit.reason === "protocol"
        ? `${label} is flagged by ${member.name}'s gluten-free protocol`
        : `${label} is on ${member.name}'s profile`;
    prompts.push({
      id: `hit-${hit.ingredient.id}`,
      question: `What is ${hit.ingredient.label}?`,
      answer: `${hit.ingredient.plain ?? `${hit.ingredient.label} is a ${label.toLowerCase()} derivative.`} Because ${reason}, this ingredient is what made the verdict a no. The verdict does not change.`,
    });
  }

  for (const bystander of verdict.bystanders) {
    const label = allergenLabel(bystander.allergenId);
    prompts.push({
      id: `bystander-${bystander.ingredient.id}`,
      question: `Does ${bystander.ingredient.label} matter here?`,
      answer: `${bystander.ingredient.plain ?? `${bystander.ingredient.label} maps to ${label.toLowerCase()}.`} ${label} is not on ${member.name}'s profile, so it did not affect this verdict. It would matter for a member who reacts to ${label.toLowerCase()}.`,
    });
  }

  for (const unknown of verdict.unknowns) {
    prompts.push({
      id: `unknown-${unknown.id}`,
      question: `Why is ${unknown.label} unknown?`,
      answer: `${unknown.plain ?? "This ingredient has no entry in the mapping table."} An unknown is not a pass. Read the panel on the package before you decide, and report it so the table can be corrected.`,
    });
  }

  if (verdict.status === "CONTAINS_ALLERGEN") {
    const labels = triggeredLabels(verdict).map((label) => label.toLowerCase());
    prompts.push({
      id: "alternatives",
      question: "What should I look for instead?",
      answer: `Look for a version of ${product.name} without ${listToProse(labels)} in the panel, then scan that one too. Front-of-package wording is not a substitute for the ingredient list.`,
    });
  }

  if (verdict.status === "PASS") {
    prompts.push({
      id: "coverage",
      question: "What did you actually check?",
      answer: `Every ingredient in the panel was checked against ${member.name}'s profile: ${listToProse([...member.allergens.map(allergenLabel)])}. FoodWise does not read cross-contamination warnings such as "made in a facility that also processes nuts", so check those on the package.`,
    });
  }

  prompts.push({
    id: "trust",
    question: "Who decided this, you or the database?",
    answer: `The database. The rules engine compared the ingredient list to ${member.name}'s profile and produced the verdict before I wrote a word. My only job is to put it in plain language. If the package disagrees with what you see here, trust the package and report the error.`,
  });

  return prompts;
}
