import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

describe("Videos API Integration Test", () => {
	const TEST_USER_ID = "test-user-videos-integration";
	const TEST_MODEL = "test-model";
	const TEST_FRAMES = 7;

	// Helper function to create a test video
	async function createTestVideo(prompt: string) {
		return await prisma.video.create({
			data: {
				jobId: `test-job-${prompt}-${Date.now()}`,
				userId: TEST_USER_ID,
				prompt,
				status: "completed",
				modelName: TEST_MODEL,
				frames: TEST_FRAMES,
			},
		});
	}

	// Helper function to make requests
	async function makeRequest(url: string, options: any = {}) {
		const headers = {
			"Content-Type": "application/json",
			...options.headers,
		};

		return fetch(url, {
			...options,
			headers,
		});
	}

	beforeAll(async () => {
		// Clean up any existing test data
		await prisma.video.deleteMany({
			where: {
				userId: TEST_USER_ID,
			},
		});

		console.log("Attempting to connect to ngrok API...");
		const ngrokResponse = await fetch("http://localhost:4040/api/tunnels");
		const ngrokData = await ngrokResponse.json();
		console.log("Parsed ngrok data:", ngrokData);

		const tunnel = ngrokData.tunnels.find(
			(t: any) => t.proto === "https" && t.name === "command_line"
		);
		if (!tunnel) {
			throw new Error("No HTTPS tunnel found in ngrok");
		}

		console.log("Using ngrok URL:", tunnel.public_url);
		process.env.NEXT_PUBLIC_APP_URL = tunnel.public_url;
	});

	afterAll(async () => {
		// Clean up test data
		await prisma.video.deleteMany({
			where: {
				userId: TEST_USER_ID,
			},
		});
		await prisma.$disconnect();
	});

	it("should correctly handle updatedSince parameter and return only updated videos", async () => {
		try {
			// Create initial test videos
			const video1 = await createTestVideo("test prompt 1");
			const video2 = await createTestVideo("test prompt 2");
			console.log("Created initial videos:", [video1, video2]);

			// Get initial timestamp
			const initialTimestamp = new Date().getTime();

			// Wait a moment to ensure timestamps are different
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Update one video
			const updatedVideo = await prisma.video.update({
				where: { id: video1.id },
				data: { status: "failed" },
			});
			console.log("Updated video:", updatedVideo);

			// Create a new video after the update
			const video3 = await createTestVideo("test prompt 3");
			console.log("Created new video:", video3);

			// Fetch all videos first to verify the setup
			const allVideosResponse = await makeRequest(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/videos`
			);

			if (!allVideosResponse.ok) {
				const errorBody = await allVideosResponse.text();
				console.log("Error response body:", errorBody);
				throw new Error(`Failed to fetch all videos: ${allVideosResponse.statusText}`);
			}

			const allVideos = await allVideosResponse.json();
			expect(allVideos.length).toBe(3);

			// Fetch only updated videos
			const updatedVideosResponse = await makeRequest(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/videos?updatedSince=${initialTimestamp}`
			);
			expect(updatedVideosResponse.ok).toBe(true);

			const updatedVideos = await updatedVideosResponse.json();
			expect(updatedVideos.length).toBe(2); // Should include the updated video and the new video
			const updatedVideoInResponse = updatedVideos.find((v: any) => v.id === video1.id);
			expect(updatedVideoInResponse).toBeTruthy();
			expect(updatedVideoInResponse?.status).toBe("failed");
		} catch (error) {
			console.error("Test failed:", error);
			if (error instanceof Error) {
				console.error("Error stack:", error.stack);
			}
			throw error;
		}
	});

	it("should handle invalid updatedSince parameter gracefully", async () => {
		try {
			// Test with invalid timestamp
			const invalidTimestampResponse = await makeRequest(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/videos?updatedSince=invalid`
			);
			expect(invalidTimestampResponse.status).toBe(400);
			const invalidTimestampData = await invalidTimestampResponse.json();
			expect(invalidTimestampData.error).toBe("Invalid updatedSince parameter");

			// Test with future timestamp
			const futureTimestamp = new Date().getTime() + 1000000;
			const futureTimestampResponse = await makeRequest(
				`${process.env.NEXT_PUBLIC_APP_URL}/api/videos?updatedSince=${futureTimestamp}`
			);
			expect(futureTimestampResponse.ok).toBe(true);
			const futureTimestampData = await futureTimestampResponse.json();
			expect(futureTimestampData.length).toBe(0);
		} catch (error) {
			console.error("Test failed:", error);
			if (error instanceof Error) {
				console.error("Error stack:", error.stack);
			}
			throw error;
		}
	});
});
