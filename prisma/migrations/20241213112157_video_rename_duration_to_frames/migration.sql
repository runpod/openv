/*
  Warnings:

  - You are about to drop the column `duration` on the `video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "video" DROP COLUMN "duration",
ADD COLUMN     "frames" INTEGER;
