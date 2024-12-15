import { NextResponse } from "next/server";

import { auth, requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
			},
		});

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
