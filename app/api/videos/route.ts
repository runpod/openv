import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
	console.log("GET /api/videos: Starting request");

	const session = await auth();
	console.log("GET /api/videos: Auth session:", session);

	const userId = session?.userId;
	if (!userId) {
		console.log("GET /api/videos: No userId found");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		console.log("GET /api/videos: Attempting database query for userId:", userId);

		const videos = await prisma.video.findMany({
			where: {
				userId,
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
			},
		});

		console.log("GET /api/videos: Successfully retrieved videos:", videos.length);
		console.log(videos);

		return NextResponse.json(videos);
	} catch (error: any) {
		console.log("GET /api/videos: Detailed error:", {
			name: error?.name,
			message: error?.message,
			stack: error?.stack,
		});
		console.error("Error in GET /api/videos:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		const session = await auth();
		const userId = session?.userId;
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

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
	} catch (error) {
		console.error("Error in DELETE /api/videos:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
