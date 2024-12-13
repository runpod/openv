import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
	try {
		console.log("GET /api/videos: Starting request");

		const session = await auth();
		console.log("GET /api/videos: Auth session:", { userId: session?.userId });

		const userId = session?.userId;
		if (!userId) {
			console.log("GET /api/videos: No userId found");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		console.log("GET /api/videos: Attempting database query for userId:", userId);
		const videos = await prisma.video.findMany({
			where: {
				userId,
			},
			select: {
				id: true,
				userId: true,
				createdAt: true,
				frames: true,
				status: true,
				url: true,
				prompt: true,
				jobId: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		console.log("GET /api/videos: Successfully retrieved videos:", videos.length);

		console.log(videos);

		return NextResponse.json(videos);
	} catch (error) {
		console.log("GET /api/videos: Detailed error:", {
			name: error.name,
			message: error.message,
			stack: error.stack,
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

		const body = await request.json();
		const { id } = body;

		if (!id || typeof id !== "number") {
			return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
		}

		const video = await prisma.video.findUnique({
			where: { id },
		});

		if (!video) {
			return NextResponse.json({ error: "Video not found" }, { status: 404 });
		}

		if (video.userId !== userId) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		await prisma.video.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error in DELETE /api/videos:", error);

		// Handle JSON parse errors
		if (error instanceof SyntaxError) {
			return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
		}

		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
