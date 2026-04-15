"use server";

/**
 * Google-only authentication: email/password and reset flows are disabled.
 * This module is kept so legacy imports do not break; callers should use Google sign-in.
 */

export async function requestPasswordResetForEmail(_email: string) {
  return { ok: true as const };
}

export async function submitInitialPasswordChange(_newPassword: string) {
  void _newPassword;
  return {
    success: false,
    error: "Password sign-in is disabled. Use Google sign-in.",
  };
}
