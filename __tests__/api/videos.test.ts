import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
	auth: jest.fn().mockResolvedValue({ userId: "test-user-id" }),
}));

// Mock Prisma
const mockFindMany = jest.fn();
const mockDeleteMany = jest.fn();
jest.mock("@prisma/client", () => ({
	PrismaClient: jest.fn().mockImplementation(() => ({
		video: {
			findMany: mockFindMany,
			deleteMany: mockDeleteMany,
		},
	})),
}));

const prisma = new PrismaClient();

describe("Videos API Unit Tests", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFindMany.mockReset();
		mockDeleteMany.mockReset();
	});

	describe("GET /api/videos", () => {
		const testDate = new Date("2024-01-01T00:00:00Z");
		const mockVideos = [
			{
				id: 1,
				jobId: "test-job-1",
				userId: "test-user-id",
				prompt: "test prompt 1",
				status: "completed",
				createdAt: testDate.toISOString(),
				updatedAt: testDate.toISOString(),
			},
			{
				id: 2,
				jobId: "test-job-2",
				userId: "test-user-id",
				prompt: "test prompt 2",
				status: "processing",
				createdAt: testDate.toISOString(),
				updatedAt: testDate.toISOString(),
			},
		];

		it("should return user's videos", async () => {
			const { GET } = await import("@/app/api/videos/route");

			// Mock Prisma response
			mockFindMany.mockResolvedValueOnce(mockVideos);

			const req = new NextRequest("http://test");
			const response = await GET(req);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data).toEqual(mockVideos);
			expect(mockFindMany).toHaveBeenCalledWith({
				where: { userId: "test-user-id" },
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					jobId: true,
					userId: true,
					prompt: true,
					status: true,
					url: true,
					frames: true,
					createdAt: true,
				},
			});
		});

		it("should handle unauthorized requests", async () => {
			const { GET } = await import("@/app/api/videos/route");

			// Mock unauthorized user
			(jest.requireMock("@clerk/nextjs/server").auth as jest.Mock).mockResolvedValueOnce({
				userId: null,
			});

			const req = new NextRequest("http://test");
			const response = await GET(req);

			expect(response.status).toBe(401);
		});

		it("should handle database errors", async () => {
			const { GET } = await import("@/app/api/videos/route");

			// Mock database error
			mockFindMany.mockRejectedValueOnce(new Error("Database error"));

			const req = new NextRequest("http://test");
			const response = await GET(req);

			expect(response.status).toBe(500);
		});
	});

	describe("DELETE /api/videos", () => {
		it("should delete videos by jobIds", async () => {
			const { DELETE } = await import("@/app/api/videos/route");

			// Mock successful deletion
			mockDeleteMany.mockResolvedValueOnce({ count: 2 });

			const req = new NextRequest("http://test", {
				method: "DELETE",
				body: JSON.stringify({
					jobIds: ["test-job-1", "test-job-2"],
				}),
			});

			const response = await DELETE(req);
			expect(response.status).toBe(200);

			expect(mockDeleteMany).toHaveBeenCalledWith({
				where: {
					jobId: {
						in: ["test-job-1", "test-job-2"],
					},
					userId: "test-user-id",
				},
			});
		});

		it("should handle database errors", async () => {
			const { DELETE } = await import("@/app/api/videos/route");

			// Mock database error
			mockDeleteMany.mockRejectedValueOnce(new Error("Database error"));

			const req = new NextRequest("http://test", {
				method: "DELETE",
				body: JSON.stringify({
					jobIds: ["test-job-1"],
				}),
			});

			const response = await DELETE(req);
			expect(response.status).toBe(500);
		});

		it("should handle invalid request body", async () => {
			const { DELETE } = await import("@/app/api/videos/route");

			const req = new NextRequest("http://test", {
				method: "DELETE",
				body: "invalid json",
			});

			const response = await DELETE(req);
			expect(response.status).toBe(400);
		});
	});
});
