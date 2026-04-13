"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function SetPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    void authClient.getSession().then((s) => {
      if (!s.data?.user) {
        router.replace("/sign-in");
      }
      setChecking(false);
    });
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
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    setPending(true);
    try {
      const { error } = await authClient.$fetch("/set-password", {
        method: "POST",
        body: { newPassword: password },
      });
      if (error) {
        toast({
          title: "Could not set password",
          description:
            error.message ||
            "Try again or use Forgot password from sign-in.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Password saved",
        description: "You can continue to your account.",
      });
      router.replace("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not set password";
      toast({
        title: "Error",
        description: msg,
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
          Set your password
        </CardTitle>
        <p className="text-white/70 text-base">
          Choose a password to finish activating your account. You will use it
          with your work email to sign in.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium text-white/90">
              Password
            </label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium text-white/90">
              Confirm password
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              required
              minLength={8}
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full h-12 bg-white text-[#121212] hover:bg-white/90 rounded-xl font-semibold"
          >
            {pending ? "Saving…" : "Save password"}
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
