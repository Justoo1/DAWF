-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_name_key" ON "clients"("name");

-- AlterTable: add columns as nullable / with defaults first
ALTER TABLE "users" ADD COLUMN "firstName" TEXT;
ALTER TABLE "users" ADD COLUMN "lastName" TEXT;
ALTER TABLE "users" ADD COLUMN "phoneNumber" TEXT;
ALTER TABLE "users" ADD COLUMN "pendingInvite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "clientId" TEXT;

-- Seed default client for existing employees
INSERT INTO "clients" ("id", "name", "isActive", "createdAt", "updatedAt")
VALUES ('cmigrationdefaultclient', 'Default', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Backfill user profile fields
UPDATE "users" SET "firstName" = COALESCE(NULLIF(TRIM("name"), ''), 'Employee') WHERE "firstName" IS NULL;
UPDATE "users" SET "lastName" = '' WHERE "lastName" IS NULL;
UPDATE "users" SET "phoneNumber" = '' WHERE "phoneNumber" IS NULL;
UPDATE "users" SET "clientId" = 'cmigrationdefaultclient' WHERE "clientId" IS NULL;

-- Enforce NOT NULL on new columns
ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "clientId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "users_clientId_idx" ON "users"("clientId");
