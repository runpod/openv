// Mock implementations
import { auth } from "@clerk/nextjs/server";
import { PrismaClient, Video } from "@prisma/client";

import { DELETE, GET } from "@/app/api/videos/route";

// Define mock types
type MockPrismaVideo = {
	findMany: jest.Mock;
	findUnique: jest.Mock;
	delete: jest.Mock;
};

type MockPrisma = {
	video: MockPrismaVideo;
	$connect: jest.Mock;
	$disconnect: jest.Mock;
};

// Mock declarations must be at the top level
jest.mock("@clerk/nextjs/server", () => ({
	auth: jest.fn(() => Promise.resolve({ userId: "test-user-id" })),
}));

jest.mock("next/server", () => ({
	NextResponse: {
		json: jest.fn().mockImplementation((data: unknown, init?: { status?: number }) => ({
			status: init?.status || 200,
			json: async () => data,
		})),
	},
}));

// Mock PrismaClient
const mockVideo = {
	findMany: jest.fn(),
	findUnique: jest.fn(),
	delete: jest.fn(),
};

jest.mock("@prisma/client", () => {
	const video = {
		findMany: jest.fn(),
		findUnique: jest.fn(),
		delete: jest.fn(),
	};

	return {
		PrismaClient: jest.fn().mockImplementation(() => ({
			video,
			$connect: jest.fn(),
			$disconnect: jest.fn(),
		})),
	};
});

// Request mock with proper types
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

// Override global Request for tests
global.Request = MockRequest as any;

describe("Videos API Routes", () => {
	let prisma: MockPrisma;

	beforeEach(() => {
		jest.clearAllMocks();
		// Get a fresh instance of the PrismaClient mock
		prisma = new PrismaClient() as unknown as MockPrisma;
	});

	describe("GET /api/videos", () => {
		it("should return user's videos", async () => {
			const mockVideos: Video[] = [
				{
					id: 1,
					jobId: "test-job-1",
					userId: "test-user-id",
					prompt: "test prompt 1",
					status: "completed",
					createdAt: new Date(),
					updatedAt: new Date(),
					modelName: null,
					duration: null,
					url: null,
					error: null,
				},
				{
					id: 2,
					jobId: "test-job-2",
					userId: "test-user-id",
					prompt: "test prompt 2",
					status: "processing",
					createdAt: new Date(),
					updatedAt: new Date(),
					modelName: null,
					duration: null,
					url: null,
					error: null,
				},
			];

			prisma.video.findMany.mockResolvedValue(mockVideos);

			const response = await GET();
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual(mockVideos);
			expect(prisma.video.findMany).toHaveBeenCalledWith({
				where: { userId: "test-user-id" },
				orderBy: { createdAt: "desc" },
			});
		});

		it("should return 401 when user is not authenticated", async () => {
			(auth as jest.Mock).mockResolvedValueOnce({ userId: null });

			const response = await GET();
			expect(response.status).toBe(401);
		});

		it("should handle database errors", async () => {
			prisma.video.findMany.mockRejectedValue(new Error("Database error"));

			const response = await GET();
			expect(response.status).toBe(500);
		});
	});

	describe("DELETE /api/videos", () => {
		const mockVideo: Video = {
			id: 1,
			jobId: "test-job-1",
			userId: "test-user-id",
			prompt: "test prompt",
			status: "completed",
			createdAt: new Date(),
			updatedAt: new Date(),
			modelName: null,
			duration: null,
			url: null,
			error: null,
		};

		it("should delete a video", async () => {
			prisma.video.findUnique.mockResolvedValue(mockVideo);
			prisma.video.delete.mockResolvedValue(mockVideo);

			const request = new Request("http://localhost:3000/api/videos", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: 1 }),
			});

			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual({ success: true });
			expect(prisma.video.delete).toHaveBeenCalledWith({
				where: { id: 1 },
			});
		});

		it("should return 401 when user is not authenticated", async () => {
			(auth as jest.Mock).mockResolvedValueOnce({ userId: null });

			const request = new Request("http://localhost:3000/api/videos", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: 1 }),
			});

			const response = await DELETE(request);
			expect(response.status).toBe(401);
		});

		it("should return 400 when video ID is invalid", async () => {
			const request = new Request("http://localhost:3000/api/videos", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: "invalid" }),
			});

			const response = await DELETE(request);
			expect(response.status).toBe(400);
		});

		it("should return 404 when video is not found", async () => {
			prisma.video.findUnique.mockResolvedValue(null);

			const request = new Request("http://localhost:3000/api/videos", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: 999 }),
			});

			const response = await DELETE(request);
			expect(response.status).toBe(404);
		});

		it("should return 403 when user tries to delete another user's video", async () => {
			prisma.video.findUnique.mockResolvedValue({
				...mockVideo,
				userId: "other-user-id",
			});

			const request = new Request("http://localhost:3000/api/videos", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: 1 }),
			});

			const response = await DELETE(request);
			expect(response.status).toBe(403);
		});

		it("should handle database errors", async () => {
			prisma.video.findUnique.mockRejectedValue(new Error("Database error"));

			const request = new Request("http://localhost:3000/api/videos", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: 1 }),
			});

			const response = await DELETE(request);
			expect(response.status).toBe(500);
		});

		it("should handle invalid JSON in request body", async () => {
			const request = new Request("http://localhost:3000/api/videos", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: "invalid json",
			});

			const response = await DELETE(request);
			expect(response.status).toBe(400);
		});
	});
});
