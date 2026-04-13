/** Shared rules for new passwords (sign-up flows, reset, admin-set initial password). */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordRequirementId =
  | "length"
  | "lower"
  | "upper"
  | "digit"
  | "special";

export type PasswordRequirement = {
  id: PasswordRequirementId;
  label: string;
  met: boolean;
};

/**
 * Live checklist for UI. Updates as the user types.
 */
export function getPasswordRequirements(password: string): PasswordRequirement[] {
  const p = password;
  return [
    {
      id: "length",
      label: `${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters`,
      met:
        p.length >= PASSWORD_MIN_LENGTH && p.length <= PASSWORD_MAX_LENGTH,
    },
    {
      id: "lower",
      label: "One lowercase letter (a–z)",
      met: /[a-z]/.test(p),
    },
    {
      id: "upper",
      label: "One uppercase letter (A–Z)",
      met: /[A-Z]/.test(p),
    },
    {
      id: "digit",
      label: "One number (0–9)",
      met: /[0-9]/.test(p),
    },
    {
      id: "special",
      label: "One symbol (e.g. ! @ # $ %)",
      met: /[^A-Za-z0-9]/.test(p),
    },
  ];
}

export function passwordMeetsPolicy(password: string): boolean {
  return getPasswordRequirements(password).every((r) => r.met);
}

/** Short message listing what is still missing (for server errors / toast). */
export function getPasswordPolicyFailureMessage(password: string): string {
  const failed = getPasswordRequirements(password).filter((r) => !r.met);
  if (failed.length === 0) {
    return "Password does not meet requirements.";
  }
  return `Password must include: ${failed.map((f) => f.label).join("; ")}.`;
}
