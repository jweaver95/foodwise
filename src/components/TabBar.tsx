"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Scan, Users } from "@phosphor-icons/react/dist/ssr";

const TABS = [
  { href: "/home", label: "Today", Icon: House },
  { href: "/scan", label: "Scan", Icon: Scan, primary: true },
  { href: "/household", label: "People", Icon: Users },
] as const;

export function TabBar() {
  const path = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4 pt-2"
    >
      <div className="flex items-end justify-between rounded-[28px] bg-surface/92 px-3 py-2 shadow-[var(--shadow-card)] ring-1 ring-ink/6 backdrop-blur-xl">
        {TABS.map((tab) => {
          const { href, label, Icon } = tab;
          const primary = "primary" in tab && tab.primary;
          const active = path === href || path.startsWith(`${href}/`);
          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="-mt-7 flex size-[68px] flex-col items-center justify-center rounded-full bg-forest text-white shadow-[0_12px_24px_rgb(31_92_69/0.35)] transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96]"
              >
                <Icon size={26} weight="light" />
                <span className="sr-only">{label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[52px] min-w-[72px] flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold ${
                active ? "text-forest" : "text-ink-muted"
              }`}
            >
              <Icon size={22} weight={active ? "fill" : "regular"} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const tabbed = path === "/home" || path === "/household" || path === "/settings";

  return (
    <>
      <div
        className={`flex min-h-0 flex-1 flex-col ${tabbed ? "pb-[92px]" : ""}`}
      >
        {children}
      </div>
      {tabbed ? <TabBar /> : null}
    </>
  );
}
