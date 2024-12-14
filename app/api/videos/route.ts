import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: Request) {
	const session = await auth();
	const userId = session?.userId;
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
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

		return NextResponse.json(videos);
	} catch (error: any) {
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
