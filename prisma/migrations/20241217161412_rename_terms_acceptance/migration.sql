/*
  Warnings:

  - You are about to drop the `TermsAcceptance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TermsAcceptance";

-- CreateTable
CREATE TABLE "terms_acceptance" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "terms_acceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "terms_acceptance_userId_idx" ON "terms_acceptance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "terms_acceptance_userId_version_key" ON "terms_acceptance"("userId", "version");
