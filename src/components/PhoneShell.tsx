import type { ReactNode } from "react";

/* The prototype runs in a browser, so the phone frame sets expectations:
   this is an app screen, not a responsive web page. */
export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-forest-deep p-0 sm:p-6">
      <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-paper text-ink sm:h-[min(880px,calc(100dvh-3rem))] sm:rounded-[36px] sm:shadow-[var(--shadow)]">
        <span className="grain" aria-hidden />
        {children}
      </div>
    </div>
  );
}
