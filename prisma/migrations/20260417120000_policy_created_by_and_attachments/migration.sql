-- Add createdBy and attachment metadata columns to policies.
ALTER TABLE "policies" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "policies" ADD COLUMN "attachmentName" TEXT;
ALTER TABLE "policies" ADD COLUMN "attachmentMime" TEXT;
