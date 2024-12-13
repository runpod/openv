import { GET as GET_STATUS } from "@/app/api/runpod/[jobId]/route";
import { GET, POST } from "@/app/api/runpod/route";

// Mock environment variables
process.env.RUNPOD_API_KEY = "test-api-key";
process.env.RUNPOD_ENDPOINT_ID = "test-endpoint-id";

// Mock Next.js modules
jest.mock("next/server", () => ({
	NextResponse: {
		json: jest.fn().mockImplementation((data: unknown, init?: { status?: number }) => ({
			status: init?.status || 200,
			json: async () => data,
		})),
	},
}));

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
	auth: jest.fn(() => ({
		userId: "test-user-id",
	})),
}));

// Mock RunPod SDK
jest.mock("runpod-sdk", () => ({
	__esModule: true,
	default: jest.fn(() => ({
		endpoint: jest.fn(() => ({
			run: jest.fn(() => ({
				id: "test-job-id",
				status: "completed",
			})),
			status: jest.fn(() => ({
				status: "completed",
				output: {
					url: "https://example.com/video.mp4",
				},
			})),
			health: jest.fn(() => ({
				status: "healthy",
			})),
		})),
	})),
}));

// Mock rate limiter
jest.mock("@/lib/ratelimiter", () => ({
	ratelimitConfig: {
		enabled: false,
	},
}));

// Mock video database operations
jest.mock("@/utils/data/video/videoCreate", () => ({
	videoCreate: jest.fn(() => ({
		video: {
			id: 1,
			jobId: "test-job-id",
			userId: "test-user-id",
			prompt: "test prompt",
			status: "queued",
		},
		error: null,
	})),
}));

jest.mock("@/utils/data/video/videoUpdate", () => ({
	videoUpdate: jest.fn(() => ({
		error: null,
	})),
}));

// Mock Request implementation
class MockRequest implements Partial<Request> {
	private body: string;
	readonly method: string;
	readonly headers: Headers;
	readonly url: string;

	constructor(input: string, init?: RequestInit) {
		this.url = input;
		this.method = init?.method || "GET";
		this.headers = new Headers(init?.headers);
		this.body = (init?.body as string) || "";
	}

	async json(): Promise<any> {
		return JSON.parse(this.body);
	}
}

// Mock global Request and Headers
beforeAll(() => {
	global.Request = MockRequest as any;
	if (typeof Headers === "undefined") {
		global.Headers = class Headers extends Map {
			append(key: string, value: string) {
				this.set(key, value);
			}
			get(key: string) {
				return this.get(key);
			}
		} as any;
	}
});

describe("RunPod API Routes", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /api/runpod", () => {
		it("should create a new video job", async () => {
			const request = new Request("http://localhost:3000/api/runpod", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt: "test prompt",
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual({
				id: 1,
				jobId: "test-job-id",
				userId: "test-user-id",
				prompt: "test prompt",
				status: "queued",
			});
		});

		it("should return 400 if prompt is missing", async () => {
			const request = new Request("http://localhost:3000/api/runpod", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({}),
			});

			const response = await POST(request);
			expect(response.status).toBe(400);
		});
	});

	describe("GET /api/runpod", () => {
		it("should get health status", async () => {
			const response = await GET();
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual({
				status: "healthy",
			});
		});
	});

	describe("GET /api/runpod/[jobId]", () => {
		it("should get video job status", async () => {
			const request = new Request("http://localhost:3000/api/runpod/test-job-id");
			const params = Promise.resolve({ jobId: "test-job-id" });

			const response = await GET_STATUS(request, { params });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual({
				status: "completed",
				output: {
					url: "https://example.com/video.mp4",
				},
			});
		});

		it("should return 400 if jobId is missing", async () => {
			const request = new Request("http://localhost:3000/api/runpod/");
			const params = Promise.resolve({});

			const response = await GET_STATUS(request, { params });
			expect(response.status).toBe(400);
		});
	});
});
