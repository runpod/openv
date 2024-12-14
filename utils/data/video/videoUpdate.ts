import { PrismaClient } from "@prisma/client";

import prisma from "@/lib/prisma";

interface VideoUpdateParams {
	jobId: string;
	status?: string;
	url?: string;
	error?: string;
}

export async function videoUpdate(params: VideoUpdateParams, prismaClient: PrismaClient = prisma) {
	const { jobId, status, url, error: errorMessage } = params;

	try {
		if (!jobId) {
			throw new Error("jobId is required");
		}

		// Create update data object only with defined values
		const updateData: any = {
			updatedAt: new Date(),
		};

		if (status) updateData.status = status;
		if (url) updateData.url = url;
		if (errorMessage) updateData.error = errorMessage;

		const video = await prismaClient.video.update({
			where: { jobId },
			data: updateData,
		});

		return { video, error: null };
	} catch (error) {
		return {
			video: null,
			error: error instanceof Error ? error.message : "Failed to update video",
		};
	}
}
