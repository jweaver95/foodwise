"use client";

import { Check } from "@phosphor-icons/react/dist/ssr";
import { BIG_NINE, EXTRA_IRRITANTS, PROTOCOLS } from "@/lib/allergens";
import { SectionLabel } from "@/components/ui";
import type { AllergenId, ProtocolId } from "@/lib/types";

function Toggle({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[48px] items-center justify-center rounded-full px-4 text-[15px] font-medium transition-transform duration-150 active:scale-[0.97] ${
        selected
          ? "bg-forest text-white"
          : "border border-line bg-surface text-ink"
      }`}
    >
      {label}
    </button>
  );
}

export function AllergenPicker({
  value,
  onChange,
}: {
  value: AllergenId[];
  onChange: (next: AllergenId[]) => void;
}) {
  const toggle = (id: AllergenId) =>
    onChange(
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>The big nine</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {BIG_NINE.map((allergen) => (
            <Toggle
              key={allergen.id}
              label={allergen.label}
              selected={value.includes(allergen.id)}
              onClick={() => toggle(allergen.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[15px] font-semibold">Beyond the label</p>
        <p className="mb-3 text-[13px] leading-relaxed text-ink-muted">
          Labels are only required to call out the nine above. FoodWise tracks
          these too.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {EXTRA_IRRITANTS.map((allergen) => (
            <Toggle
              key={allergen.id}
              label={allergen.label}
              selected={value.includes(allergen.id)}
              onClick={() => toggle(allergen.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProtocolPicker({
  value,
  onChange,
}: {
  value: ProtocolId[];
  onChange: (next: ProtocolId[]) => void;
}) {
  const toggle = (id: ProtocolId) =>
    onChange(
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );

  return (
    <ul className="divide-y divide-line border-y border-line">
      {PROTOCOLS.map((protocol) => {
        const selected = value.includes(protocol.id);
        return (
          <li key={protocol.id}>
            <button
              type="button"
              onClick={() => toggle(protocol.id)}
              aria-pressed={selected}
              className="flex w-full items-center gap-4 py-4 text-left"
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                  selected
                    ? "border-forest bg-forest text-white"
                    : "border-line bg-surface"
                }`}
              >
                {selected ? <Check size={14} weight="bold" /> : null}
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-semibold">
                  {protocol.label}
                </span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-muted">
                  {protocol.hint}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold">{label}</span>
      {hint ? (
        <span className="text-[13px] leading-relaxed text-ink-muted">{hint}</span>
      ) : null}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoCapitalize={type === "email" ? "none" : undefined}
        autoComplete={
          autoComplete ??
          (type === "password" ? "current-password" : type === "email" ? "email" : undefined)
        }
        className="min-h-[52px] rounded-surface border border-line bg-surface px-4 text-[16px] text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
      />
    </label>
  );
}

export function CategoryPicker({
  categories,
  value,
  onChange,
}: {
  categories: { id: number; name: string }[];
  value: number[];
  onChange: (next: number[]) => void;
}) {
  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Toggle
          key={category.id}
          label={category.name.replace(/\b\w/g, (letter) => letter.toUpperCase())}
          selected={value.includes(category.id)}
          onClick={() => toggle(category.id)}
        />
      ))}
    </div>
  );
}
