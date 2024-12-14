import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import RunPod from "runpod-sdk";

import prisma from "@/lib/prisma";
import { ratelimitConfig } from "@/lib/ratelimiter";

// Initialize RunPod client
const runpod = new RunPod(process.env.RUNPOD_API_KEY);
const endpoint = runpod.endpoint(process.env.RUNPOD_ENDPOINT_ID);

// Retry function with exponential backoff
async function retryWithExponentialBackoff<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	baseDelay = 1000
): Promise<T> {
	let lastError: Error | null = null;

	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			const delay = baseDelay * Math.pow(2, i);
			await new Promise(resolve => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

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
		const session = await auth();
		const userId = session?.userId;
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse request body
		const body = await request.json();
		const { prompt, modelName, frames, input } = body;

		if (!prompt) {
			return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
		}

		// Validate webhook token
		const webhookToken = process.env.RUNPOD_WEBHOOK_TOKEN;
		if (!webhookToken) {
			return NextResponse.json({ error: "Webhook token not configured" }, { status: 500 });
		}

		// Create webhook URL
		const appUrl = process.env.NEXT_PUBLIC_APP_URL;
		if (!appUrl) {
			return NextResponse.json({ error: "App URL not configured" }, { status: 500 });
		}

		const webhookUrl = new URL("/api/runpod/webhook", appUrl);
		webhookUrl.searchParams.set("token", webhookToken);

		// Submit job to RunPod
		const response = await retryWithExponentialBackoff(async () => {
			const result = await endpoint.run({
				input,
				webhook: webhookUrl.toString(),
			});

			if (!result?.id) {
				throw new Error("Invalid RunPod response: missing job ID");
			}

			return result;
		});

		// Create video record
		const video = await prisma.video.create({
			data: {
				jobId: response.id,
				userId,
				prompt,
				modelName,
				frames,
				status: "queued",
				...(input.negative_prompt && {
					negativePrompt: input.negative_prompt,
				}),
				...(input.width && { width: input.width }),
				...(input.height && { height: input.height }),
				...(input.seed && { seed: input.seed }),
				...(input.steps && { steps: input.steps }),
				...(input.cfg && { cfg: input.cfg }),
			},
		});

		return NextResponse.json(video);
	} catch (error: any) {
		console.error("Error submitting RunPod job:", error);
		return NextResponse.json(
			{ error: error?.message || "Failed to submit RunPod job" },
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

		// Get health status
		const health = await retryWithExponentialBackoff(async () => {
			const result = await endpoint.healthCheck();
			return { status: result?.status || "unhealthy" };
		});

		return NextResponse.json(health);
	} catch (error: any) {
		console.error("Error fetching RunPod health:", error);
		return NextResponse.json(
			{ error: error?.message || "Failed to fetch RunPod health" },
			{ status: error?.status || 500 }
		);
	}
}
