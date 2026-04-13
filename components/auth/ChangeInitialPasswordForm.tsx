"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordRequirementsHints } from "@/components/auth/PasswordRequirementsHints";
import {
  getPasswordPolicyFailureMessage,
  passwordMeetsPolicy,
} from "@/lib/password-policy";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAccountGateState } from "@/lib/account-gate-client";
import { submitInitialPasswordChange } from "@/lib/actions/auth-login.action";

export function ChangeInitialPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void (async () => {
      const session = await authClient.getSession();
      if (!session.data?.user) {
        router.replace("/sign-in");
        return;
      }
      const gate = await fetchAccountGateState();
      if (gate.authenticated && !gate.mustChangePassword) {
        router.replace("/dawf");
        return;
      }
      setChecking(false);
    })();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (!passwordMeetsPolicy(password)) {
      toast({
        title: "Password requirements not met",
        description: getPasswordPolicyFailureMessage(password),
        variant: "destructive",
      });
      return;
    }
    setPending(true);
    try {
      const result = await submitInitialPasswordChange(password);
      if (!result.success) {
        toast({
          title: "Could not update password",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Password updated",
        description: "You can continue using DEVOPS AFRICA.",
      });
      window.location.assign("/dawf");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  if (checking) {
    return (
      <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
        <p className="text-white/70 text-sm">Loading…</p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
      <CardHeader className="space-y-4 pb-8">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Choose your new password
        </CardTitle>
        <p className="text-white/70 text-base">
          Your administrator gave you a temporary sign-in password. Set a new
          password you will use from now on.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="choose-password"
              className="text-sm font-medium text-white/90"
            >
              New password
            </label>
            <PasswordInput
              id="choose-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              toggleButtonClassName="text-white/70 hover:bg-white/10 hover:text-white focus-visible:ring-white/30"
              required
              minLength={8}
              maxLength={128}
            />
            <PasswordRequirementsHints password={password} variant="auth" />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="choose-password-confirm"
              className="text-sm font-medium text-white/90"
            >
              Confirm new password
            </label>
            <PasswordInput
              id="choose-password-confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              toggleButtonClassName="text-white/70 hover:bg-white/10 hover:text-white focus-visible:ring-white/30"
              required
              minLength={8}
              maxLength={128}
            />
            {confirm.length > 0 ? (
              <p
                className={cn(
                  "text-xs",
                  password === confirm
                    ? "text-emerald-300"
                    : "text-amber-200/90"
                )}
              >
                {password === confirm
                  ? "Passwords match."
                  : "Passwords do not match yet."}
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={
              pending ||
              !passwordMeetsPolicy(password) ||
              password !== confirm
            }
            className="w-full h-12 bg-white text-[#121212] hover:bg-white/90 rounded-xl font-semibold"
          >
            {pending ? "Saving…" : "Save new password"}
          </Button>
          <p className="text-sm text-white/60">
            <button
              type="button"
              className="text-white underline-offset-4 hover:underline"
              onClick={async () => {
                await authClient.signOut();
                router.push("/sign-in");
              }}
            >
              Sign out
            </button>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
