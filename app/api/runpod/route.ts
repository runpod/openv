import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import runpodSdk from "runpod-sdk";

import { ratelimitConfig } from "@/lib/ratelimiter";
import { videoCreate } from "@/utils/data/video/videoCreate";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function retryWithExponentialBackoff(
	fn: () => Promise<any>,
	retries = MAX_RETRIES,
	delay = INITIAL_RETRY_DELAY
) {
	try {
		return await fn();
	} catch (error: any) {
		if (retries === 0 || error?.status !== 429) throw error;

		await new Promise(resolve => setTimeout(resolve, delay));
		return retryWithExponentialBackoff(fn, retries - 1, delay * 2);
	}
}

export async function POST(request: Request) {
	const { userId } = await auth();
	const API_KEY = process.env.RUNPOD_API_KEY;
	const ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;

	if (!API_KEY || !ENDPOINT_ID) {
		return NextResponse.json({ error: "RunPod configuration is missing" }, { status: 500 });
	}

	try {
		// Rate limiting check
		if (ratelimitConfig.enabled && ratelimitConfig.ratelimit) {
			const { success } = await ratelimitConfig.ratelimit.limit(userId);
			if (!success) {
				return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
			}
		}

		const body = await request.json();
		const { prompt, modelName, frames, input } = body;

		if (!prompt) {
			return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
		}

		const runpod = runpodSdk(API_KEY);
		const endpoint = runpod.endpoint(ENDPOINT_ID);

		if (!endpoint) {
			return NextResponse.json(
				{ error: "Failed to connect to RunPod endpoint" },
				{ status: 500 }
			);
		}

		// Call RunPod with retry logic
		const result = await retryWithExponentialBackoff(async () => {
			return await endpoint.run({
				input: {
					positive_prompt: input.positive_prompt,
					negative_prompt: input.negative_prompt || "",
					width: input.width,
					height: input.height,
					seed: input.seed,
					steps: input.steps,
					cfg: input.cfg,
					num_frames: input.num_frames,
				},
			});
		});

		// Store job in database
		const { video, error: dbError } = await videoCreate({
			jobId: result.id,
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

		if (dbError) {
			console.error("Database error:", dbError);
			return NextResponse.json({ error: "Failed to store video job" }, { status: 500 });
		}

		return NextResponse.json(video);
	} catch (error: any) {
		console.error("Error submitting RunPod job:", error);
		return NextResponse.json(
			{ error: error?.message || "Failed to submit RunPod job" },
			{ status: error?.status || 500 }
		);
	}
}

export async function GET() {
	const { userId } = await auth();
	const API_KEY = process.env.RUNPOD_API_KEY;
	const ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;

	if (!API_KEY || !ENDPOINT_ID) {
		return NextResponse.json({ error: "RunPod configuration is missing" }, { status: 500 });
	}

	try {
		const runpod = runpodSdk(API_KEY);
		const endpoint = runpod.endpoint(ENDPOINT_ID);

		if (!endpoint) {
			return NextResponse.json(
				{ error: "Failed to connect to RunPod endpoint" },
				{ status: 500 }
			);
		}

		const health = await endpoint.health();
		return NextResponse.json(health);
	} catch (error: any) {
		console.error("Error fetching RunPod health:", error);
		return NextResponse.json(
			{ error: error?.message || "Failed to fetch RunPod health" },
			{ status: error?.status || 500 }
		);
	}
}
