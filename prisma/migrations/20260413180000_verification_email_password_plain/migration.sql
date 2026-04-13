-- One-time plain password for the verification email only; cleared after send.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_email_password_plain" TEXT;
