import type { HouseholdMember } from "@/lib/types";

const PALETTES = [
  "bg-[#1f5c45] text-white",
  "bg-[#2a4a5c] text-white",
  "bg-[#5c3a2a] text-white",
  "bg-[#3d4a2e] text-white",
] as const;

function toneFor(name: string) {
  const code = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PALETTES[code % PALETTES.length];
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Avatar({
  member,
  size = "md",
  selected = false,
}: {
  member: Pick<HouseholdMember, "name">;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
}) {
  const dim =
    size === "lg" ? "size-16 text-[22px]" : size === "sm" ? "size-9 text-[13px]" : "size-12 text-[16px]";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight ${dim} ${toneFor(member.name)} ${
        selected ? "ring-2 ring-forest ring-offset-2 ring-offset-paper" : ""
      }`}
      aria-hidden
    >
      {initials(member.name)}
    </span>
  );
}
