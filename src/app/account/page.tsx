"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button, Disclaimer, Screen, ScreenBody, ScreenFooter } from "@/components/ui";
import { TextField } from "@/components/pickers";
import { bootstrapAccount, signIn, signUp } from "@/lib/account";
import { householdStore } from "@/lib/householdStore";
import { useHousehold } from "@/context/HouseholdContext";

export default function AccountPage() {
  const router = useRouter();
  const { ready, source, onboarded } = useHousehold();

  useEffect(() => {
    if (!ready || source !== "account") return;
    router.replace(onboarded ? "/home" : "/onboarding");
  }, [ready, source, onboarded, router]);
  const [mode, setMode] = useState<"create" | "sign-in">("create");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setMessage(null);
    setPending(true);
    try {
      if (mode === "create") {
        const result = await signUp(email.trim(), password);
        if (!result.session) {
          setMessage("Check your email to confirm the account, then sign in.");
          setMode("sign-in");
          return;
        }
        await bootstrapAccount();
      } else {
        await signIn(email.trim(), password);
      }
      const next = householdStore.getSnapshot();
      router.push(next.onboarded ? "/home" : "/onboarding");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The account request failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader back />
      <ScreenBody>
        <h1 className="text-[30px] font-bold leading-tight tracking-[-0.03em]">
          {mode === "create" ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-ink-muted">
          Your household stays with you, on this phone and the next one. The
          aisle demo is still available from the welcome screen.
        </p>

        <div className="mt-8 space-y-5">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            type="password"
            hint="At least 8 characters."
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />
        </div>

        {message ? (
          <p className="mt-5 text-[14px] leading-relaxed text-ink">{message}</p>
        ) : null}
      </ScreenBody>
      <ScreenFooter>
        <div className="space-y-3">
          <Button
            disabled={!ready || pending || email.trim().length === 0 || password.length < 8}
            onClick={() => void submit()}
          >
            {pending ? "Working…" : mode === "create" ? "Create account" : "Sign in"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setMode((current) => (current === "create" ? "sign-in" : "create"));
              setMessage(null);
            }}
            className="w-full py-2 text-center text-[14px] font-medium text-ink-muted underline decoration-line underline-offset-4"
          >
            {mode === "create" ? "I already have an account" : "Create a new account"}
          </button>
          <Disclaimer />
        </div>
      </ScreenFooter>
    </Screen>
  );
}
