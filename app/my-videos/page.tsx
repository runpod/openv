"use client";

import { useEffect, useState } from "react";

import { PromptInput } from "@/components/prompt-input";
import { Toaster } from "@/components/ui/toaster";
import { VideoGrid } from "@/components/video-grid";
import { useVideosStore } from "@/store/video-store";

export default function MyVideosPage() {
	const {
		videos,
		isGenerating,
		setIsGenerating,
		prompt,
		setPrompt,
		videoSettings,
		setVideoSettings,
		seed,
		setSeed,
		isRandomSeed,
		setIsRandomSeed,
		addVideo,
		updateVideoStatus,
		getProcessingCount,
		deleteVideo,
		initialize,
	} = useVideosStore();

	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<"newest" | "oldest" | "name_asc" | "name_desc">(
		"newest"
	);
	const [gridView, setGridView] = useState<"2x2" | "3x3" | "list">("3x3");

	// Initialize store and set mounted state
	useEffect(() => {
		initialize().then(() => setMounted(true));
	}, [initialize]);

	// Poll for video status updates
	useEffect(() => {
		const interval = setInterval(async () => {
			const processingVideos = videos.filter(
				v => v.status === "queued" || v.status === "processing"
			);

			for (const video of processingVideos) {
				try {
					console.log(`🔄 Polling status for video ${video.id} (Job: ${video.jobId})`);
					const response = await fetch(`/api/runpod/${video.jobId}`);

					// Log raw response for debugging
					const responseText = await response.text();
					console.log(`Raw response for video ${video.id}:`, responseText);

					// Try to parse JSON only if we have content
					if (!responseText) {
						console.error(`Empty response for video ${video.id}`);
						continue;
					}

					let data;
					try {
						data = JSON.parse(responseText);
					} catch (parseError) {
						console.error(
							`Failed to parse response for video ${video.id}:`,
							parseError
						);
						continue;
					}

					console.log(`📥 RunPod response for ${video.id}:`, {
						status: data.status,
						output: data.output,
						error: data.error,
					});

					if (!response.ok) {
						console.error(`❌ API error for video ${video.id}:`, data.error);
						updateVideoStatus(video.jobId, "failed");
						continue;
					}

					if (data.status === "COMPLETED") {
						if (data.output?.result) {
							console.log(`✅ Video ${video.id} completed. URL:`, data.output.result);
							updateVideoStatus(video.jobId, "completed", data.output.result);
						} else {
							console.error(
								`❌ No result URL in completed response for video ${video.id}`
							);
							updateVideoStatus(video.jobId, "failed");
						}
					} else if (data.status === "FAILED") {
						console.error(`❌ Job failed for video ${video.id}`);
						updateVideoStatus(video.jobId, "failed");
					} else {
						console.log(`⏳ Video ${video.id} status: ${data.status}`);
					}
				} catch (error) {
					console.error(`💥 Error polling status for video ${video.id}:`, error);
					console.error("Full error details:", {
						name: error.name,
						message: error.message,
						stack: error.stack,
					});
				}
			}
		}, 20000);

		return () => clearInterval(interval);
	}, [videos, updateVideoStatus]);

	const handleGenerate = async () => {
		if (!prompt) return;

		setIsGenerating(true);

		try {
			const response = await fetch("/api/runpod", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt,
					modelName: "mochi-1",
					frames: videoSettings.numFrames,
					input: {
						positive_prompt: prompt,
						negative_prompt: videoSettings.negativePrompt,
						width: videoSettings.width,
						height: videoSettings.height,
						seed: isRandomSeed ? Math.floor(Math.random() * 1000000) : seed,
						steps: videoSettings.steps,
						cfg: videoSettings.cfg,
						num_frames: videoSettings.numFrames,
					},
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to generate video");
			}

			const video = await response.json();
			addVideo(video);
		} catch (error) {
			console.error("Error generating video:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const applyVideoSettings = (video: { prompt: string; frames?: number; seed?: number }) => {
		setPrompt(video.prompt);
		if (video.seed) setSeed(video.seed);
	};

	// Transform videos to queue items
	const queueItems = videos
		.filter(video => video.status === "queued" || video.status === "processing")
		.map(video => ({
			id: video.id.toString(),
			prompt: video.prompt,
			status: "processing" as const,
		}));

	if (!mounted) {
		return null;
	}

	return (
		<div className="h-full min-h-screen w-full bg-background text-foreground mt-16">
			<div className="flex h-full">
				<div className="flex-grow">
					<div className="sticky top-0 z-10 bg-background p-4">
						<div className="max-w-screen-xl mx-auto">
							<PromptInput
								prompt={prompt}
								setPrompt={setPrompt}
								onGenerate={handleGenerate}
								isGenerating={isGenerating}
								processingCount={getProcessingCount()}
								videoSettings={videoSettings}
								setVideoSettings={setVideoSettings}
								seed={seed}
								setSeed={setSeed}
								isRandomSeed={isRandomSeed}
								setIsRandomSeed={setIsRandomSeed}
								queueItems={queueItems}
							/>
						</div>
					</div>
					<div className="py-4 px-4 xl:px-0 2xl:px-16">
						<VideoGrid
							videos={videos}
							gridView={gridView}
							setGridView={setGridView}
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							onDelete={deleteVideo}
							onCopySettings={applyVideoSettings}
							sortOption={sortOption}
							setSortOption={setSortOption}
						/>
					</div>
				</div>
			</div>
			<Toaster />
		</div>
	);
}
