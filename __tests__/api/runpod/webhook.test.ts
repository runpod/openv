import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// Mock environment variables
process.env.RUNPOD_WEBHOOK_TOKEN = "test_webhook_token";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

describe("RunPod Webhook Unit Tests", () => {
	// Clean up database before each test
	beforeEach(async () => {
		await prisma.video.deleteMany({});
	});

	// Clean up database after all tests
	afterAll(async () => {
		await prisma.video.deleteMany({});
		await prisma.$disconnect();
	});

	// Helper function to create test video
	async function createTestVideo(jobId: string) {
		return await prisma.video.create({
			data: {
				jobId,
				userId: "test-user-123",
				prompt: "test prompt",
				status: "queued",
			},
		});
	}

	// Helper function to create webhook request
	function createWebhookRequest(body: any, token?: string): NextRequest {
		const url = new URL("/api/runpod/webhook", "http://localhost:3000");
		if (token) {
			url.searchParams.set("token", token);
		}

		return new NextRequest(url, {
			method: "POST",
			body: JSON.stringify(body),
		});
	}

	describe("Authentication", () => {
		it("should reject requests without a token", async () => {
			const { POST } = await import("@/app/api/runpod/webhook/route");
			await createTestVideo("test-job-auth-1");

			const req = createWebhookRequest({
				id: "test-job-auth-1",
				status: "completed",
			});

			const response = await POST(req);
			expect(response.status).toBe(401);
		});

		it("should reject requests with invalid token", async () => {
			const { POST } = await import("@/app/api/runpod/webhook/route");
			await createTestVideo("test-job-auth-2");

			const req = createWebhookRequest(
				{
					id: "test-job-auth-2",
					status: "completed",
				},
				"invalid_token"
			);

			const response = await POST(req);
			expect(response.status).toBe(401);
		});

		it("should accept requests with valid token", async () => {
			const { POST } = await import("@/app/api/runpod/webhook/route");
			await createTestVideo("test-job-auth-3");

			const req = createWebhookRequest(
				{
					id: "test-job-auth-3",
					status: "completed",
					output: {
						result: "https://example.com/video.mp4",
					},
				},
				process.env.RUNPOD_WEBHOOK_TOKEN
			);

			const response = await POST(req);
			expect(response.status).toBe(200);
		});
	});

	describe("Status Updates", () => {
		it("should update video status to processing", async () => {
			const { POST } = await import("@/app/api/runpod/webhook/route");
			await createTestVideo("test-job-status-1");

			const req = createWebhookRequest(
				{
					id: "test-job-status-1",
					status: "IN_PROGRESS",
				},
				process.env.RUNPOD_WEBHOOK_TOKEN
			);

			await POST(req);

			const video = await prisma.video.findUnique({
				where: { jobId: "test-job-status-1" },
			});

			expect(video?.status).toBe("processing");
		});

		it("should update video status to completed with URL", async () => {
			const { POST } = await import("@/app/api/runpod/webhook/route");
			await createTestVideo("test-job-status-2");

			const req = createWebhookRequest(
				{
					id: "test-job-status-2",
					status: "COMPLETED",
					output: {
						result: "https://example.com/video.mp4",
					},
				},
				process.env.RUNPOD_WEBHOOK_TOKEN
			);

			await POST(req);

			const video = await prisma.video.findUnique({
				where: { jobId: "test-job-status-2" },
			});

			expect(video?.status).toBe("completed");
			expect(video?.url).toBe("https://example.com/video.mp4");
		});

		it("should update video status to failed with error", async () => {
			const { POST } = await import("@/app/api/runpod/webhook/route");
			await createTestVideo("test-job-status-3");

			const req = createWebhookRequest(
				{
					id: "test-job-status-3",
					status: "FAILED",
					error: "Something went wrong",
				},
				process.env.RUNPOD_WEBHOOK_TOKEN
			);

			await POST(req);

			const video = await prisma.video.findUnique({
				where: { jobId: "test-job-status-3" },
			});

			expect(video?.status).toBe("failed");
			expect(video?.error).toBe("Something went wrong");
		});
	});

	describe("Error Handling", () => {
		it("should handle non-existent jobId", async () => {
			const { POST } = await import("@/app/api/runpod/webhook/route");

			const req = createWebhookRequest(
				{
					id: "non-existent-job",
					status: "COMPLETED",
				},
				process.env.RUNPOD_WEBHOOK_TOKEN
			);

			const response = await POST(req);
			expect(response.status).toBe(500);
		});

		it("should handle invalid status values", async () => {
			const { POST } = await import("@/app/api/runpod/webhook/route");
			await createTestVideo("test-job-error-1");

			const req = createWebhookRequest(
				{
					id: "test-job-error-1",
					status: "INVALID_STATUS",
				},
				process.env.RUNPOD_WEBHOOK_TOKEN
			);

			const response = await POST(req);
			expect(response.status).toBe(400);

			const video = await prisma.video.findUnique({
				where: { jobId: "test-job-error-1" },
			});

			// Should not update status if invalid
			expect(video?.status).toBe("queued");
		});

		it("should handle malformed request body", async () => {
			const { POST } = await import("@/app/api/runpod/webhook/route");

			const req = new NextRequest(
				"http://localhost:3000/api/runpod/webhook?token=" +
					process.env.RUNPOD_WEBHOOK_TOKEN,
				{
					method: "POST",
					body: "invalid json",
				}
			);

			const response = await POST(req);
			expect(response.status).toBe(500);
		});
	});
});
