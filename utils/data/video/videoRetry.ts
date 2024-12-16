import type { video } from "@prisma/client";

import prisma from "@/lib/prisma";

import { videoSubmit } from "./videoSubmit";

// Helper to determine if error is retryable
export function isRetryableError(error?: string | null): boolean {
	if (!error) return false;

	// Add known retryable error messages
	const retryableErrors = [
		"timeout",
		"connection failed",
		"server error",
		"internal error",
		"503",
		"500",
	];

	return retryableErrors.some(e => error.toLowerCase().includes(e));
}

export const MAX_RETRIES = 2;

export async function handleVideoRetry(video: video) {
	if (
		video.status === "failed" &&
		video.retryCount < MAX_RETRIES &&
		isRetryableError(video.error)
	) {
		// Reset status and increment retry counter
		await prisma.video.update({
			where: { id: video.id },
			data: {
				status: "queued",
				error: null,
				retryCount: video.retryCount + 1,
				updatedAt: new Date(),
			},
		});

		// Submit job using the helper
		const { error } = await videoSubmit({ video, isRetry: true });
		if (error) {
			console.error("Failed to trigger retry for video:", video.id, error);
		}
	}
}
