import { NextResponse } from "next/server";

import { auth, requireAuth } from "@/lib/auth";
import { ratelimitConfig } from "@/lib/ratelimiter";
import { createVideo } from "@/utils/data/video/videoCreate";
import { videoSubmit } from "@/utils/data/video/videoSubmit";

export async function POST(request: Request) {
	try {
		// Check rate limit
		if (ratelimitConfig.enabled) {
			const { success } = await ratelimitConfig.ratelimit.limit();
			if (!success) {
				return NextResponse.json({ error: "Too many requests" }, { status: 429 });
			}
		}

		// Get user ID from auth
		const authResult = await auth();
		requireAuth(authResult);
		const { userId } = authResult;

		// Parse request body
		const body = await request.json();
		const { prompt, modelName, frames, input } = body;

		if (!prompt) {
			return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
		}

		// Create initial video record
		const { video: createdVideo, error: createError } = await createVideo({
			userId,
			prompt,
			modelName,
			frames,
			negativePrompt: input.negative_prompt,
			width: input.width,
			height: input.height,
			seed: input.seed,
			steps: input.steps,
			cfg: input.cfg,
		});

		if (createError || !createdVideo) {
			return NextResponse.json(
				{ error: createError || "Failed to create video" },
				{ status: 500 }
			);
		}

		// Submit to RunPod
		const { jobId, error: submitError } = await videoSubmit({
			video: createdVideo,
		});

		if (submitError || !jobId) {
			return NextResponse.json(
				{ error: submitError || "Failed to submit to RunPod" },
				{ status: 500 }
			);
		}

		return NextResponse.json(createdVideo);
	} catch (error: any) {
		if (error.message === "Unauthorized") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		console.error("Error in video generation:", error);
		return NextResponse.json(
			{ error: error?.message || "Internal server error" },
			{ status: error?.status || 500 }
		);
	}
}

export async function GET(request: Request) {
	try {
		// Check if RunPod is configured
		if (!process.env.RUNPOD_API_KEY || !process.env.RUNPOD_ENDPOINT_ID) {
			return NextResponse.json({ error: "RunPod not configured" }, { status: 500 });
		}

		// Get health status using videoSubmit helper's RunPod client
		const health = await endpoint.healthCheck();
		return NextResponse.json({ status: health?.status || "unhealthy" });
	} catch (error: any) {
		console.error("Error fetching RunPod health:", error);
		return NextResponse.json(
			{ error: error?.message || "Failed to fetch RunPod health" },
			{ status: error?.status || 500 }
		);
	}
}
