"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordResetForEmail } from "@/lib/actions/auth-login.action";

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await requestPasswordResetForEmail(email);
      setSent(true);
      toast({
        title: "Check your email",
        description:
          "If this address is in our system, we sent a link to reset your password.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
      <CardHeader className="space-y-4 pb-8">
        <CardTitle className="text-3xl font-bold tracking-tight">
          Forgot password
        </CardTitle>
        <p className="text-white/70 text-base">
          Enter your work email. If you have an account, we will send you a link
          to set a new password.
        </p>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-6">
            <p className="text-white/90 text-sm">
              If an account exists for that email, you will receive a message
              shortly. You can close this tab or return to sign in.
            </p>
            <Button
              asChild
              className="w-full h-12 bg-white text-[#121212] hover:bg-white/90 rounded-xl font-semibold"
            >
              <Link href="/sign-in">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="forgot-email" className="text-sm font-medium text-white/90">
                Email
              </label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={busy || !email.trim()}
              className="w-full h-12 bg-white text-[#121212] hover:bg-white/90 rounded-xl font-semibold"
            >
              {busy ? "Sending…" : "Send reset link"}
            </Button>
            <p className="text-sm text-white/60">
              <Link href="/sign-in" className="text-white underline-offset-4 hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
