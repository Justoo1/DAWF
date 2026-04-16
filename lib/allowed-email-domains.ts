const ALLOWED_WORK_EMAIL_DOMAINS = ["devopsafricalimited.com", "purplewave.com"] as const;

export function getAllowedWorkEmailDomains(): readonly string[] {
  return ALLOWED_WORK_EMAIL_DOMAINS;
}

export function isAllowedWorkEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at === -1 || at === normalized.length - 1) return false;
  const domain = normalized.slice(at + 1);
  return ALLOWED_WORK_EMAIL_DOMAINS.includes(domain as (typeof ALLOWED_WORK_EMAIL_DOMAINS)[number]);
}

export function allowedWorkEmailMessage(): string {
  return `Only ${ALLOWED_WORK_EMAIL_DOMAINS.map((d) => `@${d}`).join(" and ")} accounts can sign in.`;
}

