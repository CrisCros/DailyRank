-- CreateEnum
CREATE TYPE "PostMood" AS ENUM ('HAPPY', 'TIRED', 'PRODUCTIVE', 'STRESSED', 'CALM', 'MOTIVATED', 'BAD_DAY', 'NORMAL_DAY');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PRIVATE', 'FRIENDS', 'PUBLIC');

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "mood" "PostMood",
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PRIVATE',
    "photoUrl" VARCHAR(2048),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_userId_date_key" ON "Post"("userId", "date");

-- CreateIndex
CREATE INDEX "Post_date_idx" ON "Post"("date");

-- CreateIndex
CREATE INDEX "Post_visibility_idx" ON "Post"("visibility");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
