import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth, requireAuth } from "@/lib/auth";
import { getMonthlyQuota } from "@/lib/monthly-limit";
import prisma from "@/lib/prisma";
import { handleVideoRetry } from "@/utils/data/video/videoRetry";

export async function GET(request: Request) {
	try {
		const authResult = await auth();
		if (!authResult?.userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
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

		const where: Prisma.videoWhereInput = {
			userId,
			...(updatedSinceDate && {
				updatedAt: {
					gt: updatedSinceDate,
				},
			}),
		};

		const videos = await prisma.video.findMany({
			where,
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
			orderBy: {
				createdAt: "desc",
			},
		});

		// Get current monthly quota
		const monthlyQuota = await getMonthlyQuota(userId);

		// Check for failed videos that need retry
		for (const video of videos) {
			await handleVideoRetry(video);
		}

		return NextResponse.json({
			videos,
			monthlyQuota,
		});
	} catch (error: any) {
		console.error("Error fetching videos:", error);
		return NextResponse.json(
			{ error: error?.message || "Internal server error" },
			{ status: error?.status || 500 }
		);
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
				userId: userId as string, // Type assertion since we know userId is not null after requireAuth
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
