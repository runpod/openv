import { NextRequest } from "next/server";

// Set up test environment
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3001";

// Mock environment variables
process.env.RUNPOD_API_KEY = "test_api_key";
process.env.RUNPOD_ENDPOINT_ID = "test_endpoint_id";
process.env.RUNPOD_WEBHOOK_TOKEN = "test_webhook_token";

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
	auth: jest.fn().mockResolvedValue({ userId: "test-user-123" }),
}));

// Mock rate limiter
const mockRateLimit = jest.fn();
jest.mock("@/lib/ratelimiter", () => ({
	ratelimitConfig: {
		enabled: true,
		ratelimit: {
			limit: mockRateLimit,
		},
	},
}));

// Mock Prisma
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
jest.mock("@prisma/client", () => ({
	PrismaClient: jest.fn().mockImplementation(() => ({
		video: {
			create: mockCreate,
			update: mockUpdate,
		},
	})),
}));

// Mock RunPod SDK
const mockRun = jest.fn();
const mockHealthCheck = jest.fn();
const mockEndpoint = {
	run: mockRun,
	healthCheck: mockHealthCheck,
};
jest.mock("runpod-sdk", () => ({
	__esModule: true,
	default: jest.fn().mockReturnValue({
		endpoint: jest.fn().mockReturnValue(mockEndpoint),
	}),
}));

describe("RunPod API Routes", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockRun.mockReset();
		mockCreate.mockReset();
		mockUpdate.mockReset();
		mockRateLimit.mockReset();
		mockHealthCheck.mockReset();
		mockRateLimit.mockResolvedValue({ success: true });
	});

	describe("POST /api/runpod", () => {
		it("should create a new video job", async () => {
			const { POST } = await import("@/app/api/runpod/route");

			// Mock RunPod response
			mockRun.mockResolvedValueOnce({
				id: "test-job-123",
				status: "IN_QUEUE",
			});

			// Mock Prisma response
			const mockVideo = {
				id: 1,
				jobId: "test-job-123",
				userId: "test-user-123",
				prompt: "test prompt",
				status: "queued",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			mockCreate.mockResolvedValueOnce(mockVideo);

			const req = new NextRequest("http://test", {
				method: "POST",
				body: JSON.stringify({
					prompt: "test prompt",
					modelName: "test-model",
					frames: 30,
					input: {
						positive_prompt: "test prompt",
						negative_prompt: "",
						width: 512,
						height: 512,
						seed: 42,
						steps: 20,
						cfg: 7,
						num_frames: 30,
					},
				}),
			});

			const response = await POST(req);
			expect(response.status).toBe(200);

			// Verify RunPod SDK was called with correct webhook URL
			expect(mockRun).toHaveBeenCalledWith({
				input: expect.any(Object),
				webhook: "http://localhost:3001/api/runpod/webhook?token=test_webhook_token",
			});

			// Verify video was created in database
			expect(mockCreate).toHaveBeenCalledWith({
				data: expect.objectContaining({
					jobId: "test-job-123",
					userId: "test-user-123",
					prompt: "test prompt",
					modelName: "test-model",
					frames: 30,
					status: "queued",
					width: 512,
					height: 512,
					seed: 42,
					steps: 20,
					cfg: 7,
				}),
			});

			const data = await response.json();
			expect(data).toEqual(mockVideo);
		});

		it("should handle rate limiting", async () => {
			const { POST } = await import("@/app/api/runpod/route");

			// Mock rate limit failure
			mockRateLimit.mockResolvedValueOnce({ success: false });

			const req = new NextRequest("http://test", {
				method: "POST",
				body: JSON.stringify({
					prompt: "test prompt",
					modelName: "test-model",
					frames: 30,
					input: {
						positive_prompt: "test prompt",
					},
				}),
			});

			const response = await POST(req);
			expect(response.status).toBe(429);
		});

		it("should handle RunPod API errors", async () => {
			const { POST } = await import("@/app/api/runpod/route");

			// Mock RunPod error
			mockRun.mockRejectedValueOnce(new Error("RunPod API error"));

			const req = new NextRequest("http://test", {
				method: "POST",
				body: JSON.stringify({
					prompt: "test prompt",
					modelName: "test-model",
					frames: 30,
					input: {
						positive_prompt: "test prompt",
					},
				}),
			});

			const response = await POST(req);
			expect(response.status).toBe(500);
		}, 10000); // Increase timeout to 10 seconds
	});

	describe("GET /api/runpod", () => {
		it("should get health status", async () => {
			const { GET } = await import("@/app/api/runpod/route");

			// Mock RunPod health check response
			mockHealthCheck.mockResolvedValueOnce({
				status: "healthy",
			});

			const req = new NextRequest("http://test");
			const response = await GET(req);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual({ status: "healthy" });
		}, 10000); // Increase timeout to 10 seconds
	});
});
