import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { auth, requireAuth } from "@/lib/auth";
import { validateVideoInput } from "@/lib/models/config";
import { checkConcurrentJobs } from "@/utils/data/video/videoCheck";
import { createVideo } from "@/utils/data/video/videoCreate";
import { videoSubmit } from "@/utils/data/video/videoSubmit";

export async function POST(request: Request) {
	try {
		// Get user ID from auth
		const authResult = await auth();
		requireAuth(authResult);
		const { userId } = authResult;

		// Check concurrent jobs
		const { count, allowed, error } = await checkConcurrentJobs(userId);
		if (!allowed) {
			return NextResponse.json({ error, count }, { status: 409 });
		}

		// Parse and validate request body
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

		// Create initial video record
		const { video: createdVideo, error: createError } = await createVideo({
			userId,
			prompt: validatedInput.prompt,
			modelName: validatedInput.modelName,
			frames: validatedInput.input.num_frames,
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

		// Get updated job count after successful creation
		const { count: updatedCount } = await checkConcurrentJobs(userId);
		return NextResponse.json({ ...createdVideo, count: updatedCount });
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
