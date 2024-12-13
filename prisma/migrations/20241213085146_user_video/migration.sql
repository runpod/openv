-- CreateTable
CREATE TABLE "video" (
    "id" SERIAL NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modelName" TEXT,
    "duration" INTEGER,
    "downloadUrl" TEXT,
    "error" TEXT,

    CONSTRAINT "video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_jobId_key" ON "video"("jobId");

-- CreateIndex
CREATE INDEX "video_userId_idx" ON "video"("userId");

-- CreateIndex
CREATE INDEX "video_status_idx" ON "video"("status");

-- CreateIndex
CREATE INDEX "video_createdAt_idx" ON "video"("createdAt");
