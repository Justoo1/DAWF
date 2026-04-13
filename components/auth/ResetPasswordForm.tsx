"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
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
import { authClient } from "@/lib/auth-client";

function ResetPasswordFormInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Invalid link",
        description: "Request a new reset email from the sign-in page.",
        variant: "destructive",
      });
      return;
    }
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
    setBusy(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (error) {
        toast({
          title: "Could not reset password",
          description:
            error.message ||
            "The link may have expired. Request a new one from sign in.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Password updated",
        description: "You can sign in with your email and new password.",
      });
      window.location.assign("/sign-in");
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  if (errorParam) {
    return (
      <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Link not valid</CardTitle>
          <p className="text-white/70 text-sm pt-2">
            This reset link is invalid or expired. Request a new one from the
            sign-in page.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            className="w-full h-12 bg-white text-[#121212] hover:bg-white/90 rounded-xl font-semibold"
          >
            <Link href="/forgot-password">Request new link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Missing token</CardTitle>
          <p className="text-white/70 text-sm pt-2">
            Open the link from your email, or request a new reset from sign in.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            className="w-full h-12 bg-white text-[#121212] hover:bg-white/90 rounded-xl font-semibold"
          >
            <Link href="/forgot-password">Forgot password</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
      <CardHeader className="space-y-4 pb-8">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Choose a new password
        </CardTitle>
        <p className="text-white/70 text-base">
          Enter and confirm your new password for DEVOPS AFRICA.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="reset-password" className="text-sm font-medium text-white/90">
              New password
            </label>
            <PasswordInput
              id="reset-password"
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
              htmlFor="reset-password-confirm"
              className="text-sm font-medium text-white/90"
            >
              Confirm password
            </label>
            <PasswordInput
              id="reset-password-confirm"
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
              busy ||
              !passwordMeetsPolicy(password) ||
              password !== confirm
            }
            className="w-full h-12 bg-white text-[#121212] hover:bg-white/90 rounded-xl font-semibold"
          >
            {busy ? "Saving…" : "Update password"}
          </Button>
          <p className="text-sm text-white/60">
            <Link href="/sign-in" className="text-white underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
          <p className="text-white/70 text-sm">Loading…</p>
        </Card>
      }
    >
      <ResetPasswordFormInner />
    </Suspense>
  );
}
