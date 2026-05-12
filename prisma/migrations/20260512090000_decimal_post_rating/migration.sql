-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "rating" TYPE DECIMAL(4,2) USING "rating"::DECIMAL(4,2);
