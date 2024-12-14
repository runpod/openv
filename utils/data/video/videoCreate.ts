import prisma from "@/lib/prisma";

interface VideoCreateParams {
	jobId: string;
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

export async function videoCreate({
	jobId,
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
}: VideoCreateParams) {
	try {
		const video = await prisma.video.create({
			data: {
				jobId,
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
				status: "queued",
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
