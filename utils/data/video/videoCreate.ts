import prisma from "@/lib/prisma";

interface CreateVideoParams {
	userId: string;
	prompt: string;
	modelName?: string;
	frames?: number;
	negativePrompt?: string;
	width?: number;
	height?: number;
	seed?: number;
	steps?: number;
	cfg?: number;
}

export async function createVideo({
	userId,
	prompt,
	modelName,
	frames,
	negativePrompt,
	width,
	height,
	seed,
	steps,
	cfg,
}: CreateVideoParams) {
	try {
		const video = await prisma.video.create({
			data: {
				userId,
				prompt,
				modelName,
				frames,
				status: "queued",
				negativePrompt,
				width,
				height,
				seed,
				steps,
				cfg,
			},
		});

		return { video, error: null };
	} catch (error) {
		console.error("Error creating video:", error);
		return {
			video: null,
			error: error instanceof Error ? error.message : "Failed to create video",
		};
	}
}

export async function updateVideoJobId(videoId: number, jobId: string) {
	try {
		const video = await prisma.video.update({
			where: { id: videoId },
			data: { jobId },
		});

		return { video, error: null };
	} catch (error) {
		console.error("Error updating video job ID:", error);
		return {
			video: null,
			error: error instanceof Error ? error.message : "Failed to update video job ID",
		};
	}
}
