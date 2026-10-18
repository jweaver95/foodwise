import Image from "next/image";

/* The scan lens from the Foodwise mark. The dark tile keeps it readable on a photo or a verdict color. */
export function ScanMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-[#12403d] ${className}`}
    >
      <Image
        src="/scan-lens-white.png"
        alt=""
        width={51}
        height={51}
        className="size-6"
      />
    </span>
  );
}
