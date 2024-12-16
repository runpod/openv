import type { video } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth, requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { videoSubmit } from "@/utils/data/video/videoSubmit";

const MAX_RETRIES = 2;

// Helper to determine if error is retryable
function isRetryableError(error?: string | null): boolean {
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

async function handleVideoRetry(video: video) {
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

export async function GET(request: Request) {
	try {
		const authResult = await auth();
		requireAuth(authResult);
		const { userId } = authResult;

		// Parse the updatedSince query parameter
		const url = new URL(request.url);
		const updatedSince = url.searchParams.get("updatedSince");
		let updatedSinceDate: Date | undefined;

		if (updatedSince) {
			try {
				updatedSinceDate = new Date(updatedSince);
				// Check if the date is valid
				if (isNaN(updatedSinceDate.getTime())) {
					return NextResponse.json(
						{ error: "Invalid updatedSince parameter" },
						{ status: 400 }
					);
				}
			} catch (error) {
				return NextResponse.json(
					{ error: "Invalid updatedSince parameter" },
					{ status: 400 }
				);
			}
		}

		const videos = await prisma.video.findMany({
			where: {
				userId,
				...(updatedSinceDate && {
					updatedAt: {
						gt: updatedSinceDate,
					},
				}),
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				jobId: true,
				userId: true,
				prompt: true,
				status: true,
				url: true,
				frames: true,
				createdAt: true,
				updatedAt: true,
				error: true,
				retryCount: true,
				modelName: true,
				negativePrompt: true,
				width: true,
				height: true,
				seed: true,
				steps: true,
				cfg: true,
			},
		});

		// Check for failed videos that need retry
		for (const video of videos) {
			await handleVideoRetry(video);
		}

		return NextResponse.json(videos);
	} catch (error: any) {
		if (error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("Error in GET /api/videos:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		const authResult = await auth();
		requireAuth(authResult);
		const { userId } = authResult;

		// Parse request body
		let body;
		try {
			body = await request.json();
		} catch (error) {
			return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
		}

		const { jobIds } = body;
		if (!jobIds || !Array.isArray(jobIds)) {
			return NextResponse.json({ error: "Invalid jobIds" }, { status: 400 });
		}

		// Delete videos
		await prisma.video.deleteMany({
			where: {
				jobId: {
					in: jobIds,
				},
				userId,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		if (error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("Error in DELETE /api/videos:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
