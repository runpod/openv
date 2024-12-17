import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

function verifyToken(request: Request): boolean {
	try {
		const url = new URL(request.url);
		const token = url.searchParams.get("token");
		const webhookToken = process.env.RUNPOD_WEBHOOK_TOKEN;

		if (!webhookToken) {
			console.error("[RunPod Webhook] Missing RUNPOD_WEBHOOK_TOKEN");
			return false;
		}

		return token === webhookToken;
	} catch {
		return false;
	}
}

function mapStatus(status: string): string | null {
	const validStatuses: { [key: string]: string } = {
		IN_QUEUE: "queued",
		QUEUED: "queued",
		IN_PROGRESS: "processing",
		PROCESSING: "processing",
		COMPLETED: "completed",
		DONE: "completed",
		FAILED: "failed",
		CANCELLED: "failed",
		TIMED_OUT: "failed",
	};

	const normalizedStatus = status.toUpperCase();
	return validStatuses[normalizedStatus] || null;
}

export async function POST(request: Request) {
	try {
		// Verify token
		if (!verifyToken(request)) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse body
		const body = await request.json();
		const { id: jobId, status, output } = body;

		if (!jobId) {
			return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
		}

		// Map RunPod status to our status
		const mappedStatus = mapStatus(status);
		if (!mappedStatus) {
			return NextResponse.json({ error: "Invalid status" }, { status: 400 });
		}

		try {
			// First check if video exists
			const existingVideo = await prisma.video.findUnique({
				where: { jobId },
			});

			if (!existingVideo) {
				return NextResponse.json(
					{ error: `Video not found with jobId: ${jobId}` },
					{ status: 404 }
				);
			}

			// Update video in database
			await prisma.video.update({
				where: { jobId },
				data: {
					status: mappedStatus,
					...(output?.result && { url: output.result }),
					...(body.error && { error: body.error }),
				},
			});

			return NextResponse.json({ success: true });
		} catch (dbError) {
			// Handle specific Prisma errors
			if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
				// P2025: Record not found
				if (dbError.code === "P2025") {
					return NextResponse.json(
						{ error: `Video not found with jobId: ${jobId}` },
						{ status: 404 }
					);
				}

				// Handle other Prisma errors with proper status codes
				return NextResponse.json(
					{ error: "Database error", code: dbError.code, details: dbError.message },
					{ status: 400 }
				);
			}

			// Unknown database error
			console.error("[RunPod Webhook] Database error:", dbError);
			return NextResponse.json(
				{ error: "Internal database error", details: String(dbError) },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("[RunPod Webhook] Error processing webhook:", error);
		return NextResponse.json(
			{ error: "Internal server error", details: String(error) },
			{ status: 500 }
		);
	}
}
