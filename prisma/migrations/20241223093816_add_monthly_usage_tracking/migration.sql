-- AlterTable
ALTER TABLE "user" ADD COLUMN     "monthlyUsage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlyUsageLastReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;