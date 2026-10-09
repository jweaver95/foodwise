"use client";

import { useEffect, useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/Avatar";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  Button,
  Disclaimer,
  Screen,
  ScreenBody,
  ScreenFooter,
  SectionLabel,
} from "@/components/ui";
import { AllergenPicker, CategoryPicker, ProtocolPicker, TextField } from "@/components/pickers";
import {
  removeMember,
  saveMember,
  useHousehold,
} from "@/context/HouseholdContext";
import { loadCategories } from "@/lib/account";
import { memberRestrictionLabels } from "@/lib/engine";
import type { AllergenId, HouseholdMember, ProtocolId } from "@/lib/types";

type Draft = {
  id: string | null;
  name: string;
  relation: string;
  allergens: AllergenId[];
  protocols: ProtocolId[];
  categoryIds: number[];
};

const blankDraft: Draft = {
  id: null,
  name: "",
  relation: "",
  allergens: [],
  protocols: [],
  categoryIds: [],
};

export default function HouseholdPage() {
  const { members, source } = useHousehold();
  const account = source === "account";
  const [draft, setDraft] = useState<Draft | null>(null);
  const [categories, setCategories] = useState<
    { id: number; name: string; category_type: string }[]
  >([]);

  useEffect(() => {
    if (!account) return;
    void loadCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [account]);

  const startEdit = (member: HouseholdMember) =>
    setDraft({
      id: member.id,
      name: member.name,
      relation: member.relation,
      allergens: member.allergens,
      protocols: member.protocols,
      categoryIds: member.categoryIds ?? [],
    });

  const commit = () => {
    if (!draft || draft.name.trim().length === 0) return;
    const selected = categories.filter((category) =>
      draft.categoryIds.includes(category.id),
    );
    const id =
      draft.id ??
      (account
        ? crypto.randomUUID()
        : `${draft.name.trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`);
    saveMember({
      id,
      name: draft.name.trim(),
      relation: draft.relation.trim() || "Household member",
      allergens: account ? [] : draft.allergens,
      protocols: account ? [] : draft.protocols,
      categoryIds: account ? selected.map((category) => category.id) : undefined,
      categoryNames: account ? selected.map((category) => category.name) : undefined,
    });
    setDraft(null);
  };

  if (draft) {
    return (
      <Screen>
        <ScreenHeader
          action={
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="text-[14px] font-medium text-ink-muted underline decoration-line underline-offset-4"
            >
              Cancel
            </button>
          }
        />
        <ScreenBody>
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">
            {draft.id ? `Edit ${draft.name || "member"}` : "Add a member"}
          </h1>

          <div className="mt-7 space-y-5">
            <TextField
              label="First name"
              value={draft.name}
              onChange={(name) => setDraft({ ...draft, name })}
              placeholder="Nadia"
            />
            <TextField
              label="How they relate to you"
              value={draft.relation}
              onChange={(relation) => setDraft({ ...draft, relation })}
              placeholder="Partner"
            />
          </div>

          {account ? (
            <>
              <div className="mt-8">
                <SectionLabel>Allergens</SectionLabel>
                <CategoryPicker
                  categories={categories.filter((category) => category.category_type === "allergen")}
                  value={draft.categoryIds}
                  onChange={(categoryIds) => setDraft({ ...draft, categoryIds })}
                />
              </div>
              <div className="mt-8">
                <SectionLabel>Additives and protocols</SectionLabel>
                <CategoryPicker
                  categories={categories.filter((category) => category.category_type === "additive")}
                  value={draft.categoryIds}
                  onChange={(categoryIds) => setDraft({ ...draft, categoryIds })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mt-8">
                <AllergenPicker
                  value={draft.allergens}
                  onChange={(allergens) => setDraft({ ...draft, allergens })}
                />
              </div>
              <div className="mt-8">
                <SectionLabel>Dietary protocols</SectionLabel>
                <ProtocolPicker
                  value={draft.protocols}
                  onChange={(protocols) => setDraft({ ...draft, protocols })}
                />
              </div>
            </>
          )}
        </ScreenBody>
        <ScreenFooter>
          <Button disabled={draft.name.trim().length === 0} onClick={commit}>
            Save member
          </Button>
        </ScreenFooter>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="px-5 pb-2 pt-8">
        <h1 className="text-[30px] font-bold leading-tight tracking-[-0.03em]">
          Your people
        </h1>
        <p className="mt-2 max-w-[36ch] text-[15px] leading-relaxed text-ink-muted">
          Each person gets their own profile, so the same product can be safe for
          one of them and not the other.
        </p>
      </div>
      <ScreenBody>
        <ul className="space-y-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-3 rounded-[22px] bg-surface p-3 pr-2 shadow-[var(--shadow-card)] ring-1 ring-ink/6"
            >
              <button
                type="button"
                onClick={() => startEdit(member)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <Avatar member={member} />
                <span className="min-w-0">
                  <span className="block text-[17px] font-semibold">
                    {member.name}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink-muted">
                    {member.relation}
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">
                    {memberRestrictionLabels(member).join(", ") || "No restrictions set"}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeMember(member.id)}
                aria-label={`Remove ${member.name}`}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-muted"
              >
                <Trash size={18} />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setDraft(blankDraft)}
          className="mt-5 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-surface text-[15px] font-semibold shadow-[var(--shadow-card)] ring-1 ring-ink/6 active:scale-[0.99]"
        >
          <Plus size={18} weight="bold" />
          Add a person
        </button>

        <p className="mt-6 text-[13px] leading-relaxed text-ink-muted">
          {account
            ? "Profiles are saved to your FoodWise account and protected by row-level security."
            : "This sample stays on this device."}
        </p>

        <Disclaimer className="mt-6" />
      </ScreenBody>
    </Screen>
  );
}
