import { NextResponse } from "next/server";
import runpodSdk from "runpod-sdk";

// Initialize RunPod client
const runpod = runpodSdk(process.env.RUNPOD_API_KEY!) as any;

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
	const { jobId } = await params;

	if (!jobId) {
		return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
	}

	if (!process.env.RUNPOD_API_KEY || !process.env.RUNPOD_ENDPOINT_ID) {
		console.error("Missing RunPod configuration");
		return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
	}

	try {
		const result = await runpod.endpoint(process.env.RUNPOD_ENDPOINT_ID!).status(jobId);

		if ("error" in result) {
			console.error("RunPod API error:", result.error);
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("RunPod status error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to fetch status" },
			{ status: 500 }
		);
	}
}
