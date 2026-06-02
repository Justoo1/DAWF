-- Step 1: Create the food_vendor_items junction table
CREATE TABLE "food_vendor_items" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "food_vendor_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "food_vendor_items_foodId_vendorId_key" ON "food_vendor_items"("foodId", "vendorId");
CREATE INDEX "food_vendor_items_vendorId_idx" ON "food_vendor_items"("vendorId");
ALTER TABLE "food_vendor_items" ADD CONSTRAINT "food_vendor_items_foodId_fkey"
    FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_vendor_items" ADD CONSTRAINT "food_vendor_items_vendorId_fkey"
    FOREIGN KEY ("vendorId") REFERENCES "food_vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 2: Migrate existing food-vendor assignments and prices into the junction table
INSERT INTO "food_vendor_items" ("id", "foodId", "vendorId", "price", "isActive", "createdAt")
SELECT
    replace(gen_random_uuid()::text, '-', ''),
    "id",
    "vendorId",
    "price",
    "isActive",
    "createdAt"
FROM "foods"
WHERE "vendorId" IS NOT NULL;

-- Step 3: Add unique constraint on food name (catalog-level)
ALTER TABLE "foods" ADD CONSTRAINT "foods_name_key" UNIQUE ("name");

-- Step 4: Drop the old vendorId FK, vendorId column, and price column from foods
ALTER TABLE "foods" DROP CONSTRAINT IF EXISTS "foods_vendorId_fkey";
DROP INDEX IF EXISTS "foods_vendorId_idx";
ALTER TABLE "foods" DROP COLUMN IF EXISTS "vendorId";
ALTER TABLE "foods" DROP COLUMN IF EXISTS "price";
