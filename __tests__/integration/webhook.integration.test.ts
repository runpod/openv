import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

// Use test database
const prisma = new PrismaClient({
	datasourceUrl: process.env.DATABASE_URL,
});

// This test requires:
// 1. ngrok running to get public URL
// 2. DATABASE_URL set
// 3. RUNPOD_WEBHOOK_TOKEN set
describe("Webhook Flow Integration Test", () => {
	let ngrokUrl: string;

	beforeAll(async () => {
		// Clean up test database
		await prisma.video.deleteMany({});

		// Get ngrok URL from running ngrok process
		try {
			console.log("Attempting to connect to ngrok API...");
			const response = await fetch("http://localhost:4040/api/tunnels");

			if (!response.ok) {
				throw new Error(`Ngrok API responded with status: ${response.status}`);
			}

			const data = await response.json();
			console.log("Parsed ngrok data:", data);

			if (!data.tunnels || data.tunnels.length === 0) {
				throw new Error("No active ngrok tunnels found");
			}

			ngrokUrl = data.tunnels[0].public_url;
			console.log("Using ngrok URL:", ngrokUrl);

			// Verify webhook token is set
			if (!process.env.RUNPOD_WEBHOOK_TOKEN) {
				throw new Error("RUNPOD_WEBHOOK_TOKEN is not set");
			}
		} catch (error) {
			console.error("Detailed error when setting up test:", error);
			throw error;
		}
	});

	afterAll(async () => {
		await prisma.video.deleteMany({});
		await prisma.$disconnect();
	});

	it("should handle webhook callback and update video status", async () => {
		try {
			// 1. Create a video entry in the database (simulating a job creation)
			const testJobId = "test-job-" + Date.now();
			console.log("Creating video with jobId:", testJobId);

			const video = await prisma.video.create({
				data: {
					jobId: testJobId,
					userId: "test-user-integration",
					prompt: "test prompt integration",

					modelName: "test-model",
					frames: 7,
					status: "queued",
					width: 512,
					height: 512,
					seed: 42,
					steps: 10,
					cfg: 7,
				},
			});

			console.log("Created test video entry:", video);

			// Verify video was created
			const checkVideo = await prisma.video.findUnique({
				where: { jobId: testJobId },
			});
			console.log("Verified video exists:", checkVideo);

			if (!checkVideo) {
				throw new Error("Video was not created in database");
			}

			// 2. Send a webhook request (simulating RunPod's callback)
			console.log("Sending webhook request with jobId:", testJobId);
			const webhookResponse = await fetch(
				`${ngrokUrl}/api/runpod/webhook?token=${process.env.RUNPOD_WEBHOOK_TOKEN}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						id: testJobId,
						status: "COMPLETED",
						output: {
							result: "https://example.com/test-video.mp4",
							status: "DONE",
						},
					}),
				}
			);

			console.log("Webhook response status:", webhookResponse.status);

			if (!webhookResponse.ok) {
				const errorText = await webhookResponse.text();
				console.error("Webhook request failed:", errorText);
				throw new Error(
					`Webhook request failed with status ${webhookResponse.status}: ${errorText}`
				);
			}

			// 3. Verify the database was updated
			const updatedVideo = await prisma.video.findUnique({
				where: { jobId: testJobId },
			});

			console.log("Updated video entry:", updatedVideo);

			expect(updatedVideo?.status).toBe("completed");
			expect(updatedVideo?.url).toBe("https://example.com/test-video.mp4");
		} catch (error) {
			console.error("Test failed:", error);
			if (error instanceof Error) {
				console.error("Error stack:", error.stack);
			}
			throw error;
		}
	}, 30000);

	it("should return 404 when jobId doesn't exist", async () => {
		try {
			const nonExistentJobId = "non-existent-job-" + Date.now();
			console.log("Testing with non-existent jobId:", nonExistentJobId);

			// Send webhook request with non-existent jobId
			const webhookResponse = await fetch(
				`${ngrokUrl}/api/runpod/webhook?token=${process.env.RUNPOD_WEBHOOK_TOKEN}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						id: nonExistentJobId,
						status: "COMPLETED",
						output: {
							result: "https://example.com/test-video.mp4",
							status: "DONE",
						},
					}),
				}
			);

			console.log("Webhook response status:", webhookResponse.status);
			const responseBody = await webhookResponse.json();
			console.log("Webhook response body:", responseBody);

			// Verify we get a 404 response
			expect(webhookResponse.status).toBe(404);
			expect(responseBody.error).toBe(`Video not found with jobId: ${nonExistentJobId}`);
		} catch (error) {
			console.error("Test failed:", error);
			if (error instanceof Error) {
				console.error("Error stack:", error.stack);
			}
			throw error;
		}
	}, 30000);

	it("should reject webhook requests with invalid token", async () => {
		try {
			// Create a test video
			const testJobId = "test-job-" + Date.now();
			await prisma.video.create({
				data: {
					jobId: testJobId,
					userId: "test-user-integration",
					prompt: "test prompt integration",
					modelName: "test-model",
					frames: 7,
					status: "queued",
					width: 512,
					height: 512,
					seed: 42,
					steps: 10,
					cfg: 7,
				},
			});

			// Send webhook request with invalid token
			const webhookResponse = await fetch(
				`${ngrokUrl}/api/runpod/webhook?token=invalid-token`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						id: testJobId,
						status: "COMPLETED",
						output: {
							result: "https://example.com/test-video.mp4",
							status: "DONE",
						},
					}),
				}
			);

			const responseBody = await webhookResponse.json();

			// Verify we get a 401 unauthorized response
			expect(webhookResponse.status).toBe(401);
			expect(responseBody.error).toBe("Unauthorized");

			// Verify the video status was not updated
			const video = await prisma.video.findUnique({
				where: { jobId: testJobId },
			});
			expect(video?.status).toBe("queued");
			expect(video?.url).toBeNull();
		} catch (error) {
			console.error("Test failed:", error);
			if (error instanceof Error) {
				console.error("Error stack:", error.stack);
			}
			throw error;
		}
	}, 30000);
});
