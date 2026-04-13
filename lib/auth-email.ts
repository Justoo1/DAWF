import { sendEmail } from "@/lib/email";

export function employeeVerificationEmailHtml(displayName: string, verifyUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Hi ${displayName},</p>
  <p>Your DAWF account has been created by an administrator. Please verify your email to activate your account:</p>
  <p><a href="${verifyUrl}" style="color: #146C43; font-weight: 600;">Verify my email</a></p>
  <p>If you did not expect this message, you can ignore it.</p>
</body>
</html>`;
}

/** Fire-and-forget friendly: await is optional per Better Auth guidance. */
export async function sendEmployeeVerificationEmail(
  to: string,
  displayName: string,
  verifyUrl: string
) {
  return sendEmail({
    to,
    subject: "Verify your DAWF account",
    html: employeeVerificationEmailHtml(displayName || to, verifyUrl),
  });
}

export function passwordResetEmailHtml(displayName: string, resetUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Hi ${displayName},</p>
  <p>We received a request to reset your DAWF password. Use the link below to choose a new password:</p>
  <p><a href="${resetUrl}" style="color: #146C43; font-weight: 600;">Reset my password</a></p>
  <p>If you did not request this, you can ignore this email.</p>
</body>
</html>`;
}

export async function sendPasswordResetEmail(
  to: string,
  displayName: string,
  resetUrl: string
) {
  return sendEmail({
    to,
    subject: "Reset your DAWF password",
    html: passwordResetEmailHtml(displayName || to, resetUrl),
  });
}
