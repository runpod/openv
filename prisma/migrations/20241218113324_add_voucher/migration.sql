-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'restricted',
ADD COLUMN     "voucher_used" TEXT,
ADD COLUMN     "voucher_used_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "voucher" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voucher_code_key" ON "voucher"("code");

-- CreateIndex
CREATE INDEX "voucher_code_idx" ON "voucher"("code");
