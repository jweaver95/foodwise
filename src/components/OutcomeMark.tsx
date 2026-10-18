import Image from "next/image";
import type { VerdictStatus } from "@/lib/types";

const MARKS = {
  safe: { src: "/outcomes/safe.png", alt: "Safe for you", width: 698, height: 819 },
  caution: {
    src: "/outcomes/caution.png",
    alt: "Check with caution",
    width: 698,
    height: 809,
  },
  contains: {
    src: "/outcomes/contains.png",
    alt: "Contains your allergen",
    width: 759,
    height: 819,
  },
} as const;

function markFor(status: VerdictStatus) {
  if (status === "PASS") return MARKS.safe;
  if (status === "CONTAINS_ALLERGEN") return MARKS.contains;
  return MARKS.caution;
}

export function OutcomeMark({
  status,
  className = "w-[142px]",
}: {
  status: VerdictStatus;
  className?: string;
}) {
  return (
    <span className={`inline-flex shrink-0 rounded-[16px] bg-[#fbf8f2] p-1.5 ${className}`}>
      <Image {...markFor(status)} className="h-auto w-full" />
    </span>
  );
}
