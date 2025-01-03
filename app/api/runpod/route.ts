import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { getModelConfig, validateVideoInput } from "@/lib/models/config";
import { checkUserRole, checkVideoLimit, incrementVideoUsage } from "@/lib/user";
import { checkConcurrentJobs } from "@/utils/data/video/videoCheck";
import { createVideo } from "@/utils/data/video/videoCreate";
import { videoSubmit } from "@/utils/data/video/videoSubmit";

export async function POST(request: Request) {
	try {
		// Get user ID from auth
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		// Check user role
		const roleCheck = await checkUserRole(userId, UserRole.user);
		if ("error" in roleCheck) {
			return NextResponse.json({ message: roleCheck.error }, { status: roleCheck.status });
		}

		// Validate the request based on the given model
		const body = await request.json();
		let validatedInput;
		try {
			validatedInput = validateVideoInput(body);
		} catch (e) {
			if (e instanceof ZodError) {
				return NextResponse.json(
					{
						error: "Validation failed",
						details: e.errors.map(err => ({
							field: err.path.join("."),
							message: err.message,
						})),
					},
					{ status: 400 }
				);
			}
			throw e;
		}

		// Calculate duration in seconds based on frames and fps
		const fps = getModelConfig(validatedInput.modelName).fps;
		const durationInSeconds = validatedInput.input.num_frames / fps;

		// Get model config for frame limits
		const modelConfig = getModelConfig(validatedInput.modelName);
		const limits = modelConfig.limits;

		// Check monthly limit
		const { allowed, remainingSeconds, suggestedFrames } = await checkVideoLimit(
			userId,
			durationInSeconds,
			fps,
			limits.numFrames.min,
			limits.numFrames.max
		);

		if (!allowed) {
			return NextResponse.json(
				{
					error: "Monthly limit exceeded",
					message: `You have ${remainingSeconds.toFixed(2)} seconds remaining in your monthly quota`,
					suggestedFrames,
				},
				{ status: 403 }
			);
		}

		// If there's a suggested frame count, use that instead
		const finalFrameCount = suggestedFrames || validatedInput.input.num_frames;
		const finalDuration = finalFrameCount / fps;

		// Check concurrent jobs
		const {
			count,
			allowed: concurrentAllowed,
			error: concurrentError,
		} = await checkConcurrentJobs(userId);
		if (!concurrentAllowed) {
			return NextResponse.json({ error: concurrentError, count }, { status: 409 });
		}

		// Create initial video record
		const { video: createdVideo, error: createError } = await createVideo({
			userId,
			prompt: validatedInput.prompt,
			modelName: validatedInput.modelName,
			frames: finalFrameCount,
			negativePrompt: validatedInput.input.negative_prompt,
			width: validatedInput.input.width,
			height: validatedInput.input.height,
			seed: validatedInput.input.seed,
			steps: validatedInput.input.steps,
			cfg: validatedInput.input.cfg,
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

		// Increment monthly usage with the final duration
		await incrementVideoUsage(userId, finalDuration);

		// Get updated job count after successful creation
		const { count: updatedCount } = await checkConcurrentJobs(userId);

		// Get monthly limit from env for response
		const monthlyLimitSeconds = parseInt(process.env.MONTHLY_LIMIT_SECONDS || "60", 10);
		const currentUsage = monthlyLimitSeconds - (remainingSeconds - finalDuration);

		return NextResponse.json({
			...createdVideo,
			count: updatedCount,
			monthlyQuota: {
				remainingSeconds: remainingSeconds - finalDuration,
				currentUsage,
				limitSeconds: monthlyLimitSeconds,
			},
		});
	} catch (error: any) {
		console.error("Error in video generation:", error);
		return NextResponse.json(
			{ error: error?.message || "Internal server error" },
			{ status: error?.status || 500 }
		);
	}
}
