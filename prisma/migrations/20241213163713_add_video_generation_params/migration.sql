-- AlterTable
ALTER TABLE "video" ADD COLUMN     "cfg" DOUBLE PRECISION,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "negativePrompt" TEXT,
ADD COLUMN     "seed" INTEGER,
ADD COLUMN     "steps" INTEGER,
ADD COLUMN     "width" INTEGER;
