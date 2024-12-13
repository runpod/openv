import { NextResponse } from "next/server";
import runpodSdk from "runpod-sdk";

import { videoUpdate } from "@/utils/data/video/videoUpdate";

// Initialize RunPod client
const runpod = runpodSdk(process.env.RUNPOD_API_KEY!) as any;

export async function GET(request: Request, context: { params: Promise<{ jobId: string }> }) {
	try {
		const { jobId } = await context.params;
		console.log("[RunPod Status] Starting request for jobId:", jobId);

		if (!jobId) {
			console.error("[RunPod Status] No jobId provided");
			return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
		}

		if (!process.env.RUNPOD_API_KEY || !process.env.RUNPOD_ENDPOINT_ID) {
			console.error("[RunPod Status] Missing RunPod configuration");
			return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
		}

		try {
			console.log("[RunPod Status] Making RunPod API call for jobId:", jobId);
			const result = await runpod.endpoint(process.env.RUNPOD_ENDPOINT_ID!).status(jobId);
			console.log("[RunPod Status] Raw API response:", JSON.stringify(result, null, 2));

			if (!result) {
				console.error("[RunPod Status] Empty result from RunPod");
				return NextResponse.json({ error: "Empty response from RunPod" }, { status: 500 });
			}

			if ("error" in result) {
				console.error("[RunPod Status] RunPod API error:", result.error);
				console.log("[RunPod Status] Updating video with error status");
				const updateResult = await videoUpdate({
					jobId,
					status: "failed",
					error: result.error,
				});
				console.log("[RunPod Status] Video update result:", updateResult);
				return NextResponse.json({ error: result.error }, { status: 500 });
			}

			// Map RunPod status to our status
			let status = result.status.toLowerCase();
			console.log("[RunPod Status] Original status:", result.status);

			if (status === "in_queue" || status === "queued") status = "queued";
			if (status === "in_progress" || status === "processing") status = "processing";
			if (status === "completed" || status === "done") status = "completed";
			if (status === "failed") status = "failed";
			if (status === "cancelled") status = "failed";
			if (status === "timed_out") status = "failed";

			console.log("[RunPod Status] Mapped status:", status);

			// Update video status in database
			console.log("[RunPod Status] Updating video with status:", {
				jobId,
				status,
				url: result.output?.result,
			});

			const { error: dbError } = await videoUpdate({
				jobId,
				status,
				...(result.output?.result && {
					url: result.output.result,
				}),
			});

			if (dbError) {
				console.error("[RunPod Status] Database error:", dbError);
				return NextResponse.json(
					{ error: "Failed to update video status" },
					{ status: 500 }
				);
			}

			console.log("[RunPod Status] Successfully processed status update");
			return NextResponse.json(result);
		} catch (runpodError) {
			console.error("[RunPod Status] API call error details:", {
				name: runpodError instanceof Error ? runpodError.name : "Unknown",
				message: runpodError instanceof Error ? runpodError.message : "Unknown error",
				stack: runpodError instanceof Error ? runpodError.stack : undefined,
			});

			console.log("[RunPod Status] Updating video with failed status");
			const updateResult = await videoUpdate({
				jobId,
				status: "failed",
				error: runpodError instanceof Error ? runpodError.message : "Unknown error",
			});
			console.log("[RunPod Status] Video update result:", updateResult);

			return NextResponse.json(
				{
					error:
						runpodError instanceof Error
							? runpodError.message
							: "Failed to fetch status",
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("[RunPod Status] Top level error details:", {
			name: error instanceof Error ? error.name : "Unknown",
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		});
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
}
