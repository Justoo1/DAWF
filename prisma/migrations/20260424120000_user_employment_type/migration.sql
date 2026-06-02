-- Add EmploymentType enum and column to users.
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'CONTRACT');
ALTER TABLE "users" ADD COLUMN "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME';
