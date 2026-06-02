-- Change capacity from integer to text to support ranges like "1-4".
ALTER TABLE "conference_rooms" ALTER COLUMN "capacity" TYPE TEXT;
