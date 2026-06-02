-- Store policy attachment as a relative path on disk instead of a URL/blob.
ALTER TABLE "policies" ADD COLUMN "attachmentPath" TEXT;
