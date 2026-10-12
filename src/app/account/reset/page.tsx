"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button, ButtonLink, Disclaimer, Screen, ScreenBody, ScreenFooter } from "@/components/ui";
import { TextField } from "@/components/pickers";
import { updatePassword } from "@/lib/account";
import { useHousehold } from "@/context/HouseholdContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { ready, source, onboarded } = useHousehold();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const signedIn = ready && source === "account";

  const submit = async () => {
    setMessage(null);
    if (password !== confirm) {
      setMessage("Those passwords don't match.");
      return;
    }
    setPending(true);
    try {
      await updatePassword(password);
      router.replace(onboarded ? "/home" : "/onboarding");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The new password could not be saved.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader back />
      <ScreenBody>
        <h1 className="text-[30px] font-bold leading-tight tracking-[-0.03em]">
          Choose a new password
        </h1>
        {!ready ? (
          <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-ink-muted">
            Opening the reset link…
          </p>
        ) : signedIn ? (
          <>
            <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-ink-muted">
              This link signed you in long enough to replace the password. Choose
              at least 8 characters, then you&apos;ll continue into the household.
            </p>
            <div className="mt-8 space-y-5">
              <TextField
                label="New password"
                type="password"
                autoComplete="new-password"
                hint="At least 8 characters."
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />
              <TextField
                label="Confirm the new password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={setConfirm}
                placeholder="••••••••"
              />
            </div>
          </>
        ) : (
          <div className="mt-3 max-w-[38ch] space-y-3 text-[15px] leading-relaxed text-ink-muted">
            <p>This reset link is missing, expired, or was already used.</p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Go back to Save your household.</li>
              <li>Choose I already have an account.</li>
              <li>Choose Forgot your password?</li>
              <li>Enter the email and open the new link on this phone.</li>
            </ol>
          </div>
        )}
        {message ? (
          <p className="mt-5 text-[14px] leading-relaxed text-ink">{message}</p>
        ) : null}
      </ScreenBody>
      <ScreenFooter>
        <div className="space-y-3">
          {signedIn ? (
            <Button
              disabled={!ready || pending || password.length < 8 || confirm.length < 8}
              onClick={() => void submit()}
            >
              {pending ? "Working…" : "Save the new password"}
            </Button>
          ) : ready ? (
            <ButtonLink href="/account">Back to your account</ButtonLink>
          ) : null}
          <Disclaimer />
        </div>
      </ScreenFooter>
    </Screen>
  );
}
