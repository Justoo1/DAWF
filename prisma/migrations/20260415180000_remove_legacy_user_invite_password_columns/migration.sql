-- Remove legacy invite / password columns (Google-only auth).
-- Anyone still flagged pending invite can sign in once emailVerified is true.
UPDATE "users" SET "emailVerified" = true WHERE "pendingInvite" = true;

ALTER TABLE "users" DROP COLUMN IF EXISTS "verification_email_password_plain";
ALTER TABLE "users" DROP COLUMN IF EXISTS "mustChangePassword";
ALTER TABLE "users" DROP COLUMN IF EXISTS "pendingInvite";
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";
