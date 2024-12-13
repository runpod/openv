/*
  Warnings:

  - You are about to drop the column `downloadUrl` on the `video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "video" DROP COLUMN "downloadUrl",
ADD COLUMN     "url" TEXT;
