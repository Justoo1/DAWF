-- Idempotent: tolerates existing "clients" / profile columns (e.g. prior db push).

CREATE TABLE IF NOT EXISTS "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "clients_name_key" ON "clients"("name");

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pendingInvite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clientId" TEXT;

INSERT INTO "clients" ("id", "name", "isActive", "createdAt", "updatedAt")
VALUES ('cmigrationdefaultclient', 'Default', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

UPDATE "users" SET "firstName" = COALESCE(NULLIF(TRIM("name"), ''), 'Employee') WHERE "firstName" IS NULL;
UPDATE "users" SET "lastName" = '' WHERE "lastName" IS NULL;
UPDATE "users" SET "phoneNumber" = '' WHERE "phoneNumber" IS NULL;
UPDATE "users" SET "clientId" = 'cmigrationdefaultclient' WHERE "clientId" IS NULL;

ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "clientId" SET NOT NULL;

DO $$
BEGIN
    ALTER TABLE "users" ADD CONSTRAINT "users_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "users_clientId_idx" ON "users"("clientId");
