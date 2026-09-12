"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash } from "@phosphor-icons/react/dist/ssr";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  Button,
  Disclaimer,
  Screen,
  ScreenBody,
  ScreenFooter,
  SectionLabel,
} from "@/components/ui";
import { AllergenPicker, ProtocolPicker, TextField } from "@/components/pickers";
import {
  removeMember,
  saveMember,
  useHousehold,
} from "@/context/HouseholdContext";
import { summarizeProfile } from "@/lib/allergens";
import type { AllergenId, HouseholdMember, ProtocolId } from "@/lib/types";

type Draft = {
  id: string | null;
  name: string;
  relation: string;
  allergens: AllergenId[];
  protocols: ProtocolId[];
};

const blankDraft: Draft = {
  id: null,
  name: "",
  relation: "",
  allergens: [],
  protocols: [],
};

export default function HouseholdPage() {
  const router = useRouter();
  const { members } = useHousehold();
  const [draft, setDraft] = useState<Draft | null>(null);

  const startEdit = (member: HouseholdMember) =>
    setDraft({
      id: member.id,
      name: member.name,
      relation: member.relation,
      allergens: member.allergens,
      protocols: member.protocols,
    });

  const commit = () => {
    if (!draft || draft.name.trim().length === 0) return;
    const id =
      draft.id ??
      `${draft.name.trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
    saveMember({
      id,
      name: draft.name.trim(),
      relation: draft.relation.trim() || "Household member",
      allergens: draft.allergens,
      protocols: draft.protocols,
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
      <ScreenHeader back />
      <ScreenBody>
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em]">
          Your household
        </h1>
        <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-ink-muted">
          Each person gets their own profile, so the same product can be safe for
          one of them and not the other.
        </p>

        <ul className="mt-7 divide-y divide-line border-y border-line">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-3 py-4">
              <button
                type="button"
                onClick={() => startEdit(member)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block text-[17px] font-semibold">
                  {member.name}
                </span>
                <span className="mt-0.5 block text-[13px] text-ink-muted">
                  {member.relation}
                </span>
                <span className="mt-1.5 block text-[13px] leading-relaxed text-ink-muted">
                  {summarizeProfile(member.allergens, member.protocols)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeMember(member.id)}
                aria-label={`Remove ${member.name}`}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-ink-muted"
              >
                <Trash size={18} />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setDraft(blankDraft)}
          className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full border border-dashed border-line text-[15px] font-semibold active:scale-[0.99]"
        >
          <Plus size={18} weight="bold" />
          Add a member
        </button>

        <p className="mt-6 text-[13px] leading-relaxed text-ink-muted">
          Allergy profiles are health-adjacent data. In this prototype they never
          leave your browser.
        </p>

        <Disclaimer className="mt-6" />
      </ScreenBody>

      {members.length > 0 ? (
        <ScreenFooter>
          <Button onClick={() => router.push("/home")}>Done</Button>
        </ScreenFooter>
      ) : null}
    </Screen>
  );
}
