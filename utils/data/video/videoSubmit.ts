import type { video } from "@prisma/client";
import RunpodSdk from "runpod-sdk";

import prisma from "@/lib/prisma";

// Initialize RunPod client
const runpod = RunpodSdk(process.env.RUNPOD_API_KEY!);
export const endpoint = runpod.endpoint(process.env.RUNPOD_ENDPOINT_ID!);

// Retry function with exponential backoff
async function retryWithExponentialBackoff<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	baseDelay = 250
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

interface RunPodInput {
	positive_prompt: string;
	negative_prompt?: string;
	width?: number;
	height?: number;
	seed?: number;
	steps?: number;
	cfg?: number;
	num_frames: number;
}

interface SubmitToRunPodParams {
	input: RunPodInput;
	webhookUrl: string;
}

// Helper to submit job to RunPod with retries
async function submitToRunPod({ input, webhookUrl }: SubmitToRunPodParams) {
	return retryWithExponentialBackoff(async () => {
		if (!endpoint) {
			throw new Error("RunPod client not initialized");
		}
		const result = await endpoint.run({
			input,
			webhook: webhookUrl,
		});

		if (!result?.id) {
			throw new Error("Invalid RunPod response: missing job ID");
		}

		return result;
	});
}

interface VideoSubmitParams {
	video: video;
	isRetry?: boolean;
}

export async function videoSubmit({ video, isRetry = false }: VideoSubmitParams) {
	try {
		// Prepare RunPod input
		const input: RunPodInput = {
			positive_prompt: video.prompt,
			negative_prompt: video.negativePrompt || undefined,
			width: video.width || undefined,
			height: video.height || undefined,
			seed: video.seed || undefined,
			steps: video.steps || undefined,
			cfg: video.cfg || undefined,
			num_frames: video.frames || 0,
		};

		// Get webhook URL
		const appUrl = process.env.NEXT_PUBLIC_APP_URL;
		const webhookToken = process.env.RUNPOD_WEBHOOK_TOKEN;
		if (!appUrl || !webhookToken) {
			throw new Error("Missing required environment variables");
		}

		const webhookUrl = new URL("/api/runpod/webhook", appUrl);
		webhookUrl.searchParams.set("token", webhookToken);

		// Submit to RunPod
		const response = await submitToRunPod({
			input,
			webhookUrl: webhookUrl.toString(),
		});

		// Update video with jobId in database
		await prisma.video.update({
			where: { id: video.id },
			data: {
				jobId: response.id,
				status: "queued",
				updatedAt: new Date(),
			},
		});

		return { jobId: response.id, error: null };
	} catch (error) {
		console.error("Error submitting RunPod job:", error);

		// Update video status to failed
		try {
			await prisma.video.update({
				where: { id: video.id },
				data: {
					status: "failed",
					error: error instanceof Error ? error.message : "Failed to submit RunPod job",
					updatedAt: new Date(),
				},
			});
		} catch (dbError) {
			console.error("Failed to update video status:", dbError);
		}

		return {
			jobId: null,
			error: error instanceof Error ? error.message : "Failed to submit RunPod job",
		};
	}
}
