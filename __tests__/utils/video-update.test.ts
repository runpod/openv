import { PrismaClient } from "@prisma/client";

import { videoUpdate } from "@/utils/data/video/videoUpdate";

// Create a mock type for PrismaClient
type MockPrismaClient = {
	video: {
		update: jest.Mock;
	};
} & PrismaClient;

describe("videoUpdate", () => {
	let mockPrisma: MockPrismaClient;

	beforeEach(() => {
		// Create a fresh mock for each test
		mockPrisma = {
			video: {
				update: jest.fn(),
			},
		} as MockPrismaClient;
	});

	it("should successfully update a video with status", async () => {
		const mockVideo = {
			id: 1,
			jobId: "test-job-id",
			status: "completed",
			updatedAt: new Date(),
		};

		mockPrisma.video.update.mockResolvedValueOnce(mockVideo);

		const result = await videoUpdate(
			{
				jobId: "test-job-id",
				status: "completed",
			},
			mockPrisma
		);

		expect(mockPrisma.video.update).toHaveBeenCalledWith({
			where: { jobId: "test-job-id" },
			data: expect.objectContaining({
				status: "completed",
				updatedAt: expect.any(Date),
			}),
		});

		expect(result).toEqual({
			video: mockVideo,
			error: null,
		});
	});

	it("should successfully update a video with url", async () => {
		const mockVideo = {
			id: 1,
			jobId: "test-job-id",
			url: "https://example.com/video.mp4",
			updatedAt: new Date(),
		};

		mockPrisma.video.update.mockResolvedValueOnce(mockVideo);

		const result = await videoUpdate(
			{
				jobId: "test-job-id",
				url: "https://example.com/video.mp4",
			},
			mockPrisma
		);

		expect(mockPrisma.video.update).toHaveBeenCalledWith({
			where: { jobId: "test-job-id" },
			data: expect.objectContaining({
				url: "https://example.com/video.mp4",
				updatedAt: expect.any(Date),
			}),
		});

		expect(result).toEqual({
			video: mockVideo,
			error: null,
		});
	});

	it("should successfully update a video with error message", async () => {
		const mockVideo = {
			id: 1,
			jobId: "test-job-id",
			error: "Test error message",
			updatedAt: new Date(),
		};

		mockPrisma.video.update.mockResolvedValueOnce(mockVideo);

		const result = await videoUpdate(
			{
				jobId: "test-job-id",
				error: "Test error message",
			},
			mockPrisma
		);

		expect(mockPrisma.video.update).toHaveBeenCalledWith({
			where: { jobId: "test-job-id" },
			data: expect.objectContaining({
				error: "Test error message",
				updatedAt: expect.any(Date),
			}),
		});

		expect(result).toEqual({
			video: mockVideo,
			error: null,
		});
	});

	it("should handle missing jobId", async () => {
		const result = await videoUpdate(
			{
				jobId: "",
				status: "completed",
			},
			mockPrisma
		);

		expect(mockPrisma.video.update).not.toHaveBeenCalled();
		expect(result).toEqual({
			video: null,
			error: "jobId is required",
		});
	});

	it("should handle Prisma errors", async () => {
		const mockError = new Error("Prisma error");
		mockPrisma.video.update.mockRejectedValueOnce(mockError);

		const result = await videoUpdate(
			{
				jobId: "test-job-id",
				status: "completed",
			},
			mockPrisma
		);

		expect(mockPrisma.video.update).toHaveBeenCalled();
		expect(result).toEqual({
			video: null,
			error: "Prisma error",
		});
	});

	it("should handle non-existent video", async () => {
		mockPrisma.video.update.mockRejectedValueOnce(new Error("Record to update not found."));

		const result = await videoUpdate(
			{
				jobId: "non-existent-job-id",
				status: "completed",
			},
			mockPrisma
		);

		expect(mockPrisma.video.update).toHaveBeenCalled();
		expect(result).toEqual({
			video: null,
			error: "Record to update not found.",
		});
	});
});
