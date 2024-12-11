"use client";

import { useEffect, useState } from "react";

import { PromptInput } from "@/components/prompt-input";
import { Toaster } from "@/components/ui/toaster";
import VideoGrid from "@/components/video-grid";
import { useVideosStore } from "@/hooks/use-videos-store";
import { Video } from "@/types";

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

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
		updateVideoJobId,
		updateVideoStatus,
		getProcessingCount,
		deleteVideo,
	} = useVideosStore();

	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<SortOption>("newest");
	const [gridView, setGridView] = useState<"2x2" | "3x3" | "list">("3x3");

	useEffect(() => {
		setMounted(true);
	}, []);

	// Poll for video status updates
	useEffect(() => {
		const interval = setInterval(async () => {
			const generatingVideos = videos.filter(v => v.status === "generating" && v.jobId);

			for (const video of generatingVideos) {
				try {
					console.log(`🔄 Polling status for video ${video.id} (Job: ${video.jobId})`);
					const response = await fetch(`/api/runpod/${video.jobId}`);
					const data = await response.json();

					console.log(`📥 RunPod response for ${video.id}:`, {
						status: data.status,
						output: data.output,
						error: data.error,
					});

					if (!response.ok) {
						console.error(`❌ API error for video ${video.id}:`, data.error);
						updateVideoStatus(video.id, "failed");
						continue;
					}

					if (data.status === "COMPLETED") {
						if (data.output?.result) {
							console.log(`✅ Video ${video.id} completed. URL:`, data.output.result);
							updateVideoStatus(video.id, "completed", data.output.result);
						} else {
							console.error(
								`❌ No result URL in completed response for video ${video.id}`
							);
							updateVideoStatus(video.id, "failed");
						}
					} else if (data.status === "FAILED") {
						console.error(`❌ Job failed for video ${video.id}`);
						updateVideoStatus(video.id, "failed");
					} else {
						console.log(`⏳ Video ${video.id} status: ${data.status}`);
					}
				} catch (error) {
					console.error(`💥 Error polling status for video ${video.id}:`, error);
				}
			}
		}, 20000);

		return () => clearInterval(interval);
	}, [videos, updateVideoStatus]);

	const handleGenerate = async () => {
		if (!prompt) return;

		setIsGenerating(true);

		const id = new Date().getTime().toString();
		const currentSeed = isRandomSeed ? Math.floor(Math.random() * 1000000) : seed;

		const newVideo: Video = {
			id,
			prompt,
			frames: videoSettings.numFrames,
			url: "",
			seed: currentSeed,
			status: "generating",
			enhancePrompt: false,
			jobId: "",
			createdAt: new Date().toISOString(),
		};

		addVideo(newVideo);

		try {
			const response = await fetch("/api/runpod", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					input: {
						positive_prompt: prompt,
						negative_prompt: videoSettings.negativePrompt,
						width: videoSettings.width,
						height: videoSettings.height,
						seed: currentSeed,
						steps: videoSettings.steps,
						cfg: videoSettings.cfg,
						num_frames: videoSettings.numFrames,
					},
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to generate video");
			}

			updateVideoJobId(id, data.id);
			updateVideoStatus(id, "generating");
		} catch (error) {
			console.error("Error generating video:", error);
			updateVideoStatus(id, "failed");
		} finally {
			setIsGenerating(false);
		}
	};

	const applyVideoSettings = (video: { prompt: string; frames: number; seed: number }) => {
		setPrompt(video.prompt);
	};

	// Transform videos to queue items
	const queueItems = videos
		.filter(video => video.status === "generating")
		.map(video => ({
			id: video.id,
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
