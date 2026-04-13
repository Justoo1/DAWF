"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { getEmailLoginState } from "@/lib/actions/auth-login.action";
import { AlertCircle } from "lucide-react";

type Step = "email" | "password";

const AUTH_ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  token_expired: {
    title: "Link expired",
    body: "Your verification or reset link has expired. Ask your administrator to resend the verification email.",
  },
  invalid_token: {
    title: "Invalid link",
    body: "This link is not valid or has already been used. Try signing in, or ask your administrator to resend the verification email.",
  },
  expired_token: {
    title: "Link expired",
    body: "This link has expired. Ask your administrator to resend the verification email.",
  },
};

const Login = () => {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const authErrorInfo = errorCode
    ? (AUTH_ERROR_MESSAGES[errorCode] ?? {
        title: "Something went wrong",
        body: "We could not complete that action from the link. Try signing in again or contact your administrator.",
      })
    : null;

  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [inlineHint, setInlineHint] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in with Google";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleContinueEmail = async () => {
    setInlineHint(null);
    setBusy(true);
    try {
      const state = await getEmailLoginState(email);
      switch (state.status) {
        case "invalid_email":
          toast({
            title: "Invalid email",
            description: "Enter a valid work email address.",
            variant: "destructive",
          });
          break;
        case "not_provisioned":
          setInlineHint(
            "No account exists for this email. Ask your administrator to add you."
          );
          break;
        case "account_disabled":
          setInlineHint(
            "This account has been disabled. Contact your administrator if you need access."
          );
          break;
        case "needs_verification":
          setInlineHint(
            "Verify your email first. Check your inbox for the invitation link, or ask your admin to resend it."
          );
          break;
        case "needs_password_setup":
          setInlineHint(
            "You have not set a password yet. Open the link in your verification email to choose a password, or use Forgot password to get a setup link."
          );
          break;
        case "ready":
          setStep("password");
          setPassword("");
          break;
        default:
          break;
      }
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/sign-in",
      });
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message || "Check your password and try again.",
          variant: "destructive",
        });
        return;
      }
      window.location.assign("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign in failed. Try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40";

  return (
    <Card className="w-full max-w-md border-none bg-[#146C43] text-white shadow-2xl rounded-3xl overflow-hidden p-4 md:p-8">
      <CardHeader className="space-y-4 pb-8">
        <CardTitle className="text-4xl font-bold tracking-tight">
          Sign In to DEVOPS AFRICA
        </CardTitle>
        <p className="text-white/70 text-base">
          Welcome to DEVOPS AFRICA, kindly sign in to continue
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {authErrorInfo ? (
          <div
            role="alert"
            className="flex gap-3 rounded-xl border border-amber-200/40 bg-black/25 px-4 py-3 text-left text-sm text-amber-50"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-200" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold text-white">{authErrorInfo.title}</p>
              <p className="text-white/85 leading-snug">{authErrorInfo.body}</p>
            </div>
          </div>
        ) : null}
        <Button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full h-14 bg-white text-[#121212] hover:bg-white/90 transition-all rounded-xl flex items-center justify-center gap-3 font-semibold text-base shadow-sm"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full h-px bg-white/15" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest">
            <span className="bg-[#146C43] px-3 text-white/50">or email</span>
          </div>
        </div>

        {step === "email" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium text-white/90">
                Work email
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>
            {inlineHint ? (
              <p className="text-sm text-amber-100/95 bg-black/20 rounded-lg p-3 border border-white/10">
                {inlineHint}
              </p>
            ) : null}
            <Button
              type="button"
              onClick={handleContinueEmail}
              disabled={busy || !email.trim()}
              className="w-full h-12 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl font-semibold"
            >
              {busy ? "Checking…" : "Continue"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-white/80 truncate">{email}</span>
              <button
                type="button"
                className="text-white/90 underline shrink-0"
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setInlineHint(null);
                }}
              >
                Change
              </button>
            </div>
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium text-white/90">
                Password
              </label>
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                toggleButtonClassName="text-white/70 hover:bg-white/10 hover:text-white focus-visible:ring-white/30"
              />
            </div>
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-white/80 hover:text-white underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={busy || !password}
              className="w-full h-12 bg-white text-[#121212] hover:bg-white/90 rounded-xl font-semibold"
            >
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default Login;
