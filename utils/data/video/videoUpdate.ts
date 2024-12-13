import { PrismaClient } from "@prisma/client";

// Create a default prisma instance
const defaultPrisma = new PrismaClient();

interface VideoUpdateParams {
	jobId: string;
	status?: string;
	url?: string;
	error?: string;
}

export async function videoUpdate(
	params: VideoUpdateParams,
	prismaClient: PrismaClient = defaultPrisma
) {
	const { jobId, status, url, error: errorMessage } = params;

	console.log("videoUpdate: Starting update with params:", {
		jobId,
		status,
		url,
		error: errorMessage,
	});

	try {
		if (!jobId) {
			console.error("videoUpdate: Missing jobId");
			throw new Error("jobId is required");
		}

		// Create update data object only with defined values
		const updateData: any = {
			updatedAt: new Date(),
		};

		if (status) updateData.status = status;
		if (url) updateData.url = url;
		if (errorMessage) updateData.error = errorMessage;

		console.log("videoUpdate: Attempting database update with data:", {
			where: { jobId },
			updateData,
		});

		const video = await prismaClient.video.update({
			where: { jobId },
			data: updateData,
		});

		console.log("videoUpdate: Successfully updated video:", video);
		return { video, error: null };
	} catch (error) {
		console.error("videoUpdate: Error details:", {
			name: error instanceof Error ? error.name : "Unknown",
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			params,
		});

		return {
			video: null,
			error: error instanceof Error ? error.message : "Failed to update video",
		};
	}
}
